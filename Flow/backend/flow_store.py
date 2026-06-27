"""
flow_store.py — the single source of truth for flow data.

It parses the `data/` folder (Mermaid topology + YAML cards + the index registry)
into ONE canonical representation that is consumed two ways:

  * the agent (agent.py) reads `Flow` / `Node` objects to answer questions, and
  * the canvas (flow-loader.js) fetches the JSON emitted by `flow_to_dict` /
    `load_bundle` over the `/api/flows` endpoints (see app.py).

Previously the frontend re-implemented this parsing in JavaScript. Now there is
exactly one parser; the browser just deserializes what this module produces, so
the two can no longer drift.

Files per flow:
  data/<id>.flow.mmd    Mermaid topology  — nodes (id + kind via :::class) + edges
  data/<id>.cards.yaml  Card content      — owner/team/sla/desc/io/steps/docs + grid pos
  data/index.yaml       Registry          — navigator order, groups, sub-flow nesting
"""
from __future__ import annotations

import os
import re
import glob
import yaml
from dataclasses import dataclass, field
from functools import lru_cache

DATA_DIR = os.environ.get("FLOW_DATA_DIR", "../data")

# ───────────────────────────── Mermaid parsing ───────────────────────────────
# Node line, e.g.:  kyc["KYC & Identity Verification"]:::system
#   id   shape-open  "label"  shape-close   :::class
_NODE_RE = re.compile(
    r'^\s*([A-Za-z0-9_]+)\s*'                # id
    r'[\(\[\{/]+\s*"([^"]*)"\s*[\)\]\}/]+'   # "label" inside any shape bracket
    r'(?:\s*:::\s*([A-Za-z0-9_]+))?'         # optional :::class
)

# Edge lines — order matters: try the labelled/reject forms before the plain ones.
_EDGE_RES = [
    # reject, labelled:  A -- Label --x B
    (re.compile(r'^(\w+)\s*--\s*"?(.*?)"?\s*--x\s*(\w+)$'), "reject", True),
    # reject, plain:     A --x B
    (re.compile(r'^(\w+)\s*--x\s*(\w+)$'),                  "reject", False),
    # normal, labelled:  A -->|Label| B
    (re.compile(r'^(\w+)\s*-->\s*\|\s*"?(.*?)"?\s*\|\s*(\w+)$'), None, True),
    # normal, plain:     A --> B
    (re.compile(r'^(\w+)\s*-->\s*(\w+)$'),                  None, False),
]

# Mermaid :::class -> (frontend node "type", terminal "term"|None)
_CLASS = {
    "system":   ("system",   None),
    "manual":   ("manual",   None),
    "decision": ("decision", None),
    "start":    ("terminal", "start"),
    "end":      ("terminal", "end"),
    "declined": ("terminal", "declined"),
}


@dataclass
class Node:
    id: str
    title: str
    type: str = "system"
    term: str | None = None          # "start" | "end" | "declined" | None
    # grid position — None means "let the layout engine auto-place me"
    col: int | None = None
    lane: int | None = None
    pinned: bool = False
    owner: str | None = None
    team: str | None = None
    sla: str | None = None
    desc: str | None = None
    inputs: list = field(default_factory=list)
    outputs: list = field(default_factory=list)
    steps: list = field(default_factory=list)
    documents: list = field(default_factory=list)   # [{name,format,status,link}]
    links: list = field(default_factory=list)        # [{label,url}]
    subflow: str | None = None

    def search_blob(self) -> str:
        parts = [self.title, self.owner or "", self.team or "", self.desc or "",
                 *self.inputs, *self.outputs, *self.steps,
                 *[d.get("name", "") for d in self.documents]]
        return " ".join(p for p in parts if p).lower()


@dataclass
class Edge:
    frm: str
    to: str
    label: str | None = None
    kind: str | None = None          # "reject" | None


@dataclass
class Flow:
    id: str
    name: str
    subtitle: str
    nodes: list[Node]
    edges: list[Edge] = field(default_factory=list)

    @property
    def by_id(self) -> dict[str, Node]:
        return {n.id: n for n in self.nodes}


