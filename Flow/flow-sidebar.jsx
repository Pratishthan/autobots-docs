/* Left flow navigator — searchable, grouped, hierarchy-ready (parent → sub-flows).
   Replaces the top-bar segmented toggle so the app scales past a handful of flows.
   Exports FlowSidebar + SIDEBAR_W to window. */

const SIDEBAR_W = 264;

// deterministic accent per flow so the list stays legible as it grows
function flowAccent(id, palette) {
  const ring = [palette.system, palette.manual, palette.decision, palette.green];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ring[h % ring.length];
}

function matchesQuery(item, q) {
  if (!q) return true;
  if (item.name.toLowerCase().includes(q)) return true;
  return (item.children || []).some((c) => matchesQuery(c, q));
}

function FlowRow({ item, depth, flowId, onSelect, palette, query }) {
  const hasKids = item.children && item.children.length > 0;
  const [open, setOpen] = React.useState(true);
  const active = item.id === flowId;
  const accent = flowAccent(item.id, palette);
  const expanded = query ? true : open;

  return (
    <div>
      <div
        onClick={() => { if (!item.missing) onSelect(item.id); }}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "7px 10px 7px " + (10 + depth * 16) + "px",
          margin: "1px 8px", borderRadius: 9,
          cursor: item.missing ? "default" : "pointer",
          background: active ? accent + "1f" : "transparent",
          boxShadow: active ? "inset 2px 0 0 " + accent : "none",
          color: item.missing ? palette.dim : active ? palette.text : "#c7cede",
          opacity: item.missing ? 0.5 : 1,
          transition: "background .12s"
        }}
        onMouseEnter={(e) => { if (!active && !item.missing) e.currentTarget.style.background = "rgba(255,255,255,.045)"; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        {hasKids ? (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            style={{
              flexShrink: 0, width: 16, height: 16, padding: 0, border: "none", background: "transparent",
              color: palette.dim, cursor: "pointer", display: "grid", placeItems: "center",
              transform: expanded ? "rotate(90deg)" : "none", transition: "transform .14s", fontSize: 10
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >▶</button>
        ) : (
          <span style={{ flexShrink: 0, width: 16 }} />
        )}

        <span style={{
          flexShrink: 0, width: 9, height: 9, borderRadius: 3,
          background: accent + "33", border: "1.4px solid " + accent
        }} />

        <span style={{
          flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 600 : 500,
          letterSpacing: "-.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>{item.name}</span>

        {item.missing && (
          <span style={{
            flexShrink: 0, fontFamily: "var(--mono)", fontSize: 8.5, letterSpacing: ".08em",
            color: palette.dim, border: "1px solid " + palette.border, borderRadius: 5, padding: "1px 5px"
          }}>SOON</span>
        )}
        {hasKids && !item.missing && (
          <span style={{
            flexShrink: 0, fontFamily: "var(--mono)", fontSize: 10, color: palette.dim,
            background: "rgba(255,255,255,.05)", borderRadius: 5, padding: "1px 6px"
          }}>{item.children.length}</span>
        )}
      </div>

      {hasKids && expanded && item.children
        .filter((c) => matchesQuery(c, query))
        .map((c) => (
          <FlowRow key={c.id} item={c} depth={depth + 1} flowId={flowId}
            onSelect={onSelect} palette={palette} query={query} />
        ))}
    </div>
  );
}

function FlowSidebar({ nav, flowId, onSelect, palette, onCollapse }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const total = nav.reduce((n, g) => n + g.items.length, 0);
  const groups = nav
    .map((g) => ({ ...g, items: g.items.filter((it) => matchesQuery(it, q)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{
      position: "absolute", top: 64, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 45,
      background: palette.panelSolid, borderRight: "1px solid " + palette.border,
      backdropFilter: "blur(14px)", display: "flex", flexDirection: "column"
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 12px 10px 16px"
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: ".16em", color: palette.dim, fontWeight: 600 }}>FLOWS</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: palette.dim, opacity: .7 }}>{total}</span>
        </div>
        <button onClick={onCollapse} title="Collapse" aria-label="Collapse navigator" style={{
          width: 26, height: 26, borderRadius: 7, border: "1px solid " + palette.border,
          background: palette.panel, color: palette.dim, cursor: "pointer", display: "grid", placeItems: "center"
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2.5 4 6.5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ padding: "0 12px 10px" }}>
        <div style={{ position: "relative" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: .5, color: palette.dim }}>
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="m8.7 8.7 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search flows…"
            style={{
              width: "100%", boxSizing: "border-box", height: 32, padding: "0 10px 0 30px",
              background: palette.bg, border: "1px solid " + palette.border, borderRadius: 9,
              color: palette.text, fontSize: 12.5, fontFamily: "var(--sans)", outline: "none"
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "2px 0 16px" }}>
        {groups.length === 0 && (
          <div style={{ padding: "20px 18px", color: palette.dim, fontSize: 12.5, textAlign: "center" }}>
            No flows match “{query}”.
          </div>
        )}
        {groups.map((g, gi) => (
          <div key={g.group || "_"} style={{ marginTop: gi === 0 ? 4 : 12 }}>
            {g.group && (
              <div style={{
                fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".13em", textTransform: "uppercase",
                color: palette.dim, opacity: .85, padding: "4px 16px 6px"
              }}>{g.group}</div>
            )}
            {g.items.map((it) => (
              <FlowRow key={it.id} item={it} depth={0} flowId={flowId}
                onSelect={onSelect} palette={palette} query={q} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { FlowSidebar, SIDEBAR_W, flowAccent });
