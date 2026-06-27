/* Flow Assistant — side-drawer chat bot.
 *
 * UI is self-contained. The agent is swappable: `sendToAgent(message, ctx)` is the
 * ONLY seam between this prototype and a real backend. Right now it resolves a
 * context-aware MOCK built from the live flow data. To go live, replace the body
 * of sendToAgent with a fetch() to your LangChain endpoint — nothing else changes.
 *
 *   async function sendToAgent(message, ctx) {
 *     const r = await fetch("https://your-backend/api/chat", {
 *       method: "POST", headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ message, history: ctx.history, flowId: ctx.flow.id }),
 *     });
 *     const data = await r.json();             // { reply, refs?: [nodeId] }
 *     return { text: data.reply, refs: (data.refs || []).map(id => ctx.byId[id]).filter(Boolean) };
 *   }
 *
 * Exports: window.ChatPanel, window.ChatToggle, window.CHAT_W
 */

const CHAT_W = 384;

/* ============================================================= *
 *  AGENT SEAM  —  swap this function for a real LangChain call  *
 * ============================================================= */
async function sendToAgent(message, ctx) {
  // simulate network / model latency so the UX matches a real round-trip
  await new Promise((res) => setTimeout(res, 480 + Math.random() * 420));
  return mockAgent(message, ctx);
}

/* ---- mock agent: reasons over the current flow's nodes ---- */
const STOP = new Set("the a an of to in on for and or is are was do does what who whom which where when why how this that it its me my our your i you we can will would should could many much long take takes happen happens flow node nodes step steps process show tell give about please".split(" "));

