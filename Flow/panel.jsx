/* Detail drawer + legend + zoom controls. Exports to window. */

function DetailPanel({ node, flow, palette, graph, showOwner, onClose, onJump, onOpenSubflow, rightInset = 0 }) {
  if (!node) return null;
  const accent = accentFor(node, palette);
  const subFlow = node.subflow && window.FLOWS ? window.FLOWS[node.subflow] : null;
  const meta = node.type === "terminal"
    ? (node.term === "declined" ? "Terminal · Declined" : node.term === "end" ? "Terminal · End" : "Terminal · Start")
    : (TYPE_META[node.type].label + (node.type === "decision" ? " gate" : " process"));

  const upstream = (graph.pred[node.id] || []).map((id) => flow.nodes.find((n) => n.id === id)).filter(Boolean);
  const downstream = (graph.succ[node.id] || []).map((id) => flow.nodes.find((n) => n.id === id)).filter(Boolean);

  return (
    <div style={{
      position: "absolute", top: 80, right: 16 + rightInset, bottom: 16, width: 372,
      background: palette.panelSolid, border: `1px solid ${palette.border}`, borderRadius: 18,
      boxShadow: "0 30px 80px -30px #000, 0 0 0 1px rgba(255,255,255,.02)",
      display: "flex", flexDirection: "column", zIndex: 40, overflow: "hidden",
      backdropFilter: "blur(12px)", transition: "right .22s cubic-bezier(.2,.8,.25,1)"
    }}>
      {/* accent header strip */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}33)` }} />
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: node.type === "manual" ? 2 : node.type === "decision" ? 0 : 5, background: accent, transform: node.type === "decision" ? "rotate(45deg)" : "none", display: "inline-block" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: ".12em", color: accent, fontWeight: 600 }}>{meta.toUpperCase()}</span>
            </div>
            <h2 style={{ margin: "10px 0 0", fontSize: 21, fontWeight: 680, color: palette.text, lineHeight: 1.12, textWrap: "balance" }}>{node.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: 9, cursor: "pointer",
            background: palette.panel, border: `1px solid ${palette.border}`, color: palette.dim,
            fontSize: 16, lineHeight: 1, display: "grid", placeItems: "center"
          }}>×</button>
        </div>
      </div>

      <div style={{ overflowY: "auto", padding: "18px 22px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {subFlow && (
          <button onClick={() => onOpenSubflow(node.subflow)} style={{
            display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left",
            cursor: "pointer", padding: "13px 15px", borderRadius: 13,
            background: `linear-gradient(135deg, ${accent}26, ${accent}0d)`,
            border: `1.5px solid ${accent}88`, color: palette.text,
            boxShadow: `0 10px 28px -16px ${accent}`
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = `linear-gradient(135deg, ${accent}38, ${accent}14)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = accent + "88"; e.currentTarget.style.background = `linear-gradient(135deg, ${accent}26, ${accent}0d)`; }}
          >
            <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: accent + "22", color: accent, display: "grid", placeItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                <path d="M7 1.5h3.5V5M10.5 1.5 6.6 5.4M5 10.5H1.5V7M1.5 10.5 5.4 6.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".12em", color: accent, fontWeight: 600 }}>OPEN SUB-FLOW</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 640, color: palette.text, marginTop: 3, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subFlow.name}</span>
              <span style={{ display: "block", fontSize: 11, color: palette.dim, marginTop: 2 }}>{(subFlow.nodes || []).length} steps · drill in</span>
            </span>
            <span style={{ flexShrink: 0, color: accent, fontFamily: "var(--mono)", fontSize: 18 }}>→</span>
          </button>
        )}
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: palette.dim, textWrap: "pretty" }}>{node.desc}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MetaCell palette={palette} k="Owner" v={node.owner} accent={accent} />
          <MetaCell palette={palette} k="Team" v={node.team} accent={accent} />
          <MetaCell palette={palette} k="SLA" v={node.sla} accent={accent} />
          <MetaCell palette={palette} k="Step type" v={TYPE_META[node.type].label} accent={accent} />
        </div>

        {node.documents && node.documents.length > 0 && (
          <Section palette={palette} title={`Documents · ${node.documents.length}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {node.documents.map((d, i) => (
                <DocumentCard key={i} doc={d} palette={palette} accent={accent} />
              ))}
            </div>
          </Section>
        )}

        {node.steps && node.steps.length > 0 && (
          <Section palette={palette} title="Sub-steps">
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {node.steps.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 21, height: 21, borderRadius: 6, background: accent + "22", color: accent, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: palette.text, lineHeight: 1.4, paddingTop: 1 }}>{s}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <IOList palette={palette} title="Inputs" items={node.inputs} accent={palette.dim} />
          <IOList palette={palette} title="Outputs" items={node.outputs} accent={accent} />
        </div>

        <Section palette={palette} title="Dependencies">
          <DepGroup palette={palette} label="Upstream" arrow="←" nodes={upstream} onJump={onJump} empty="Entry point" />
          <div style={{ height: 10 }} />
          <DepGroup palette={palette} label="Downstream" arrow="→" nodes={downstream} onJump={onJump} empty="Terminal node" />
        </Section>

        {node.links && node.links.length > 0 && (
          <Section palette={palette} title="References">
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {node.links.map((l, i) => (
                <LinkRow key={i} link={l} palette={palette} accent={accent} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// ---- Documents: produced/handled artifacts, treated as first-class ----
function DocumentCard({ doc, palette, accent }) {
  const clickable = !!doc.link;
  const Tag = clickable ? "a" : "div";
  const base = {
    display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
    padding: "11px 13px", borderRadius: 12,
    background: clickable ? `linear-gradient(135deg, ${accent}1f, ${accent}0a)` : palette.panel,
    border: `1px solid ${clickable ? accent + "66" : palette.border}`,
    color: palette.text, cursor: clickable ? "pointer" : "default",
    transition: "border-color .12s, background .12s"
  };
  const hoverIn = (e) => { if (clickable) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = `linear-gradient(135deg, ${accent}2e, ${accent}12)`; } };
  const hoverOut = (e) => { if (clickable) { e.currentTarget.style.borderColor = accent + "66"; e.currentTarget.style.background = `linear-gradient(135deg, ${accent}1f, ${accent}0a)`; } };
  const props = clickable
    ? { href: doc.link, target: "_blank", rel: "noopener noreferrer", onMouseEnter: hoverIn, onMouseLeave: hoverOut }
    : {};
  return (
    <Tag {...props} style={base}>
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: accent + "22", color: accent, display: "grid", placeItems: "center" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 1.5h5l3 3V14a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 14V2a.5.5 0 0 1 0-.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9 1.5V4.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M6 8h4M6 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 620, color: palette.text, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
        {(doc.format || doc.status) && (
          <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
            {doc.format && <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".08em", fontWeight: 600, color: accent, background: accent + "1e", padding: "2px 6px", borderRadius: 5 }}>{doc.format.toUpperCase()}</span>}
            {doc.status && <span style={{ fontSize: 10.5, color: palette.dim }}>{doc.status}</span>}
          </span>
        )}
      </span>
      {clickable && (
        <span style={{ flexShrink: 0, color: accent }}>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M4 2.5h5.5V8M9.5 2.5 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </Tag>
  );
}

// ---- External hyperlink row ----
function LinkRow({ link, palette, accent }) {
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{
      display: "flex", alignItems: "center", gap: 9, textDecoration: "none",
      padding: "9px 11px", borderRadius: 10,
      background: palette.panel, border: `1px solid ${palette.border}`,
      color: palette.text, transition: "border-color .12s, color .12s"
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent + "88"; e.currentTarget.style.color = accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.text; }}
    >
      <span style={{ flexShrink: 0, color: accent, display: "grid", placeItems: "center" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.8 8.2 8.2 5.8M6.4 4.2 7.2 3.4a2.1 2.1 0 0 1 3 3l-.8.8M7.6 9.8l-.8.8a2.1 2.1 0 0 1-3-3l.8-.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 540, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.label}</span>
      <span style={{ flexShrink: 0, color: "currentColor", opacity: .55 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2.5h5.5V8M9.5 2.5 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

function MetaCell({ k, v, palette, accent }) {  return (
    <div style={{ background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 11, padding: "10px 12px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".1em", color: palette.dim, textTransform: "uppercase" }}>{k}</div>
      <div style={{ fontSize: 13, color: palette.text, marginTop: 4, fontWeight: 560, lineHeight: 1.2 }}>{v}</div>
    </div>
  );
}

function Section({ title, children, palette }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em", color: palette.dim, textTransform: "uppercase", marginBottom: 11, fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function IOList({ title, items, palette, accent }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".12em", color: palette.dim, textTransform: "uppercase", marginBottom: 9 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {(items || []).map((it, i) => (
          <li key={i} style={{ fontSize: 12.5, color: palette.text, lineHeight: 1.35, display: "flex", gap: 7 }}>
            <span style={{ color: accent, flexShrink: 0 }}>•</span><span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DepGroup({ label, arrow, nodes, onJump, empty, palette }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: palette.dim, marginBottom: 7 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {nodes.length === 0 && <span style={{ fontSize: 12, color: palette.dim, fontStyle: "italic", opacity: .7 }}>{empty}</span>}
        {nodes.map((n) => (
          <button key={n.id} onClick={() => onJump(n.id)} style={{
            display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
            background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 8,
            padding: "5px 9px", color: palette.text, fontSize: 12, fontWeight: 520
          }}>
            <span style={{ color: accentFor(n, palette), fontFamily: "var(--mono)" }}>{arrow}</span>
            {n.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Legend ----
function Legend({ palette }) {
  const items = [
    { k: "system", label: "Systemic", desc: "Automated step", shape: "rect" },
    { k: "manual", label: "Manual", desc: "Human in the loop", shape: "cut" },
    { k: "decision", label: "Decision", desc: "Conditional branch", shape: "diamond" },
    { k: "terminal", label: "Terminal", desc: "Start / end state", shape: "pill" }
  ];
  return (
    <div style={{
      position: "absolute", left: 16, bottom: 16, zIndex: 30,
      background: palette.panelSolid, border: `1px solid ${palette.border}`, borderRadius: 14,
      padding: "13px 15px", backdropFilter: "blur(12px)", boxShadow: "0 20px 50px -24px #000"
    }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".14em", color: palette.dim, textTransform: "uppercase", marginBottom: 11 }}>Node types</div>
      <div style={{ display: "grid", gridTemplateColumns: "170px 170px", gap: "12px 20px" }}>
        {items.map((it) => {
          const c = it.k === "terminal" ? palette.green : palette[it.k];
          return (
            <div key={it.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LegendShape shape={it.shape} color={c} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: palette.text, lineHeight: 1 }}>{it.label}</div>
                <div style={{ fontSize: 10, color: palette.dim, marginTop: 3, whiteSpace: "nowrap" }}>{it.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 13, paddingTop: 12, borderTop: `1px solid ${palette.border}` }}>
        <svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke={palette.red} strokeWidth="1.6" strokeDasharray="4 4" /></svg>
        <span style={{ fontSize: 10.5, color: palette.dim }}>Reject / decline path</span>
      </div>
    </div>
  );
}

function LegendShape({ shape, color }) {
  const bg = color + "26";
  if (shape === "diamond") return <span style={{ width: 16, height: 16, background: bg, border: `1.4px solid ${color}`, transform: "rotate(45deg)", borderRadius: 2, flexShrink: 0 }} />;
  if (shape === "pill") return <span style={{ width: 22, height: 13, background: bg, border: `1.4px solid ${color}`, borderRadius: 7, flexShrink: 0 }} />;
  if (shape === "cut") return <span style={{ width: 18, height: 16, background: bg, border: `1.4px solid ${color}`, borderLeft: `3px solid ${color}`, clipPath: "polygon(5px 0,100% 0,100% 100%,0 100%,0 5px)", flexShrink: 0 }} />;
  return <span style={{ width: 18, height: 16, background: bg, border: `1.4px solid ${color}`, borderLeft: `3px solid ${color}`, borderRadius: 3, flexShrink: 0 }} />;
}

// ---- Zoom controls ----
function Controls({ palette, zoom, onZoom, onFit, onReset }) {
  const btn = {
    width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer",
    background: "transparent", border: "none", color: palette.text, fontSize: 17, fontFamily: "var(--mono)"
  };
  return (
    <div style={{
      position: "absolute", right: 16, bottom: 16, zIndex: 30,
      display: "flex", alignItems: "center",
      background: palette.panelSolid, border: `1px solid ${palette.border}`, borderRadius: 12,
      backdropFilter: "blur(12px)", boxShadow: "0 20px 50px -24px #000", overflow: "hidden"
    }}>
      <button style={btn} onClick={() => onZoom(-0.15)} title="Zoom out">−</button>
      <div style={{ width: 50, textAlign: "center", fontFamily: "var(--mono)", fontSize: 12, color: palette.dim, borderLeft: `1px solid ${palette.border}`, borderRight: `1px solid ${palette.border}`, height: 36, lineHeight: "36px" }}>{Math.round(zoom * 100)}%</div>
      <button style={btn} onClick={() => onZoom(0.15)} title="Zoom in">+</button>
      <button style={{ ...btn, fontSize: 11, width: 44, borderLeft: `1px solid ${palette.border}`, letterSpacing: ".05em" }} onClick={onFit} title="Fit to screen">FIT</button>
    </div>
  );
}

Object.assign(window, { DetailPanel, Legend, Controls });
