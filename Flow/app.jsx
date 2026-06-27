/* Main app: viewport pan/zoom, selection, dependency highlight, themes, tweaks. */
const { useState, useMemo, useRef, useEffect, useCallback } = React;

// ---- theme palettes (bold + colorful, dark) ----
const SURFACES = {
  Neon:   { bg: "#0b0e15", surface: "#151a26", surfaceSolid: "rgba(20,25,37,.92)", grid: "rgba(150,180,255,.05)" },
  Sunset: { bg: "#140f0d", surface: "#1e1714", surfaceSolid: "rgba(30,23,20,.92)", grid: "rgba(255,190,140,.055)" },
  Aurora: { bg: "#081012", surface: "#111a1d", surfaceSolid: "rgba(17,26,29,.92)", grid: "rgba(140,255,220,.05)" }
};
const ACCENTS = {
  Neon:   { system: "#34d8f0", manual: "#f5c451", decision: "#c98bff" },
  Sunset: { system: "#ff8c69", manual: "#ffce5c", decision: "#ff7ab6" },
  Aurora: { system: "#4fd6c9", manual: "#a6e35c", decision: "#8b9cff" }
};

function buildPalette(theme) {
  const s = SURFACES[theme] || SURFACES.Neon;
  const a = ACCENTS[theme] || ACCENTS.Neon;
  const green = "#5fe3a1", red = "#ff6f6f", slate = "#90a2c2";
  return {
    ...a, green, red, slate,
    bg: s.bg, grid: s.grid,
    panel: s.surface, panelSolid: s.surfaceSolid,
    border: "rgba(255,255,255,.10)",
    text: "#eef2fb", dim: "#8a93a8",
    edge: "rgba(255,255,255,.22)", edgeActive: "#ffffff",
    edgeMarkers: { base: "rgba(255,255,255,.34)", active: "#ffffff", reject: red }
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// walk the nav tree to build a breadcrumb trail (names + ids) to a flow id
function findTrail(nav, id) {
  for (const g of nav || []) {
    const dig = (items, accNames, accIds) => {
      for (const it of items) {
        const names = [...accNames, it.name];
        const ids = [...accIds, it.id];
        if (it.id === id) return { group: g.group, names, ids };
        if (it.children && it.children.length) {
          const hit = dig(it.children, names, ids);
          if (hit) return hit;
        }
      }
      return null;
    };
    const hit = dig(g.items, [], []);
    if (hit) return hit;
  }
  return { group: null, names: [], ids: [] };
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "Neon",
  "depMode": "immediate",
  "showOwner": true,
  "showSLA": true,
  "showLabels": true,
  "grid": true,
  "animate": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [flowId, setFlowId] = useState("loan");
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [navOpen, setNavOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const CHAT_W = window.CHAT_W || 384;

  const viewportRef = useRef(null);
  const drag = useRef(null);
  const didFit = useRef(false);

  const flow = window.FLOWS[flowId];
  const nav = window.FLOW_NAV || [];
  const palette = useMemo(() => buildPalette(t.theme), [t.theme]);

  // breadcrumb trail (Group › … › Flow) for the top bar
  const trail = useMemo(() => findTrail(nav, flowId), [nav, flowId]);
  // parent flow id (for the Back affordance) — second-to-last crumb id, if any
  const parentId = (trail.ids && trail.ids.length > 1) ? trail.ids[trail.ids.length - 2] : null;
  const parentName = parentId ? trail.names[trail.names.length - 2] : null;

  // drill into a node's sub-flow (also reused by clickable breadcrumb crumbs)
  const goToFlow = useCallback((id) => {
    if (id && window.FLOWS[id]) setFlowId(id);
  }, []);

  // collapse/expand the navigator, keeping canvas content visually anchored
  const toggleNav = useCallback(() => {
    setNavOpen((open) => {
      const W = window.SIDEBAR_W || 264;
      setPan((p) => ({ ...p, x: p.x + (open ? W : -W) }));
      return !open;
    });
  }, []);
  const L = useMemo(() => window.FlowLayout.layout(flow), [flowId]);
  const graph = useMemo(() => window.FlowLayout.buildGraph(flow), [flowId]);

  const activeId = selectedId || hoveredId;
  const relatedSet = useMemo(
    () => window.FlowLayout.relatedSet(flow, activeId, t.depMode),
    [flowId, activeId, t.depMode]
  );
  const selectedNode = selectedId ? flow.nodes.find((n) => n.id === selectedId) : null;

  // ---- fit to viewport ----
  const fit = useCallback(() => {
    const vp = viewportRef.current; if (!vp) return;
    const pad = 80;
    const availW = vp.clientWidth - pad * 2 - (selectedNode ? 380 : 0);
    const availH = vp.clientHeight - pad * 2;
    const z = clamp(Math.min(availW / L.canvas.w, availH / L.canvas.h), 0.25, 1.4);
    const cx = (vp.clientWidth - (selectedNode ? 380 : 0)) / 2 - (L.canvas.w * z) / 2;
    const cy = vp.clientHeight / 2 - (L.canvas.h * z) / 2;
    setZoom(z);
    setPan({ x: Math.max(pad / 2, cx), y: Math.max(pad / 2, cy) });
  }, [L, selectedNode]);

  // Entry view: small flows (sub-flows) fit fully & centered; large flows keep the
  // readable view anchored on the start node. Recomputed on every flow change
  // ("always re-fit on enter").
  const enterView = useCallback(() => {
    const vp = viewportRef.current; if (!vp) return;
    const pad = 80;
    const fitZ = Math.min(
      (vp.clientWidth - pad * 2) / L.canvas.w,
      (vp.clientHeight - pad * 2) / L.canvas.h
    );
    if (fitZ >= 0.5) {
      // compact flow: center the whole thing in view
      const z = clamp(fitZ, 0.5, 1.15);
      const cx = vp.clientWidth / 2 - (L.canvas.w * z) / 2;
      const cy = vp.clientHeight / 2 - (L.canvas.h * z) / 2;
      setZoom(z);
      setPan({ x: Math.max(pad / 2, cx), y: Math.max(pad / 2, cy) });
    } else {
      // large flow: anchor on the start node at a readable zoom
      const z = 0.78;
      const start = L.boxes[flow.nodes[0].id];
      const y = vp.clientHeight / 2 - (start ? start.cy * z : 0);
      setZoom(z);
      setPan({ x: 72, y: Math.max(48, y) });
    }
  }, [L, flow]);

  useEffect(() => { if (!didFit.current) { enterView(); didFit.current = true; } }, [enterView]);
  useEffect(() => { didFit.current = false; setSelectedId(null); setHoveredId(null); }, [flowId]);

  // ---- zoom toward a screen point ----
  const zoomAt = useCallback((delta, sx, sy) => {
    setZoom((z0) => {
      const z1 = clamp(z0 + delta * z0, 0.25, 2);
      setPan((p) => {
        const wx = (sx - p.x) / z0, wy = (sy - p.y) / z0;
        return { x: sx - wx * z1, y: sy - wy * z1 };
      });
      return z1;
    });
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const vp = viewportRef.current; const rect = vp.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (e.ctrlKey || e.metaKey) { zoomAt(-e.deltaY * 0.01, sx, sy); }
    else if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
      setPan((p) => ({ x: p.x - (e.shiftKey ? e.deltaY : e.deltaX), y: p.y - (e.shiftKey ? 0 : e.deltaY) }));
    } else { zoomAt(-e.deltaY * 0.0016, sx, sy); }
  }, [zoomAt]);

  useEffect(() => {
    const vp = viewportRef.current; if (!vp) return;
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ---- pan by dragging the background ----
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: false };
    setHoveredId(null);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    setPan({ x: drag.current.px + dx, y: drag.current.py + dy });
  };
  const onPointerUp = (e) => {
    // Note: we intentionally do NOT deselect on empty-canvas clicks. The detail
    // panel stays open while panning/exploring (incl. the empty space beyond the
    // last node) — it only closes via the × button, picking another node, or
    // switching flows. This avoids the panel snapping shut mid-navigation.
    drag.current = null;
  };

  // ---- jump/center a node ----
  const jumpTo = useCallback((id) => {
    setSelectedId(id);
    const box = L.boxes[id]; const vp = viewportRef.current;
    if (!box || !vp) return;
    // reserve room on the right for the detail panel (+ the chat drawer if open)
    const rightReserve = 404 + (chatOpen ? CHAT_W + 16 : 0);
    const targetSX = Math.max(120, (vp.clientWidth - rightReserve) / 2);
    const targetSY = vp.clientHeight / 2;
    setZoom((z) => {
      setPan({ x: targetSX - box.cx * z, y: targetSY - box.cy * z });
      return z;
    });
  }, [L, chatOpen, CHAT_W]);

  const nodeState = (id) => {
    if (!activeId) return "normal";
    if (id === activeId) return "active";
    return relatedSet && relatedSet.has(id) ? "normal" : "dim";
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: palette.bg, color: palette.text, overflow: "hidden", fontFamily: "var(--sans)" }}>
      <TopBar flow={flow} trail={trail} palette={palette} navOpen={navOpen} onToggleNav={toggleNav} onCrumb={goToFlow}
        chatOpen={chatOpen} onToggleChat={() => setChatOpen((o) => !o)} chatAccent={palette.system} />

      {navOpen && (
        <FlowSidebar nav={nav} flowId={flowId} palette={palette}
          onSelect={setFlowId} onCollapse={toggleNav} />
      )}

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "absolute", top: 64, right: 0, bottom: 0,
          left: navOpen ? (window.SIDEBAR_W || 264) : 0,
          cursor: drag.current ? "grabbing" : "grab",
          touchAction: "none",
          backgroundImage: t.grid ? `radial-gradient(${palette.grid} 1.3px, transparent 1.3px)` : "none",
          backgroundSize: `${26 * zoom}px ${26 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        <div data-bg="1" style={{ position: "absolute", inset: 0 }} />
        <div key={flowId} style={{
          position: "absolute", left: 0, top: 0, width: L.canvas.w, height: L.canvas.h,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0"
        }}>
          <EdgeLayer edges={L.edges} palette={palette} canvas={L.canvas} activeId={activeId} relatedSet={relatedSet} showLabels={t.showLabels} animate={t.animate} />
          {flow.nodes.map((n, i) => (
            <FlowNode key={n.id} box={L.boxes[n.id]} palette={palette}
              state={nodeState(n.id)} showOwner={t.showOwner} showSLA={t.showSLA}
              animate={t.animate} index={i}
              onSelect={(id) => (selectedId === id ? setSelectedId(null) : jumpTo(id))}
              onHover={(id) => { if (!drag.current) setHoveredId(id); }} />
          ))}
        </div>

        <Legend palette={palette} />
        {parentId && (
          <button onClick={() => goToFlow(parentId)} title={`Back to ${parentName}`} style={{
            position: "absolute", left: 16, top: 16, zIndex: 30,
            display: "flex", alignItems: "center", gap: 9, cursor: "pointer",
            padding: "8px 14px 8px 11px", borderRadius: 11,
            background: palette.panelSolid, border: `1px solid ${palette.border}`,
            backdropFilter: "blur(12px)", boxShadow: "0 20px 50px -24px #000", color: palette.text
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = palette.panel; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = palette.panelSolid; }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M9 3.5 5 7.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, alignItems: "flex-start" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, letterSpacing: ".12em", color: palette.dim }}>BACK TO</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{parentName}</span>
            </span>
          </button>
        )}
        <Controls palette={palette} zoom={zoom} onZoom={(d) => {
          const vp = viewportRef.current; zoomAt(d, vp.clientWidth / 2, vp.clientHeight / 2);
        }} onFit={fit} />
      </div>

      {selectedNode && (
        <DetailPanel node={selectedNode} flow={flow} palette={palette} graph={graph}
          showOwner={t.showOwner} onClose={() => setSelectedId(null)} onJump={jumpTo} onOpenSubflow={goToFlow}
          rightInset={chatOpen ? CHAT_W + 12 : 0} />
      )}

      <ChatPanel flow={flow} palette={palette} accent={palette.system} open={chatOpen}
        onClose={() => setChatOpen(false)} onJump={jumpTo} detailOpen={!!selectedNode}
        activeNodeId={selectedId} activeNode={selectedNode} />

      <TweaksPanel>
        <TweakSection label="Appearance" />
        <TweakRadio label="Theme" value={t.theme} options={["Neon", "Sunset", "Aurora"]} onChange={(v) => setTweak("theme", v)} />
        <TweakToggle label="Animate flow" value={t.animate} onChange={(v) => setTweak("animate", v)} />
        <TweakToggle label="Dot grid" value={t.grid} onChange={(v) => setTweak("grid", v)} />
        <TweakSection label="Dependencies" />
        <TweakRadio label="Highlight" value={t.depMode} options={["immediate", "chain"]} onChange={(v) => setTweak("depMode", v)} />
        <TweakToggle label="Edge labels" value={t.showLabels} onChange={(v) => setTweak("showLabels", v)} />
        <TweakSection label="Node detail" />
        <TweakToggle label="Show owner" value={t.showOwner} onChange={(v) => setTweak("showOwner", v)} />
        <TweakToggle label="Show SLA" value={t.showSLA} onChange={(v) => setTweak("showSLA", v)} />
      </TweaksPanel>
    </div>
  );
}

function TopBar({ flow, trail, palette, navOpen, onToggleNav, onCrumb, chatOpen, onToggleChat, chatAccent }) {
  const names = (trail && trail.names && trail.names.length) ? trail.names : [flow.name];
  const ids = (trail && trail.ids) || [];
  const crumbs = [];
  if (trail && trail.group) crumbs.push({ label: trail.group, id: null });
  names.forEach((nm, i) => crumbs.push({ label: nm, id: ids[i] || null }));
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 64, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px",
      background: palette.panelSolid, borderBottom: `1px solid ${palette.border}`, backdropFilter: "blur(14px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <button onClick={onToggleNav} title={navOpen ? "Hide navigator" : "Show navigator"} aria-label="Toggle navigator" style={{
          width: 32, height: 32, borderRadius: 9, cursor: "pointer", flexShrink: 0,
          background: navOpen ? palette.panel : "transparent",
          border: `1px solid ${navOpen ? palette.border : "transparent"}`,
          color: navOpen ? palette.text : palette.dim, display: "grid", placeItems: "center"
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <line x1="6" y1="2.5" x2="6" y2="13.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${palette.system}, ${palette.decision})`, boxShadow: `0 0 18px -4px ${palette.system}` }} />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-.01em" }}>Flow</span>
        </div>
        <div style={{ width: 1, height: 26, background: palette.border, flexShrink: 0 }} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, fontWeight: 650, lineHeight: 1.1, minWidth: 0, overflow: "hidden", maxWidth: "46vw" }}>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              const clickable = !last && c.id && onCrumb;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: palette.dim, fontWeight: 400, fontSize: 13, flexShrink: 0 }}>›</span>}
                  <span
                    onClick={clickable ? () => onCrumb(c.id) : undefined}
                    style={{
                      color: last ? palette.text : palette.dim,
                      whiteSpace: "nowrap",
                      flexShrink: last ? 1 : 0,
                      minWidth: 0,
                      cursor: clickable ? "pointer" : "default",
                      overflow: "hidden", textOverflow: "ellipsis",
                      transition: "color .12s"
                    }}
                    onMouseEnter={clickable ? (e) => { e.currentTarget.style.color = palette.text; } : undefined}
                    onMouseLeave={clickable ? (e) => { e.currentTarget.style.color = palette.dim; } : undefined}
                  >{c.label}</span>
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: palette.dim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{flow.subtitle}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: palette.dim, fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>drag to pan · scroll to zoom</span>
        <ChatToggle open={chatOpen} onToggle={onToggleChat} palette={palette} accent={chatAccent} />
      </div>
    </div>
  );
}

window.__flowsReady
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  })
  .catch((err) => {
    document.getElementById("root").innerHTML =
      '<div style="position:absolute;inset:0;display:grid;place-items:center;color:#ff6f6f;'
      + 'font-family:ui-monospace,monospace;font-size:13px;padding:24px;text-align:center">'
      + 'Failed to load flow data<br><span style="color:#8a93a8">' + String(err) + '</span></div>';
    console.error("[flow-loader]", err);
  });
