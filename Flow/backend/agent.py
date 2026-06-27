"""
agent.py — produces (answer_text, ref_node_ids) for a question about one flow.

Two implementations share the same signature so app.py can swap them:

  * stream_agent(flow, question, on_token)  -> list[str]   (LangChain + OpenAI)
  * answer_rule_based(flow, question)       -> (str, list[str])   (no API key)

The list of ref node-ids is what the frontend turns into jump-to-canvas chips.
In the LangChain path the refs come from whatever the `lookup_steps` tool
resolved during the run — exactly the pattern sketched in chat-agent.jsx.
"""
from __future__ import annotations

import os
from flow_store import Flow, Node


# ───────────────────────── shared retrieval ──────────────────────────────
_DEICTIC = (
    "this step", "this node", "the node", "the step", "this one", "that one",
    "current", "currently", "selected", "highlighted", "looking at", "on screen",
    "on-screen", "in front of me", "open right now", "i'm on", "im on",
)


def is_deictic(query: str) -> bool:
    """True when the user is pointing at whatever step is OPEN on the canvas
    ("this step", "the node I'm looking at") rather than naming one."""
    q = query.lower()
    if any(phrase in q for phrase in _DEICTIC):
        return True
    # bare "this"/"here"/"open" as a standalone word also counts
    return any(w in ("this", "here", "open") for w in re_split(q))


def node_by_id(flow: Flow, node_id) -> Node | None:
    if not node_id:
        return None
    return next((n for n in flow.nodes if n.id == node_id), None)


def find_nodes(flow: Flow, query: str, limit: int = 4, active: Node | None = None) -> list[Node]:
    """Cheap lexical match of a query against node title/owner/desc/steps.

    When `active` is given and the question is deictic ("this step", "the node
    I'm looking at"), the open node is pinned to the FRONT of results so the
    answer is about what the user is actually staring at — not a keyword guess."""
    q = query.lower()
    terms = [t for t in re_split(q) if len(t) > 2]
    scored = []
    for n in flow.nodes:
        blob = n.search_blob()
        title_hit = 3 if n.title.lower() in q or q in n.title.lower() else 0
        score = title_hit + sum(blob.count(t) for t in terms)
        if score:
            scored.append((score, n))
    scored.sort(key=lambda x: -x[0])
    hits = [n for _, n in scored[:limit]]
    if active is not None and is_deictic(query):
        hits = [active] + [n for n in hits if n.id != active.id]
        hits = hits[:limit] if limit else hits
    return hits


def re_split(s: str) -> list[str]:
    import re
    return re.findall(r"[a-z0-9]+", s)


def _card_facts(n: Node) -> str:
    bits = [f"id={n.id}", f"title={n.title!r}", f"type={n.type}"]
    if n.owner: bits.append(f"owner={n.owner} ({n.team})")
    if n.sla: bits.append(f"sla={n.sla}")
    if n.desc: bits.append(f"desc={n.desc}")
    if n.inputs: bits.append(f"inputs={', '.join(n.inputs)}")
    if n.outputs: bits.append(f"outputs={', '.join(n.outputs)}")
    if n.steps: bits.append(f"steps={'; '.join(n.steps)}")
    if n.documents: bits.append(f"documents={', '.join(d.get('name','') for d in n.documents)}")
    if n.subflow: bits.append(f"has_subflow={n.subflow}")
    return " | ".join(bits)


# ───────────────────── rule-based fallback (no LLM) ───────────────────────
def answer_rule_based(flow: Flow, question: str, active_id=None) -> tuple[str, list[str]]:
    active = node_by_id(flow, active_id)
    hits = find_nodes(flow, question, limit=4, active=active)
    if not hits:
        names = ", ".join(f"“{n.title}”" for n in flow.nodes[:4])
        return (f"“{flow.name}” has {len(flow.nodes)} steps — e.g. {names}. "
                f"Ask about a step's owner, SLA, inputs, outputs, or documents.", [])
    top = hits[0]
    q = question.lower()
    if any(w in q for w in ("who", "owner", "owns", "team", "responsible")):
        txt = f"“{top.title}” is owned by {top.owner or '—'}" + (f" ({top.team} team)." if top.team else ".")
    elif any(w in q for w in ("sla", "how long", "turnaround", "duration", "time")):
        txt = f"“{top.title}” has an SLA of {top.sla or '—'}."
    elif any(w in q for w in ("input", "need", "require")):
        txt = f"“{top.title}” takes: {', '.join(top.inputs) or '—'}."
    elif any(w in q for w in ("output", "produce", "result", "emit")):
        txt = f"“{top.title}” produces: {', '.join(top.outputs) or '—'}."
    elif any(w in q for w in ("document", "doc", "paperwork", "artifact")):
        d = top.documents
        txt = (f"“{top.title}” produces {len(d)} document(s): {', '.join(x.get('name','') for x in d)}."
               if d else f"“{top.title}” doesn't produce a tracked document.")
    else:
        txt = f"{top.desc or top.title}" + (f"\n\nOwned by {top.owner}." if top.owner else "")
    return txt, [n.id for n in hits[:3]]


# ───────────────────── LangChain agent (async streaming) ──────────────────
def compute_refs(flow: Flow, question: str, active_id=None) -> list[str]:
    """Resolve which node ids an answer is about. Fast, sync, no LLM —
    these become the frontend's jump-to-canvas chips."""
    active = node_by_id(flow, active_id)
    return [n.id for n in find_nodes(flow, question, limit=3, active=active)]


async def astream_agent(flow: Flow, question: str, history=None, active_id=None):
    """
    Async generator yielding answer tokens. Grounds the model in the matched
    cards (lightweight RAG over this one flow). Requires OPENAI_API_KEY.
    Pair it with compute_refs() for the metadata.refs the frontend needs.
    """
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

    active = node_by_id(flow, active_id)
    matched = find_nodes(flow, question, limit=5, active=active)
    context = "\n".join(_card_facts(n) for n in matched) or "(no specific step matched)"

    focus = ""
    if active is not None:
        focus = (
            f"\n\nThe user currently has the step “{active.title}” (id={active.id}) "
            f"OPEN on the canvas. If they say “this”, “this step/node”, “the current "
            f"step”, or “the one I'm looking at”, they mean THAT step — answer about "
            f"it specifically."
        )

    system = SystemMessage(content=(
        f"You are the assistant for the business process flow “{flow.name}”"
        f"{(' — ' + flow.subtitle) if flow.subtitle else ''}. "
        f"It has {len(flow.nodes)} steps. Answer ONLY from the step facts provided. "
        f"Be concise and concrete: name owners, SLAs, inputs/outputs, decision branches. "
        f"If a step has a sub-flow, mention they can drill into it. "
        f"Do not invent steps, owners, or numbers.{focus}\n\n"
        f"Relevant steps:\n{context}"
    ))
    msgs = [system]
    for h in (history or []):
        if h.get("q"):
            msgs.append(HumanMessage(content=h["q"]))
        if h.get("a"):
            msgs.append(AIMessage(content=h["a"]))
    msgs.append(HumanMessage(content=question))

    llm = ChatOpenAI(model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                     temperature=0.2, streaming=True)
    async for chunk in llm.astream(msgs):
        if chunk.content:
            yield chunk.content
