// Process-flow interactivity: a slide-in detail drawer for Mermaid flow nodes.
//
// We do NOT use Mermaid's own `click ... call` directives: Material for MkDocs renders
// Mermaid in `securityLevel: 'strict'`, which silently disables all click callbacks.
// Instead we attach native DOM listeners to the rendered SVG nodes after Mermaid runs,
// which works regardless of Mermaid's security level.

window.openStepPanel = function (stepId) {
  const src = document.getElementById("step-" + stepId);
  const panel = document.getElementById("process-panel");
  const overlay = document.getElementById("process-overlay");
  if (!src || !panel) return;
  panel.querySelector(".panel-body").innerHTML = src.innerHTML; // single-source clone
  panel.classList.add("open");
  if (overlay) overlay.classList.add("open");
};

window.closeStepPanel = function () {
  const panel = document.getElementById("process-panel");
  const overlay = document.getElementById("process-overlay");
  if (panel) panel.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
};

// The step ids available on this page (derived from the rendered sections).
function stepIds() {
  return Array.from(document.querySelectorAll("section.process-step")).map((s) =>
    s.id.replace(/^step-/, ""),
  );
}

// Mermaid node <g> ids look like "flowchart-<stepId>-<n>". Step ids contain hyphens,
// so match by the LONGEST step id contained in the node id (avoids "approve" matching
// "auto-approve").
function stepIdForNode(nodeEl, ids) {
  const raw = nodeEl.id || "";
  let best = null;
  for (const id of ids) {
    if (raw.includes(id) && (!best || id.length > best.length)) best = id;
  }
  return best;
}

function bindNodes(root) {
  const ids = stepIds();
  if (!ids.length) return;
  root.querySelectorAll("g.node").forEach((g) => {
    if (g.dataset.panelBound) return;
    const id = stepIdForNode(g, ids);
    if (!id) return;
    g.dataset.panelBound = "1";
    g.style.cursor = "pointer";
    g.addEventListener("click", () => window.openStepPanel(id));
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.querySelector("#process-panel .panel-close");
  const overlay = document.getElementById("process-overlay");
  if (closeBtn) closeBtn.addEventListener("click", window.closeStepPanel);
  if (overlay) overlay.addEventListener("click", window.closeStepPanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeStepPanel();
  });

  // Mermaid renders asynchronously and after our handler. Watch for the SVG to appear
  // and (re)bind nodes — also covers Material's instant-navigation re-renders.
  const observer = new MutationObserver(() => bindNodes(document));
  observer.observe(document.body, { childList: true, subtree: true });
  bindNodes(document); // in case it already rendered
});