# ───────────────────────── content normalization ─────────────────────────────
# documents may be a bare string ("Sanction Letter") or {name,format,status,link}
def _normalize_docs(raw) -> list[dict]:
    if not isinstance(raw, list):
        return []
    out = []
    for d in raw:
        if isinstance(d, str):
            out.append({"name": d, "format": None, "status": None, "link": None})
        elif isinstance(d, dict):
            name = d.get("name") or d.get("title") or "Untitled"
            out.append({
                "name": name,
                "format": d.get("format") or d.get("type"),
                "status": d.get("status"),
                "link": d.get("link") or d.get("url"),
            })
    return [d for d in out if d["name"]]


# links may be a bare URL or {label,url}
def _normalize_links(raw) -> list[dict]:
    if not isinstance(raw, list):
        return []
    out = []
    for l in raw:
        if isinstance(l, str):
            out.append({"label": l, "url": l})
        elif isinstance(l, dict):
            out.append({
                "label": l.get("label") or l.get("title") or l.get("url") or "Link",
                "url": l.get("url") or l.get("href") or "#",
            })
    return [l for l in out if l["url"]]


# ───────────────────────────── per-flow parsing ──────────────────────────────
def _parse_mmd(path: str) -> tuple[dict[str, Node], list[Edge]]:
    nodes: dict[str, Node] = {}
    edges: list[Edge] = []
    with open(path, encoding="utf-8") as f:
        for raw in f:
            s = raw.strip()
            if not s or s.startswith("%%"):
                continue
            if re.match(r"^(flowchart|graph|classDef|linkStyle|class |subgraph|end$|direction)", s):
                continue
            # edges first (they also contain ids that would confuse the node regex)
            edge = _match_edge(s)
            if edge:
                edges.append(edge)
                continue
            m = _NODE_RE.match(s)
            if not m:
                continue
            nid, label, klass = m.group(1), m.group(2), m.group(3) or "system"
            ntype, term = _CLASS.get(klass, ("system", None))
            nodes[nid] = Node(id=nid, title=label, type=ntype, term=term)
    return nodes, edges


def _match_edge(s: str) -> Edge | None:
    for rx, kind, labelled in _EDGE_RES:
        m = rx.match(s)
        if not m:
            continue
        if labelled:
            frm, label, to = m.group(1), (m.group(2) or "").strip() or None, m.group(3)
        else:
            frm, to, label = m.group(1), m.group(2), None
        return Edge(frm=frm, to=to, label=label, kind=kind)
    return None


def _merge_cards(nodes: dict[str, Node], path: str) -> tuple[str, str]:
    with open(path, encoding="utf-8") as f:
        doc = yaml.safe_load(f) or {}
    meta = doc.get("flow", {})
    for nid, card in (doc.get("cards") or {}).items():
        n = nodes.get(nid)
        if not n or not isinstance(card, dict):
            continue
        for k in ("owner", "team", "sla", "desc", "subflow"):
            if card.get(k) is not None:
                setattr(n, k, card[k])
        for k in ("inputs", "outputs", "steps"):
            if card.get(k):
                setattr(n, k, card[k])
        n.documents = _normalize_docs(card.get("documents"))
        n.links = _normalize_links(card.get("links"))
        pos = card.get("pos") or {}
        if pos.get("col") is not None and pos.get("lane") is not None:
            n.col, n.lane, n.pinned = pos["col"], pos["lane"], True
    return meta.get("name", ""), meta.get("subtitle", "")


@lru_cache(maxsize=None)
def load_flow(flow_id: str) -> Flow | None:
    mmd = os.path.join(DATA_DIR, f"{flow_id}.flow.mmd")
    cards = os.path.join(DATA_DIR, f"{flow_id}.cards.yaml")
    if not os.path.exists(mmd):
        return None
    nodes, edges = _parse_mmd(mmd)
    name, subtitle = ("", "")
    if os.path.exists(cards):
        name, subtitle = _merge_cards(nodes, cards)
    return Flow(id=flow_id, name=name or flow_id, subtitle=subtitle,
                nodes=list(nodes.values()), edges=edges)


