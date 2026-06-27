/* Flow loader — populates window.FLOWS for the canvas.

   SOURCE OF TRUTH: the backend (flow_store.py) parses the data/ folder and
   serves it at GET /api/flows. This loader fetches that JSON and adopts it
   verbatim — the browser does NOT parse the raw files, so frontend and backend
   can't drift. A live backend is REQUIRED; there is no in-browser fallback.

   Exposes window.__flowsReady (a Promise). app.jsx awaits it before mounting. */
(function () {
  // ── backend API (single source of truth) ──────────────────────────────────
  // flow_store.py parses data/ once and serves the finished JSON. We just adopt
  // it verbatim.
  async function loadFromApi(server) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const r = await fetch(`${server.replace(/\/$/, "")}/api/flows`, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" }
      });
      if (!r.ok) throw new Error(`/api/flows → ${r.status}`);
      const data = await r.json();
      return { FLOWS: data.flows || {}, order: data.order || [], nav: data.nav || [] };
    } finally {
      clearTimeout(timer);
    }
  }

  // ── load: requires a live backend configured via window.FLOW_AGENT.server ──
  // Uses the SAME window.FLOW_AGENT config the chat adapter reads, so there's
  // one place to point at the backend.
  window.__flowsReady = (async () => {
    const cfg = window.FLOW_AGENT || {};
    if (!cfg.server || cfg.mode === "mock") {
      throw new Error(
        "[flow-loader] no backend configured — set window.FLOW_AGENT.server " +
        "(mode must not be \"mock\")."
      );
    }

    const result = await loadFromApi(cfg.server);

    window.FLOWS = result.FLOWS;
    window.FLOW_ORDER = result.order;
    window.FLOW_NAV = result.nav;
    return { FLOWS: result.FLOWS, order: result.order, nav: result.nav };
  })();
})();