function mockAgent(raw, ctx) {
  const { flow, byId, activeNode } = ctx;
  const nodes = flow.nodes;
  const q = raw.toLowerCase();
  const words = (q.match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2 && !STOP.has(w));
  const ref = (n) => ({ id: n.id, title: n.title, type: n.type, term: n.term });

  const byType = (t) => nodes.filter((n) => n.type === t);
  const matches = scoreNodes(words, nodes);
  let top = matches[0];

  // "the node I'm looking at" — deictic references resolve to the node the user
  // currently has OPEN on the canvas (passed in from app.jsx as activeNode), not
  // a keyword guess. This is the seam that makes the assistant context-aware.
  const deictic = isDeictic(q);
  if (deictic && activeNode) top = activeNode;

  const has = (...ks) => ks.some((k) => q.includes(k));

  // --- greetings ---
  if (/^\s*(hi|hey|hello|yo|sup|good (morning|afternoon|evening))\b/.test(q)) {
    return { text: `Hi — I'm the assistant for the “${flow.name}” flow. Ask me who owns a step, where it can get declined, how many manual touches there are, or just “walk me through it.”` };
  }

  // --- walkthrough / overview ---
  if (has("walk me", "walk through", "overview", "summary", "summarise", "summarize", "explain the flow", "whole flow", "end to end", "end-to-end")) {
    const start = nodes.find((n) => n.term === "start") || nodes[0];
    const end = nodes.find((n) => n.term === "end");
    const decisions = byType("decision");
    return {
      text: `“${flow.name}” runs ${nodes.length} steps from ${start ? `“${start.title}”` : "intake"} to ${end ? `“${end.title}”` : "completion"}. Along the way there are ${decisions.length} decision gate${decisions.length === 1 ? "" : "s"} that branch the path. Tap any chip to jump to it on the canvas.`,
      refs: [start, ...decisions.slice(0, 2), end].filter(Boolean).map(ref),
    };
  }

  // --- counts / composition ---
  if (has("how many", "count", "number of") || (has("composition", "breakdown") )) {
    if (has("manual", "human")) return { text: `${byType("manual").length} step${byType("manual").length === 1 ? " is" : "s are"} manual (human-in-the-loop).`, refs: byType("manual").map(ref) };
    if (has("decision", "gate", "branch")) return { text: `There are ${byType("decision").length} decision gates.`, refs: byType("decision").map(ref) };
    if (has("system", "auto")) return { text: `${byType("system").length} steps are automated/systemic.`, refs: byType("system").map(ref) };
    return {
      text: `${nodes.length} steps total — ${byType("system").length} systemic, ${byType("manual").length} manual, ${byType("decision").length} decision gates, ${byType("terminal").length} terminal.`,
    };
  }

  // --- decline / reject paths ---
  if (has("decline", "declined", "reject", "rejected", "fail", "fall out", "fallout", "adverse")) {
    const ends = nodes.filter((n) => n.term === "declined");
    const gates = byType("decision");
    return {
      text: ends.length
        ? `Applications can fall out at the ${gates.length} decision gate${gates.length === 1 ? "" : "s"} and end at ${ends.map((e) => `“${e.title}”`).join(", ")}.`
        : `This flow has ${gates.length} decision gate${gates.length === 1 ? "" : "s"} where a case can branch.`,
      refs: [...gates, ...ends].map(ref),
    };
  }

  // --- list decision gates ---
  if (has("decision", "gate", "branch") && !top) {
    const gates = byType("decision");
    return { text: `The decision gates are:`, refs: gates.map(ref) };
  }

  // --- manual / automated listings ---
  if (has("manual", "human") && !top) return { text: `Manual, human-in-the-loop steps:`, refs: byType("manual").map(ref) };
  if (has("automat", "systemic", "system step", "no touch", "straight through", "straight-through") && !top) return { text: `Automated / systemic steps:`, refs: byType("system").map(ref) };

  // --- a specific node matched: answer the field they asked about ---
  // (must run BEFORE the generic "documents" listing — otherwise a node whose
  //  title contains a trigger word, e.g. "Document Upload", hijacks owner/SLA
  //  questions and the generic branch answers the wrong thing.)
  if (top) {
    if (has("who", "owner", "owns", "responsible", "team")) {
      return { text: `“${top.title}” is owned by ${top.owner}${top.team ? ` (${top.team} team)` : ""}.`, refs: [ref(top)] };
    }
    if (has("sla", "how long", "time", "duration", "turnaround", "take")) {
      return { text: `“${top.title}” has an SLA of ${top.sla || "—"}.`, refs: [ref(top)] };
    }
    if (has("input", "need", "require", "depend")) {
      return { text: `“${top.title}” takes: ${(top.inputs || []).join(", ") || "—"}.`, refs: [ref(top)] };
    }
    if (has("output", "result", "emit", "return")) {
      return { text: `“${top.title}” produces: ${(top.outputs || []).join(", ") || "—"}.`, refs: [ref(top)] };
    }
    if (has("document", "docs", "paperwork", "artifact", "artefact")) {
      const d = top.documents || [];
      return { text: d.length ? `“${top.title}” produces ${d.length} document${d.length === 1 ? "" : "s"}: ${d.map((x) => x.name).join(", ")}.` : `“${top.title}” doesn't produce a tracked document.`, refs: [ref(top)] };
    }
    // default: describe it
    const extra = top.sla ? ` SLA ${top.sla}.` : "";
    return { text: `${top.desc || top.title}\n\nOwned by ${top.owner}${top.team ? ` · ${top.team}` : ""}.${extra}`, refs: [ref(top)] };
  }

  // --- documents produced across the flow (no single node strongly matched) ---
  if (has("document", "docs", "paperwork", "artifact", "artefact", "output file")) {
    const withDocs = nodes.filter((n) => n.documents && n.documents.length);
    const total = withDocs.reduce((s, n) => s + n.documents.length, 0);
    return { text: `${total} documents are produced across ${withDocs.length} steps. The producers:`, refs: withDocs.map(ref) };
  }

  // --- owners overview ---
  if (has("who", "owner", "owns", "team", "responsible")) {
    const teams = [...new Set(nodes.map((n) => n.team).filter(Boolean))];
    return { text: `Ownership spans ${teams.length} teams: ${teams.join(", ")}. Name a step and I'll tell you exactly who owns it.` };
  }

  // --- start / end ---
  if (has("start", "begin", "first", "entry", "kick off")) {
    const s = nodes.find((n) => n.term === "start") || nodes[0];
    return { text: `It starts at “${s.title}” — ${s.desc}`, refs: [ref(s)] };
  }
  if (has("end", "final", "last", "finish", "complete", "disburse")) {
    const e = nodes.find((n) => n.term === "end") || nodes[nodes.length - 1];
    return { text: `It ends at “${e.title}” — ${e.desc}`, refs: [ref(e)] };
  }

  // --- fallback ---
  return {
    text: `I didn't catch a specific step there. I can help with anything in “${flow.name}” — for example:`,
    suggestions: suggestionsFor(flow),
  };
}

