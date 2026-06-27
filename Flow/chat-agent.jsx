/* ============================================================================
 * chat-agent.jsx — LIVE backend adapter for the Flow Assistant.
 *
 * Drives the EXACT same drawer (window.ChatShell) from a real Chainlit session
 * instead of the mock. Only the data source changes; every pixel of the UI,
 * the node-reference chips, and the canvas-jump behavior are reused as-is.
 *
 * ── Turn it on ──────────────────────────────────────────────────────────────
 *   Set this global BEFORE the app mounts (e.g. an inline <script> in Flow.html):
 *
 *     window.FLOW_AGENT = {
 *       mode: "chainlit",          // "mock" (default) | "chainlit" | "auto"
 *       server: location.origin,   // your Chainlit server (same-origin here)
 *       clientType: "webapp",      // "webapp" (custom frontend) | "copilot"
 *       accessToken: undefined,    // JWT if Chainlit auth is enabled
 *     };
 *
 *   If the client lib or server can't be reached, this degrades to the mock
 *   automatically — the prototype never hard-fails.
 *
 * ── Production note (your real bundled React app) ───────────────────────────
 *   You DON'T need the dynamic-import/import-map dance below. With a bundler:
 *
 *     import { ChainlitAPI, ChainlitContext,
 *              useChatSession, useChatInteract, useChatMessages } from "@chainlit/react-client";
 *     import { RecoilRoot } from "recoil";
 *
 *     const api = new ChainlitAPI(CHAINLIT_SERVER, "webapp");
 *     <ChainlitContext.Provider value={api}>
 *       <RecoilRoot><FlowAssistant/></RecoilRoot>
 *     </ChainlitContext.Provider>
 *
 *   …and inside FlowAssistant use the same three hooks LiveInner uses below.
 *
 * ── Python side (LangChain agent in Chainlit) ───────────────────────────────
 *   Keep your astream handler; just return node references as message metadata
 *   so the chips can light up and jump on the canvas:
 *
 *     @cl.on_message
 *     async def on_message(msg: cl.Message):
 *         answer = cl.Message(content="")
 *         refs = []
 *         async for ev in agent.astream_events({"input": msg.content}, version="v2"):
 *             if ev["event"] == "on_chat_model_stream":
 *                 await answer.stream_token(ev["data"]["chunk"].content)
 *             # collect node ids your tool/agent resolved -> refs.append("node_id")
 *         answer.metadata = {"refs": refs}      # <-- read by mapMessages() below
 *         await answer.send()
 *
 *   The active flow is sent as session env on connect (FLOW_ID / FLOW_NAME),
 *   readable via cl.user_session.get("env") so the agent is flow-aware.
 * ========================================================================== */

/* Import via the bare specifiers declared in Flow.html's <script type="importmap">.
 * new Function(...) keeps the dynamic import() opaque to Babel-standalone so it
 * stays a real ESM import (and import-map resolution + React sharing both work). */
const _esmImport = (spec) => new Function("s", "return import(s)")(spec);

let _libPromise = null;
function loadChainlitLib() {
  if (_libPromise) return _libPromise;
  _libPromise = (async () => {
    const [cl, recoil] = await Promise.all([
      _esmImport("@chainlit/react-client"),
      _esmImport("recoil"),
    ]);
    if (!cl || !cl.ChainlitAPI || !cl.useChatSession) {
      throw new Error("@chainlit/react-client did not expose the expected API");
    }
    return { cl, RecoilRoot: recoil.RecoilRoot };
  })();
  return _libPromise;
}

/* Chainlit IStep[]  ->  ChatShell bubble model (+ node-ref chips).
 *
 * With cot="full" (Chainlit's default) the @cl.on_message handler is wrapped in
 * a top-level "run" step and our assistant cl.Message reply is NESTED inside that
 * step's `.steps[]` (its parentId points at the run step). So we can't just scan
 * the top level — we walk the tree depth-first, in document order, pulling out
 * user_message / assistant_message steps wherever they live. */
function mapChainlitMessages(steps, byId) {
  const out = [];
  const walk = (list) => {
    for (const s of list || []) {
      const isUser = s.type === "user_message";
      const isAsst = s.type === "assistant_message";
      if (isUser || isAsst) {
        const text = s.output || "";
        // don't render an empty assistant bubble while it's still streaming — the
        // typing indicator covers that gap until the first token lands.
        if (!(isAsst && s.streaming && !text)) {
          const rawRefs = s.metadata && Array.isArray(s.metadata.refs) ? s.metadata.refs : null;
          const refs = rawRefs
            ? rawRefs.map((id) => byId[id]).filter(Boolean)
                .map((n) => ({ id: n.id, title: n.title, type: n.type, term: n.term }))
            : undefined;
          out.push({ id: s.id, role: isUser ? "user" : "assistant", text, refs });
        }
      }
      // recurse: the reply may be nested under a run/tool step.
      if (s.steps && s.steps.length) walk(s.steps);
    }
  };
  walk(steps);
  return out;
}

