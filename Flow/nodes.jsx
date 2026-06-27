/* Node shapes + edge SVG layer + legend. Exports to window. */

const TYPE_META = {
  system:   { label: "Systemic", hue: 212 },
  manual:   { label: "Manual",   hue: 62 },
  decision: { label: "Decision", hue: 305 },
  terminal: { label: "Terminal", hue: 150 }
};

// accent for a node given the active palette (hue offsets per theme handled in App)
function accentFor(node, palette) {
  if (node.type === "terminal") {
    if (node.term === "declined") return palette.red;
    if (node.term === "end") return palette.green;
    return palette.slate;
  }
  return palette[node.type];
}

// ---- Node ----
function FlowNode({ box, palette, state, showOwner, showSLA, onSelect, onHover, animate, index }) {
  const n = box.node;
  const accent = accentFor(n, palette);
  const dim = state === "dim";
  const active = state === "active";
  const isDecision = n.type === "decision";
  const hasSub = !!(n.subflow && window.FLOWS && window.FLOWS[n.subflow]);
  const subCount = hasSub ? (window.FLOWS[n.subflow].nodes || []).length : 0;

  const common = {
    position: "absolute",
    left: box.x, top: box.y, width: box.w, height: box.h,
    cursor: "pointer",
    transition: "opacity .25s, filter .25s, transform .15s",
    opacity: dim ? 0.22 : 1,
    filter: dim ? "saturate(.4)" : "none",
    zIndex: active ? 6 : 3,
    animation: animate ? `nodeIn .5s cubic-bezier(.2,.8,.25,1) backwards` : "none",
    animationDelay: animate ? `${Math.min((index || 0) * 0.045, 0.7)}s` : "0s"
  };

  // pulsing ring shown around the actively selected/hovered node
  const selRing = active && animate ? (
    <div className="sel-ring" style={{
      position: "absolute", inset: -6,
      borderRadius: (n.type === "terminal" ? box.h / 2 + 6 : 18),
      border: `2px solid ${accent}`,
      pointerEvents: "none",
      animation: "selRing 1.8s ease-out infinite"
    }} />
  ) : null;

  const onClick = (e) => { e.stopPropagation(); onSelect(n.id); };
  const onEnter = () => onHover(n.id);
  const onLeave = () => onHover(null);

  if (isDecision) {
    return (
      <div style={common} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(150deg, ${accent}30, ${palette.panel})`,
          border: `1.5px solid ${active ? accent : accent + "88"}`,
          transform: "rotate(45deg) scale(.72)",
          borderRadius: 14,
          boxShadow: active ? `0 0 0 1px ${accent}, 0 14px 40px -12px ${accent}aa` : "0 8px 24px -16px #000"
        }} />
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center", padding: 14
        }}>
          <span style={{ fontSize: 9, letterSpacing: ".14em", color: accent, fontFamily: "var(--mono)", fontWeight: 600 }}>DECISION</span>
          <span style={{ fontSize: 13, lineHeight: 1.15, fontWeight: 600, color: palette.text, marginTop: 4, textWrap: "balance" }}>{n.title}</span>
        </div>
        {selRing}
        {hasSub && <SubflowBadge count={subCount} accent={accent} palette={palette} />}
      </div>
    );
  }

  // manual: cut top-left corner. system: clean rect. terminal: pill.
  const isManual = n.type === "manual";
  const isTerminal = n.type === "terminal";
  const radius = isTerminal ? box.h / 2 : 12;
  const clip = isManual ? "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)" : "none";

  return (
    <div style={common} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(160deg, ${accent}1f, ${palette.panel} 60%)`,
        border: `1.5px solid ${active ? accent : palette.border}`,
        borderLeft: isTerminal ? `1.5px solid ${active ? accent : palette.border}` : `4px solid ${accent}`,
        borderRadius: radius,
        clipPath: clip,
        boxShadow: active ? `0 0 0 1px ${accent}, 0 16px 44px -16px ${accent}` : "0 10px 30px -20px #000",
        transition: "border-color .2s, box-shadow .2s"
      }} />
      {hasSub && (
        <div style={{
          position: "absolute", inset: -5, borderRadius: radius + 5,
          border: `1.5px dashed ${accent}${active ? "" : "77"}`,
          clipPath: clip === "none" ? "none" : "polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)",
          pointerEvents: "none", opacity: dim ? 0.25 : 1, transition: "opacity .25s"
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0, padding: isTerminal ? "0 22px" : "12px 16px",
        display: "flex", flexDirection: "column",
        justifyContent: isTerminal ? "center" : "space-between",
        alignItems: isTerminal ? "center" : "stretch"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: isTerminal ? "center" : "flex-start" }}>
          <ShapeGlyph type={n.type} term={n.term} color={accent} />
          <span style={{ fontSize: 9, letterSpacing: ".14em", color: accent, fontFamily: "var(--mono)", fontWeight: 600 }}>
            {isTerminal ? (n.term === "declined" ? "END · DECLINED" : n.term === "end" ? "END" : "START") : TYPE_META[n.type].label.toUpperCase()}
          </span>
        </div>
        <div style={{
          fontSize: isTerminal ? 14 : 14.5, fontWeight: 650, color: palette.text,
          lineHeight: 1.15, textWrap: "balance", textAlign: isTerminal ? "center" : "left"
        }}>{n.title}</div>
        {!isTerminal && (showOwner || showSLA) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: palette.dim, fontFamily: "var(--mono)" }}>
            {showOwner && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.owner}</span>}
            {showOwner && showSLA && <span style={{ opacity: .4 }}>·</span>}
            {showSLA && <span style={{ color: accent, flexShrink: 0 }}>{n.sla}</span>}
          </div>
        )}
      </div>
      {selRing}
      {hasSub && <SubflowBadge count={subCount} accent={accent} palette={palette} />}
    </div>
  );
}