def list_flows() -> list[str]:
    return [os.path.basename(p).replace(".flow.mmd", "")
            for p in glob.glob(os.path.join(DATA_DIR, "*.flow.mmd"))]


# ───────────────────────── registry / navigator ──────────────────────────────
@lru_cache(maxsize=1)
def _load_index() -> dict:
    path = os.path.join(DATA_DIR, "index.yaml")
    if not os.path.exists(path):
        # no registry → synthesize a flat one from whatever flow files exist
        return {"flows": [{"id": fid} for fid in list_flows()]}
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def _registry_entries(idx: dict) -> list[dict]:
    if isinstance(idx.get("flows"), list):
        return idx["flows"]
    if isinstance(idx.get("order"), list):
        return [{"id": i} for i in idx["order"]]
    return []


def _collect_ids(entries: list, out: list[str]) -> list[str]:
    for e in entries:
        eid = e if isinstance(e, str) else e.get("id")
        if eid:
            out.append(eid)
        if isinstance(e, dict) and isinstance(e.get("children"), list):
            _collect_ids(e["children"], out)
    return out


# ───────────────────────────── JSON serializers ──────────────────────────────
# Shapes here MUST match what flow-loader.js used to build, so the canvas,
# layout.js and nodes.jsx consume them unchanged.
def node_to_dict(n: Node) -> dict:
    return {
        "id": n.id, "type": n.type, "term": n.term, "title": n.title,
        "col": n.col, "lane": n.lane, "pinned": n.pinned,
        "subflow": n.subflow,
        "owner": n.owner, "team": n.team, "sla": n.sla, "desc": n.desc,
        "inputs": list(n.inputs), "outputs": list(n.outputs), "steps": list(n.steps),
        "documents": n.documents, "links": n.links,
    }


def edge_to_dict(e: Edge) -> dict:
    d = {"from": e.frm, "to": e.to}
    if e.label:
        d["label"] = e.label
    if e.kind:
        d["kind"] = e.kind
    return d


def flow_to_dict(flow: Flow) -> dict:
    return {
        "id": flow.id,
        "name": flow.name,
        "subtitle": flow.subtitle,
        "nodes": [node_to_dict(n) for n in flow.nodes],
        "edges": [edge_to_dict(e) for e in flow.edges],
    }


def load_bundle() -> dict:
    """Everything the canvas needs in one payload: parsed flows keyed by id,
    the top-level order, and the grouped/nested navigator tree."""
    idx = _load_index()
    entries = _registry_entries(idx)
    all_ids = _collect_ids(entries, [])

    flows: dict[str, dict] = {}
    for fid in all_ids:
        f = load_flow(fid)
        if f:
            flows[fid] = flow_to_dict(f)

    order = [(e if isinstance(e, str) else e.get("id")) for e in entries]
    order = [i for i in order if i in flows]

    def to_nav_item(e) -> dict:
        eid = e if isinstance(e, str) else e.get("id")
        f = flows.get(eid)
        name = (f and f["name"]) or (isinstance(e, dict) and e.get("name")) or eid
        children = e.get("children", []) if isinstance(e, dict) else []
        return {
            "id": eid, "name": name, "missing": f is None,
            "children": [to_nav_item(c) for c in children],
        }

    groups: list[dict] = []
    by_name: dict = {}
    for e in entries:
        g = e.get("group") if isinstance(e, dict) else None
        if g not in by_name:
            grp = {"group": g, "items": []}
            by_name[g] = grp
            groups.append(grp)
        by_name[g]["items"].append(to_nav_item(e))

    return {"flows": flows, "order": order, "nav": groups}


def reload_data() -> None:
    """Drop caches so the next request re-reads the data folder from disk."""
    load_flow.cache_clear()
    _load_index.cache_clear()