/* ---- inner: lives under ChainlitContext + RecoilRoot, so hooks are valid ---- */
function LiveInner({ cl, config, flow, palette, accent, open, onClose, onJump, Shell, activeNodeId }) {
  const { useEffect, useMemo, useCallback } = React;
  const byId = useMemo(() => Object.fromEntries(flow.nodes.map((n) => [n.id, n])), [flow]);
  const suggestions = useMemo(() => window.suggestionsFor(flow), [flow]);
  const activeNode = activeNodeId ? byId[activeNodeId] : null;

  const { connect, disconnect } = cl.useChatSession();
  const interact = cl.useChatInteract();
  const chat = cl.useChatMessages();
  const steps = Array.isArray(chat) ? chat : (chat && chat.messages) || [];

  // one session per flow — reconnecting passes the current flow as session env so
  // the LangChain agent is flow-aware (mirrors the mock's per-flow greeting).
  useEffect(() => {
    connect({
      userEnv: { FLOW_ID: flow.id, FLOW_NAME: flow.name },
      accessToken: config.accessToken,
    });
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.id]);

  const messages = useMemo(() => mapChainlitMessages(steps, byId), [steps, byId]);

  // thinking = a reply is pending: the last leaf step is the user's, or an
  // assistant step is streaming but hasn't emitted text yet. We look at the last
  // *leaf* because cot="full" nests the assistant reply inside a run step.
  const thinking = useMemo(() => {
    const lastLeaf = (list) => {
      const s = (list || [])[list.length - 1];
      if (!s) return null;
      return s.steps && s.steps.length ? lastLeaf(s.steps) : s;
    };
    const last = lastLeaf(steps);
    if (!last) return false;
    if (last.type === "user_message") return true;
    if (last.type === "assistant_message" && last.streaming && !last.output) return true;
    return false;
  }, [steps]);

  // Stamp every outgoing message with the active flow id AND the node the user
  // currently has open on the canvas. The backend trusts these over session env,
  // so a question like "about the node I'm looking at" resolves to THAT node
  // (see app.py on_message -> agent.py active_id) instead of a keyword guess.
  const onSend = useCallback((text) => {
    interact.sendMessage(
      { name: "user", type: "user_message", output: text,
        metadata: { flow_id: flow.id, active_node_id: activeNodeId || null } },
      []
    );
  }, [interact, flow.id, activeNodeId]);

  const greeted = messages.length > 0;
  const view = greeted ? messages : [{
    role: "assistant",
    text: `Hi — I'm your assistant for the “${flow.name}” flow, wired to your live agent. Ask about any step, owner, SLA, or decision path. I'll light up chips you can tap to jump on the canvas.`,
  }];

  return (
    <Shell flow={flow} palette={palette} accent={accent} open={open} onClose={onClose} onJump={onJump}
      messages={view} thinking={thinking} onSend={onSend} suggestions={suggestions}
      status={{
        dotColor: palette.green,
        line: activeNode ? `${flow.name} \u00b7 ${activeNode.title}` : flow.name,
        footer: <>LIVE · <span style={{ color: accent }}>@chainlit/react-client</span> · {flow.name}</>,
      }} />
  );
}

/* ---- provider: builds the API client + Recoil/Context, then mounts LiveInner ---- */
function LiveProvider({ lib, config, ...rest }) {
  const { useMemo } = React;
  const { cl, RecoilRoot } = lib;
  const api = useMemo(() => {
    const server = (config && config.server) || window.location.origin;
    return new cl.ChainlitAPI(server, (config && config.clientType) || "webapp");
  }, [cl, config]);

  return (
    <cl.ChainlitContext.Provider value={api}>
      <RecoilRoot>
        <LiveInner cl={cl} config={config} {...rest} />
      </RecoilRoot>
    </cl.ChainlitContext.Provider>
  );
}

/* ---- entry: load lib lazily, show a connecting state, fall back to mock ---- */
function ChainlitChatPanel(props) {
  const { Shell, Fallback, config, palette, flow, accent, open, onClose, onJump } = props;
  const { useState, useEffect } = React;
  const [lib, setLib] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | ready | failed

  useEffect(() => {
    let alive = true;
    loadChainlitLib()
      .then((m) => { if (alive) { setLib(m); setPhase("ready"); } })
      .catch((err) => {
        console.warn("[chat-agent] live Chainlit client unavailable — falling back to mock:", err);
        if (alive) setPhase("failed");
      });
    return () => { alive = false; };
  }, []);

  if (phase === "failed") return <Fallback {...props} />;

  if (phase !== "ready" || !lib) {
    return (
      <Shell flow={flow} palette={palette} accent={accent} open={open} onClose={onClose} onJump={onJump}
        messages={[{ role: "assistant", text: `Connecting to your agent for the “${flow.name}” flow…` }]}
        thinking={true} onSend={() => {}} suggestions={[]}
        status={{ dotColor: palette.manual, line: "connecting…", footer: <>CONNECTING · @chainlit/react-client</> }} />
    );
  }

  return <LiveProvider lib={lib} {...props} />;
}

window.ChainlitChatPanel = ChainlitChatPanel;
window.mapChainlitMessages = mapChainlitMessages;