// corner badge marking a node that opens its own sub-flow
function SubflowBadge({ count, accent, palette }) {
  return (
    <div style={{
      position: "absolute", top: -11, right: -11, zIndex: 8,
      display: "flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px",
      borderRadius: 11, background: palette.bg, border: `1.5px solid ${accent}`,
      color: accent, fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
      boxShadow: `0 5px 16px -5px ${accent}cc`
    }}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M7 1.5h3.5V5M10.5 1.5 6.6 5.4M5 10.5H1.5V7M1.5 10.5 5.4 6.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{count}</span>
    </div>
  );
}

// tiny glyph hinting the shape family
function ShapeGlyph({ type, term, color }) {
  const s = 11;
  if (type === "manual") {
    return <svg width={s} height={s} viewBox="0 0 12 12"><path d="M3 1 H11 V11 H1 V3 Z" fill="none" stroke={color} strokeWidth="1.4" /></svg>;
  }
  if (type === "terminal") {
    return <svg width={s} height={s} viewBox="0 0 12 12"><rect x="1" y="3" width="10" height="6" rx="3" fill="none" stroke={color} strokeWidth="1.4" /></svg>;
  }
  return <svg width={s} height={s} viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="none" stroke={color} strokeWidth="1.4" /></svg>;
}

// ---- Edge layer (single SVG over the whole canvas) ----
function EdgeLayer({ edges, palette, canvas, activeId, relatedSet, showLabels, animate }) {
  return (
    <svg width={canvas.w} height={canvas.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", zIndex: 2, pointerEvents: "none" }}>
      <defs>
        {Object.entries(palette.edgeMarkers).map(([k, c]) => (
          <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={c} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const isReject = e.kind === "reject";
        const involved = activeId ? (relatedSet && relatedSet.has(e.from) && relatedSet.has(e.to)) : true;
        const baseColor = isReject ? palette.red : palette.edge;
        const dim = activeId && !involved;
        const markerKey = isReject ? "reject" : (involved && activeId ? "active" : "base");
        return (
          <g key={i} style={{ opacity: dim ? 0.12 : 1, transition: "opacity .25s" }}>
            <path d={e.path} fill="none"
              stroke={involved && activeId ? palette.edgeActive : baseColor}
              strokeWidth={involved && activeId ? 2.4 : 1.6}
              strokeDasharray={isReject ? "5 5" : "none"}
              markerEnd={`url(#arrow-${markerKey})`} />
            {animate && !dim && (
              <path className="flow-dash" d={e.path} fill="none" strokeLinecap="round"
                stroke={isReject ? palette.red : (involved && activeId ? palette.edgeActive : palette.system)}
                strokeWidth={involved && activeId ? 3 : 2.2}
                strokeDasharray="0.1 15"
                style={{
                  opacity: involved && activeId ? 0.95 : 0.55,
                  animation: `flowDash ${involved && activeId ? 0.85 : 1.25}s linear infinite`
                }} />
            )}
            {showLabels && e.label && (
              <g transform={`translate(${e.labelPos.x}, ${e.labelPos.y})`}>
                <EdgeLabel text={e.label} color={isReject ? palette.red : palette.dim} bg={palette.panel} border={palette.border} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function EdgeLabel({ text, color, bg, border }) {
  const w = text.length * 6.6 + 16;
  return (
    <g>
      <rect x={-w / 2} y={-9} width={w} height={18} rx={9} fill={bg} stroke={border} strokeWidth="1" />
      <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="var(--mono)" fontWeight="600" fill={color} letterSpacing=".04em">{text}</text>
    </g>
  );
}

Object.assign(window, { FlowNode, EdgeLayer, TYPE_META, accentFor });
