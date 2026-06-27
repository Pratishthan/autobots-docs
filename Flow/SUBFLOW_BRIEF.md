# Sub-flow linkage — implementation brief

Handoff for the next session. Goal: **parent → child (sub-flow) navigation** —
click a node in a parent flow to drill into its own detailed sub-flow, with
breadcrumb back-navigation.

## Where things stand (already built)
- **Data is externalized.** Each flow = `data/<id>.flow.mmd` (Mermaid topology:
  nodes + edges, node type via `:::class`) + `data/<id>.cards.yaml` (card content
  keyed by node id, plus optional `pos:` for pinned grid placement).
- **Registry:** `data/index.yaml` → `flows: [{ id, group, children }]`.
  `children:` is ALREADY parsed by `flow-loader.js` and rendered as nested,
  indented rows in the left navigator (`flow-sidebar.jsx`). Child flows whose
  data files don't exist yet show a "SOON" tag.
- **Navigator + breadcrumb** (`flow-sidebar.jsx`, `TopBar` in `app.jsx`) already
  support hierarchy visually. `findTrail()` in app.jsx builds Group › … › Flow.
- **Layout** (`layout.js`) auto-places any node missing `pos:`, so sub-flow nodes
  need no manual positioning.

## What's left to build (this session's job)
1. **Link nodes → sub-flows.** Add a `subflow: <child_id>` field to a card in
   the parent's `cards.yaml`. Loader should surface it on the node object.
2. **Drill-down affordance.** Nodes with a `subflow` get a visible badge
   (e.g. a small "⤢ / open" glyph or double-border) so it's obvious they're
   drillable. Decide entry interaction — RECOMMEND: dedicated "Open sub-flow"
   button in the DetailPanel (keep single-click = select/inspect, avoid
   hijacking double-click).
3. **Navigation + history.** Drilling in sets `flowId` to the child and pushes
   onto a trail; breadcrumb crumbs become clickable to pop back. Each level
   keeps its own pan/zoom (or re-fit on enter). A back affordance in the child.
4. **Depth:** support arbitrary nesting (child → grandchild), not just one level —
   the registry + breadcrumb already allow it; just don't hard-code depth 1.

## Open questions to confirm with user
- Entry interaction: DetailPanel button vs. double-click the node?
- On drill-in: preserve separate pan/zoom per level, or always re-fit?
- Return path: breadcrumb only, or also an explicit "back" node/button in child?
- Which real node(s) should own a sub-flow first, and what's in them?

## File map
- `Flow.html` — entry; loads js-yaml, flow-loader, layout, then babel components.
- `flow-loader.js` — Mermaid+YAML parsers → `window.FLOWS`, `FLOW_ORDER`, `FLOW_NAV`.
- `flow-sidebar.jsx` — left navigator (search, groups, nested rows).
- `app.jsx` — viewport, pan/zoom, TopBar breadcrumb, mount.
- `nodes.jsx` — node cards. `panel.jsx` — DetailPanel + legend + zoom.
- `data/` — `index.yaml`, `<id>.flow.mmd`, `<id>.cards.yaml`.
- `_legacy/flows.js` — original hardcoded data (reference only; not loaded).
