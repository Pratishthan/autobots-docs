// Business Process Explorer — runs only on the page that contains #process-explorer.
// Renders Mermaid programmatically (so we control securityLevel and can swap diagrams
// on tab switch) and drives a side panel from the generator's JSON feed.

(function () {
  const ROOT = document.getElementById("process-explorer");
  if (!ROOT) return; // not the explorer page

  const dataSrc = ROOT.dataset.src || "data/index.json";
  const switcherEl = ROOT.querySelector(".bpx-switcher");
  const graphEl = ROOT.querySelector(".bpx-canvas .bpx-graph");
  const panelEl = ROOT.querySelector(".bpx-panel");

  let mermaid;
  let DATA = null;
  let current = null; // process object

  function loadMermaid() {
    const sources = [
      "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs",
      "https://unpkg.com/mermaid@11/dist/mermaid.esm.min.mjs",
    ];
    return (async () => {
      let lastErr;
      for (const url of sources) {
        try {
          return (await import(url)).default;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error("All Mermaid CDNs blocked");
    })();
  }

  function buildSource(proc) {
    let src =
      proc.def +
      "\n  classDef inSys fill:#2a2118,stroke:#e8853a,stroke-width:2px,color:#f2ece3;" +
      "\n  classDef outSys fill:#1e2624,stroke:#6fa8a0,stroke-width:2px,stroke-dasharray:5 4,color:#f2ece3;";
    const ins = [],
      outs = [];
    Object.entries(proc.steps).forEach(([id, m]) => (m.mode === "in" ? ins : outs).push(id));
    if (ins.length) src += `\n  class ${ins.join(",")} inSys;`;
    if (outs.length) src += `\n  class ${outs.join(",")} outSys;`;
    return src;
  }

  async function render(proc) {
    current = proc;
    const { svg } = await mermaid.render("bpx_" + proc.id + "_" + Date.now(), buildSource(proc));
    graphEl.innerHTML = svg;
    wireClicks();
    resetPanel();
  }

  function wireClicks() {
    graphEl.querySelectorAll(".node").forEach((node) => {
      const domId = node.id || "";
      const match = Object.keys(current.steps).find(
        (stepId) =>
          domId === stepId ||
          domId.includes("-" + stepId + "-") ||
          domId.startsWith("flowchart-" + stepId),
      );
      if (!match) return;
      node.classList.add("clickable");
      node.addEventListener("click", () => showStep(match, node));
    });
  }

  function resetPanel() {
    panelEl.classList.remove("out-mode");
    panelEl.innerHTML =
      '<p class="hint">Select a step in <strong>' +
      current.label +
      "</strong> to inspect it. Solid orange = in-system; dashed teal = outside the system.</p>";
  }

  function componentChip(c) {
    if (!c) return "";
    const tpl = DATA.component_url_template;
    if (c.id && tpl) {
      const url = tpl.replace("{id}", encodeURIComponent(c.id));
      return `<div><a class="bpx-chip" href="${url}">Component: ${c.label} ↗</a></div>`;
    }
    return `<div><span class="bpx-chip">Component: ${c.label}</span></div>`;
  }

  function showStep(id, node) {
    const m = current.steps[id];
    if (!m) return;
    graphEl.querySelectorAll(".node.sel").forEach((n) => n.classList.remove("sel"));
    node.classList.add("sel");
    const isIn = m.mode === "in";
    panelEl.classList.toggle("out-mode", !isIn);
    panelEl.innerHTML = `
      <span class="bpx-tag ${isIn ? "in" : "out"}">${isIn ? "◆ In-system action" : "◇ Out-of-system action"}</span>
      <h3>${m.title}</h3>
      <p class="role">${m.role}</p>
      <div class="bpx-seclabel">Description</div>
      <p class="desc">${m.desc}</p>
      <div class="bpx-seclabel">Actions</div>
      <ul class="bpx-actions">${m.activities.map((a) => `<li>${a}</li>`).join("")}</ul>
      ${componentChip(m.component)}`;
  }

  function buildSwitcher() {
    switcherEl.innerHTML = DATA.processes
      .map(
        (p, i) =>
          `<button data-idx="${i}"${i === 0 ? ' class="active"' : ""}>${p.label}</button>`,
      )
      .join("");
    switcherEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      switcherEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      render(DATA.processes[+btn.dataset.idx]);
    });
  }

  function fail(msg) {
    panelEl.innerHTML = `<p class="hint">Explorer could not load — ${msg}</p>`;
  }

  Promise.all([fetch(dataSrc).then((r) => r.json()), loadMermaid()])
    .then(([data, m]) => {
      DATA = data;
      mermaid = m;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "base",
        themeVariables: {
          lineColor: "#8a7a63",
          primaryTextColor: "#f2ece3",
          mainBkg: "#262019",
          clusterBkg: "#1d1916",
        },
        flowchart: { curve: "basis", nodeSpacing: 55, rankSpacing: 70 },
      });
      buildSwitcher();
      return render(DATA.processes[0]);
    })
    .catch((e) =>
      fail("usually a network/firewall blocking the CDN, or the JSON feed path. " + e.message),
    );
})();