/* deictic = the user is pointing at whatever step is open on screen rather than
 * naming one. e.g. "this step", "the node I'm looking at", "what does this do". */
function isDeictic(q) {
  return /\b(this|current|currently|selected|highlighted|here|open)\b/.test(q)
    || /\b(looking at|on screen|on-screen|in front of me|i'?m on|this one|that one)\b/.test(q)
    || q.includes("the node") || q.includes("the step") || q.includes("this node") || q.includes("this step");
}

function scoreNodes(words, nodes) {
  if (!words.length) return [];
  return nodes
    .map((n) => {
      const title = n.title.toLowerCase();
      const hay = `${title} ${n.id} ${(n.owner || "").toLowerCase()} ${(n.desc || "").toLowerCase()}`;
      let s = 0;
      for (const w of words) {
        if (title.includes(w)) s += 3;
        else if (hay.includes(w)) s += 1;
      }
      return { n, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.n);
}

function suggestionsFor(flow) {
  const owned = flow.nodes.find((n) => n.type !== "terminal" && n.owner);
  return [
    "Walk me through this flow",
    owned ? `Who owns “${owned.title}”?` : "Who owns each step?",
    "Where can it get declined?",
    "How many manual steps are there?",
  ];
}

/* ============================================================= *
 *  ChatShell — pure presentational drawer.                       *
 *  Source-agnostic: the mock agent OR a live @chainlit session    *
 *  feed it the same { messages, thinking, onSend } shape.         *
 * ============================================================= */
function ChatShell({ flow, palette, accent, open, onClose, onJump, messages, thinking, onSend, suggestions, status }) {
  const { useState, useRef, useEffect } = React;
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const st = status || {};

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const submit = (text) => {
    const msg = (text != null ? text : draft).trim();
    if (!msg || thinking) return;
    setDraft("");
    onSend(msg);
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  if (!open) return null;
  const showStarters = messages.filter((m) => m.role === "user").length === 0 && !thinking;
  const dotColor = st.dotColor || palette.green;

  return (
    <div style={{
      position: "absolute", top: 80, right: 16, bottom: 16, width: CHAT_W,
      background: palette.panelSolid, border: `1px solid ${palette.border}`, borderRadius: 18,
      boxShadow: "0 30px 80px -30px #000, 0 0 0 1px rgba(255,255,255,.02)",
      display: "flex", flexDirection: "column", zIndex: 45, overflow: "hidden",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}33)`, flexShrink: 0 }} />

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px 14px", borderBottom: `1px solid ${palette.border}`, flexShrink: 0 }}>
        <span style={{ position: "relative", flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accent}66)`, display: "grid", placeItems: "center", boxShadow: `0 0 18px -4px ${accent}` }}>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v6A1.5 1.5 0 0 1 13.5 12H7l-3.2 2.6A.4.4 0 0 1 3 14.3V4.5Z" fill="#0b0e15" fillOpacity=".25" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/>
            <circle cx="6.5" cy="7.5" r=".9" fill="#fff"/><circle cx="9" cy="7.5" r=".9" fill="#fff"/><circle cx="11.5" cy="7.5" r=".9" fill="#fff"/>
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 680, color: palette.text, lineHeight: 1.1 }}>Flow Assistant</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
            <span style={{ fontSize: 11, color: palette.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{st.line || flow.name}</span>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close assistant" style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 9, cursor: "pointer",
          background: palette.panel, border: `1px solid ${palette.border}`, color: palette.dim,
          fontSize: 16, lineHeight: 1, display: "grid", placeItems: "center"
        }}>×</button>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 6px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <Bubble key={m.id || i} m={m} palette={palette} accent={accent} onJump={onJump} onAsk={submit} />
        ))}
        {thinking && <Typing palette={palette} accent={accent} />}
      </div>

      {/* starter suggestions (only before the user has said anything) */}
      {showStarters && suggestions && suggestions.length > 0 && (
        <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 7, flexShrink: 0 }}>
          {suggestions.map((s, i) => (
            <SuggestionChip key={i} label={s} palette={palette} accent={accent} onClick={() => submit(s)} />
          ))}
        </div>
      )}

      {/* composer */}
      <div style={{ padding: 12, borderTop: `1px solid ${palette.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 13, padding: "8px 8px 8px 13px" }}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={st.placeholder || `Ask about “${flow.name}”…`}
            style={{
              flex: 1, resize: "none", border: "none", outline: "none", background: "transparent",
              color: palette.text, fontFamily: "var(--sans)", fontSize: 13.5, lineHeight: 1.4,
              maxHeight: 110, padding: "4px 0"
            }}
          />
          <button onClick={() => submit()} disabled={!draft.trim() || thinking} aria-label="Send" style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: 10, cursor: draft.trim() && !thinking ? "pointer" : "default",
            background: draft.trim() && !thinking ? accent : palette.border,
            border: "none", display: "grid", placeItems: "center", transition: "background .15s",
            opacity: draft.trim() && !thinking ? 1 : 0.5
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 8h10M8 3.5 12.5 8 8 12.5" stroke="#0b0e15" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 9.5, color: palette.dim, fontFamily: "var(--mono)", marginTop: 7, textAlign: "center", letterSpacing: ".04em", opacity: .8 }}>
          {st.footer || <>MOCK AGENT · wire <span style={{ color: accent }}>sendToAgent()</span> to your LangChain endpoint</>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================= *
 *  MockChatPanel — drives ChatShell from the local mock agent.   *
 *  This is the OFFLINE fallback (and the in-preview default).     *
 * ============================================================= */
function MockChatPanel(props) {
  const { flow, palette, activeNode } = props;
  const { useState, useMemo, useEffect, useCallback } = React;
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);

  const byId = useMemo(() => Object.fromEntries(flow.nodes.map((n) => [n.id, n])), [flow]);
  const suggestions = useMemo(() => suggestionsFor(flow), [flow]);

  // greet (or re-greet) whenever the active flow changes
  useEffect(() => {
    setMessages([{
      role: "assistant",
      text: `Hi — I'm your assistant for the “${flow.name}” flow. Ask about any step, owner, SLA, or decision path. Tap a chip in my replies to jump to it on the canvas.`,
    }]);
  }, [flow.id]);

  const ask = useCallback(async (msg) => {
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setThinking(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const reply = await sendToAgent(msg, { flow, byId, history, activeNode });
      setMessages((m) => [...m, { role: "assistant", ...reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong reaching the assistant. (This is the mock seam — wire sendToAgent to your backend.)" }]);
    } finally {
      setThinking(false);
    }
  }, [messages, flow, byId, activeNode]);

  return (
    <ChatShell {...props} messages={messages} thinking={thinking} onSend={ask} suggestions={suggestions}
      status={{ dotColor: palette.green, line: activeNode ? `${flow.name} · ${activeNode.title}` : flow.name }} />
  );
}

/* ============================================================= *
 *  ChatPanel — dispatcher.                                        *
 *  Reads window.FLOW_AGENT to decide mock vs. live @chainlit.     *
 *    window.FLOW_AGENT = { mode: "chainlit", server: "" }  // live *
 *    (unset / { mode:"mock" })                              // mock *
 *  When live is requested but the adapter/lib/server isn't ready,  *
 *  ChainlitChatPanel degrades to MockChatPanel automatically.      *
 * ============================================================= */
function ChatPanel(props) {
  const cfg = (typeof window !== "undefined" && window.FLOW_AGENT) || { mode: "mock" };
  const wantsLive = cfg.mode === "chainlit" || (cfg.mode === "auto" && !!(cfg.server || cfg.mode === "chainlit"));
  const Live = (typeof window !== "undefined") ? window.ChainlitChatPanel : null;
  if (wantsLive && Live) {
    return <Live {...props} config={cfg} Shell={ChatShell} Fallback={MockChatPanel} />;
  }
  return <MockChatPanel {...props} />;
}

function Bubble({ m, palette, accent, onJump, onAsk }) {
  const isUser = m.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 8 }}>
      <div style={{
        maxWidth: "86%", padding: "10px 13px", borderRadius: 14,
        borderBottomRightRadius: isUser ? 5 : 14, borderBottomLeftRadius: isUser ? 14 : 5,
        background: isUser ? accent : palette.panel,
        border: isUser ? "none" : `1px solid ${palette.border}`,
        color: isUser ? "#0b0e15" : palette.text,
        fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
        fontWeight: isUser ? 540 : 440
      }}>{m.text}</div>

      {/* node reference chips → jump on canvas */}
      {m.refs && m.refs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "92%" }}>
          {m.refs.map((r) => (
            <button key={r.id} onClick={() => onJump(r.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
              background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 8,
              padding: "5px 10px", color: palette.text, fontSize: 12, fontWeight: 540, transition: "border-color .12s"
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.border; }}
            >
              <span style={{ width: 7, height: 7, flexShrink: 0, borderRadius: r.type === "manual" ? 2 : r.type === "decision" ? 0 : 4, transform: r.type === "decision" ? "rotate(45deg)" : "none", background: refColor(r, palette) }} />
              {r.title}
              <span style={{ color: palette.dim, fontFamily: "var(--mono)", fontSize: 13 }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* fallback suggestions rendered inline */}
      {m.suggestions && m.suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "92%" }}>
          {m.suggestions.map((s, i) => (
            <SuggestionChip key={i} label={s} palette={palette} accent={accent} onClick={() => onAsk(s)} />
          ))}
        </div>
      )}
    </div>
  );
}

