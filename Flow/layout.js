/* Layout + orthogonal edge router for the process flow.
   Produces absolute pixel boxes for each node and SVG path strings for each edge. */
(function () {
  const COLW = 312;        // horizontal slot width
  const LANEH = 168;       // vertical lane height
  const ORIGIN_X = 96;
  const ORIGIN_Y = 300;    // y of lane 0 centers
  const R = 16;            // corner radius for orthogonal turns

  // node sizes by type
  const SIZE = {
    system:   { w: 224, h: 96 },
    manual:   { w: 224, h: 96 },
    decision: { w: 150, h: 150 },
    terminal: { w: 200, h: 76 }
  };

  function sizeFor(node) {
    return SIZE[node.type] || SIZE.system;
  }

  /* Auto-placement: fill col/lane for any node that wasn't pinned in YAML.
     Pinned nodes are immovable anchors; unplaced nodes are layered by longest
     path over the topology (reject edges excluded — they drop to the rail) and
     slotted into the nearest free lane, biased toward their predecessors so
     edges stay short. Runs once; after it fills coords, re-runs are no-ops, so
     the picture never reflows on theme/zoom changes. */
  function autoPlace(flow) {
    if (!flow.nodes.some((n) => n.col == null || n.lane == null)) return;

    const byId = {};
    flow.nodes.forEach((n) => { byId[n.id] = n; });
    const preds = {};
    flow.nodes.forEach((n) => { preds[n.id] = []; });
    flow.edges.forEach((e) => {
      if (e.kind === "reject") return;
      if (byId[e.from] && byId[e.to]) preds[e.to].push(e.from);
    });

    // ---- columns: longest-path relaxation, pinned cols held fixed ----
    const col = {};
    flow.nodes.forEach((n) => { col[n.id] = n.col != null ? n.col : 0; });
    const N = flow.nodes.length;
    for (let it = 0; it < N + 2; it++) {
      let changed = false;
      flow.edges.forEach((e) => {
        if (e.kind === "reject") return;
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b || b.col != null) return;       // pinned target keeps its col
        if (col[e.from] + 1 > col[e.to]) { col[e.to] = col[e.from] + 1; changed = true; }
      });
      if (!changed) break;
    }

    // ---- lanes: pinned occupy their lane; others take nearest free slot ----
    const occ = {};
    const slots = (c) => (occ[c] || (occ[c] = new Set()));
    const lane = {};
    flow.nodes.forEach((n) => {
      if (n.lane != null) { lane[n.id] = n.lane; slots(col[n.id]).add(n.lane); }
    });

    flow.nodes
      .filter((n) => n.lane == null)
      .sort((x, y) => col[x.id] - col[y.id])     // place earlier columns first
      .forEach((n) => {
        const c = col[n.id];
        const placed = preds[n.id].map((p) => lane[p]).filter((v) => v != null);
        const desired = placed.length ? Math.round(placed.reduce((a, b) => a + b, 0) / placed.length) : 0;
        const set = slots(c);
        let l = desired;
        if (set.has(l)) {
          for (let k = 1; ; k++) {
            if (!set.has(desired + k)) { l = desired + k; break; }
            if (!set.has(desired - k)) { l = desired - k; break; }
          }
        }
        set.add(l);
        lane[n.id] = l;
      });

    flow.nodes.forEach((n) => { n.col = col[n.id]; n.lane = lane[n.id]; });
  }

  function layout(flow) {
    autoPlace(flow);

    const colCenterX = (col) => ORIGIN_X + col * COLW + SIZE.system.w / 2;
    const laneCenterY = (lane) => ORIGIN_Y + lane * LANEH;

    const boxes = {};
    let maxX = 0, maxY = 0, minY = Infinity;

    flow.nodes.forEach((n) => {
      const s = sizeFor(n);
      const cx = colCenterX(n.col);
      const cy = laneCenterY(n.lane);
      const box = {
        id: n.id, node: n,
        x: cx - s.w / 2, y: cy - s.h / 2,
        w: s.w, h: s.h, cx, cy,
        col: n.col, lane: n.lane
      };
      boxes[n.id] = box;
      maxX = Math.max(maxX, box.x + box.w);
      maxY = Math.max(maxY, box.y + box.h);
      minY = Math.min(minY, box.y);
    });

    const canvas = {
      w: maxX + ORIGIN_X,
      h: maxY + 120,
      top: Math.max(0, minY - 80)
    };

    // reject rail: a shared horizontal line near the declined terminal
    const rejectNode = flow.nodes.find((n) => n.term === "declined");
    const railY = rejectNode ? laneCenterY(rejectNode.lane) : maxY + 60;

    const edges = flow.edges.map((e) => {
      const a = boxes[e.from];
      const b = boxes[e.to];
      if (!a || !b) return null;
      const geom = routeEdge(a, b, e, railY);
      return { ...e, ...geom, fromBox: a, toBox: b };
    }).filter(Boolean);

    return { boxes, edges, canvas, railY };
  }

  function rounded(points) {
    // build a path string through points with rounded corners
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i - 1], p1 = points[i], p2 = points[i + 1];
      const v1x = p1.x - p0.x, v1y = p1.y - p0.y;
      const v2x = p2.x - p1.x, v2y = p2.y - p1.y;
      const len1 = Math.hypot(v1x, v1y) || 1;
      const len2 = Math.hypot(v2x, v2y) || 1;
      const r = Math.min(R, len1 / 2, len2 / 2);
      const ax = p1.x - (v1x / len1) * r, ay = p1.y - (v1y / len1) * r;
      const bx = p1.x + (v2x / len2) * r, by = p1.y + (v2y / len2) * r;
      d += ` L ${ax} ${ay} Q ${p1.x} ${p1.y} ${bx} ${by}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  }

  function routeEdge(a, b, e, railY) {
    // Reject edges drop to the shared rail then run right into the declined node.
    if (e.kind === "reject") {
      const sx = a.cx, sy = a.y + a.h;
      const tx = b.x, ty = b.cy;
      const pts = [
        { x: sx, y: sy },
        { x: sx, y: railY },
        { x: tx, y: railY }
      ];
      // if target is at a different y than rail (shouldn't be), add final segment
      if (Math.abs(ty - railY) > 1) pts.push({ x: tx, y: ty });
      return { path: rounded(pts), end: { x: tx, y: railY }, dir: "right", labelPos: { x: sx + 18, y: (sy + railY) / 2 } };
    }

    // Same column → vertical connector (e.g. revision merging up into the spine)
    if (a.col === b.col) {
      if (a.cy > b.cy) {
        // a below b: go up from a.top to b.bottom
        const pts = [{ x: a.cx, y: a.y }, { x: b.cx, y: b.y + b.h }];
        return { path: rounded(pts), end: { x: b.cx, y: b.y + b.h }, dir: "up", labelPos: { x: a.cx + 14, y: (a.y + b.y + b.h) / 2 } };
      } else {
        const pts = [{ x: a.cx, y: a.y + a.h }, { x: b.cx, y: b.y }];
        return { path: rounded(pts), end: { x: b.cx, y: b.y }, dir: "down", labelPos: { x: a.cx + 14, y: (a.y + a.h + b.y) / 2 } };
      }
    }

    // Normal forward edge: exit right, optional Z to reach target lane, enter left.
    const sx = a.x + a.w, sy = a.cy;
    const tx = b.x, ty = b.cy;
    if (Math.abs(sy - ty) < 1) {
      return { path: rounded([{ x: sx, y: sy }, { x: tx, y: ty }]), end: { x: tx, y: ty }, dir: "right", labelPos: { x: (sx + tx) / 2, y: sy - 12 } };
    }
    const midX = sx + Math.max(28, (tx - sx) / 2);
    const pts = [
      { x: sx, y: sy },
      { x: midX, y: sy },
      { x: midX, y: ty },
      { x: tx, y: ty }
    ];
    return { path: rounded(pts), end: { x: tx, y: ty }, dir: "right", labelPos: { x: midX, y: (sy + ty) / 2 } };
  }

  // adjacency helpers for dependency highlighting
  function buildGraph(flow) {
    const succ = {}, pred = {};
    flow.nodes.forEach((n) => { succ[n.id] = []; pred[n.id] = []; });
    flow.edges.forEach((e) => {
      if (succ[e.from] && !succ[e.from].includes(e.to)) succ[e.from].push(e.to);
      if (pred[e.to] && !pred[e.to].includes(e.from)) pred[e.to].push(e.from);
    });
    return { succ, pred };
  }

  function reach(map, start) {
    const seen = new Set();
    const stack = [...(map[start] || [])];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      (map[id] || []).forEach((x) => stack.push(x));
    }
    return seen;
  }

  function relatedSet(flow, id, mode) {
    if (!id) return null;
    const g = buildGraph(flow);
    const set = new Set([id]);
    if (mode === "chain") {
      reach(g.pred, id).forEach((x) => set.add(x));
      reach(g.succ, id).forEach((x) => set.add(x));
    } else {
      (g.pred[id] || []).forEach((x) => set.add(x));
      (g.succ[id] || []).forEach((x) => set.add(x));
    }
    return set;
  }

  window.FlowLayout = { layout, buildGraph, relatedSet, COLW, LANEH };
})();