function refColor(r, palette) {
  if (r.type === "terminal") return r.term === "declined" ? palette.red : r.term === "end" ? palette.green : palette.slate;
  return palette[r.type] || palette.slate;
}

function SuggestionChip({ label, palette, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      cursor: "pointer", background: "transparent", border: `1px dashed ${palette.border}`,
      borderRadius: 9, padding: "7px 11px", color: palette.dim, fontSize: 12, fontWeight: 500,
      fontFamily: "var(--sans)", textAlign: "left", transition: "color .12s, border-color .12s"
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent + "88"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = palette.dim; e.currentTarget.style.borderColor = palette.border; }}
    >{label}</button>
  );
}

function Typing({ palette, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 5, background: palette.panel, border: `1px solid ${palette.border}`, alignSelf: "flex-start" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: accent, animation: "chatDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  );
}

/* ---- toolbar toggle button (lives in the TopBar) ---- */
function ChatToggle({ open, onToggle, palette, accent }) {
  return (
    <button onClick={onToggle} title={open ? "Hide assistant" : "Ask the assistant"} aria-label="Toggle assistant" style={{
      display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0,
      padding: "7px 13px 7px 11px", borderRadius: 10,
      background: open ? accent : palette.panel,
      border: `1px solid ${open ? accent : palette.border}`,
      color: open ? "#0b0e15" : palette.text, transition: "background .15s, color .15s",
      fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 600
    }}
      onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = accent; }}
      onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = palette.border; }}
    >
      <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
        <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v6A1.5 1.5 0 0 1 13.5 12H7l-3.2 2.6A.4.4 0 0 1 3 14.3V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6 7h6M6 9h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      Assistant
    </button>
  );
}

Object.assign(window, {
  ChatPanel, ChatToggle, CHAT_W,
  // shared primitives reused by the live @chainlit adapter (chat-agent.jsx)
  ChatShell, MockChatPanel, Bubble, SuggestionChip, Typing,
  suggestionsFor, refColor,
});
