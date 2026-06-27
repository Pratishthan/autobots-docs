# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Flow** — an interactive process-map prototype. A single-page canvas (pan/zoom,
node detail, dependency highlighting, themes) that renders business process flows,
plus a flow-aware chat assistant.

Two halves:
- **Frontend** (`Flow.html` + `*.jsx` + `*.js`) — no build step. Babel-standalone
  transpiles JSX in the browser; React 18 UMD is loaded from a CDN.
- **Backend** (`backend/`) — a Chainlit/FastAPI server that is the **single source
  of truth** for flow data and powers the chat drawer.

## Running it

### Backend (required for the canvas to load data)
```bash
cd backend
source .venv/bin/activate
.venv/bin/chainlit run app.py -h --port 8000   # -h = headless (no Chainlit UI, server only)
```


### Frontend
Serve the `Flow/` directory over HTTP (e.g. `python3.12 -m http.server 3000`) and open
`Flow.html` — do **not** open via `file://` (import maps + fetch need an origin).
The canvas **requires a reachable backend**: `flow-loader.js` fetches
`GET /api/flows` and has **no in-browser fallback** — if the backend is down the
app shows a "Failed to load flow data" error. (Chat is separate and *does* fall
back to a built-in mock when the server is unreachable.)

Point the frontend at the backend by editing `window.FLOW_AGENT` near the top of
`Flow.html` (`server`, `mode: "chainlit" | "mock" | "auto"`). This one object
configures **both** the data loader and the chat adapter.

## Architecture: one parser, two consumers

The central design rule: **the browser never parses the raw data files.**
`backend/flow_store.py` is the only parser of `data/`; both the agent and the
canvas consume its output, so the two can't drift.

```
data/<id>.flow.mmd  (Mermaid topology: nodes + edges, type via :::class)
data/<id>.cards.yaml (card content keyed by node id, optional pos: for pinning)
data/index.yaml     (registry: navigator order, groups, nested children/sub-flows)
        │
        ▼  parsed once (lru_cache) by
flow_store.py ── Flow{nodes:[Node], edges:[Edge]} ──┐
        │                                            │
   app.py exposes:                            agent.py reads Flow/Node
   GET /api/flows        → load_bundle()       to answer questions
   GET /api/flows/{id}   → flow_to_dict()
        │
        ▼  fetched by
flow-loader.js → window.FLOWS / FLOW_ORDER / FLOW_NAV
        │
        ▼  awaited via window.__flowsReady, then
app.jsx mounts <App/>
```

### Frontend module load order (defined in `Flow.html`, matters)
1. `flow-loader.js` — fetch + expose `window.FLOWS`, `__flowsReady` (Promise).
2. `layout.js` — `window.FlowLayout`: pure geometry. `autoPlace()` assigns
   col/lane to any node not pinned (`pos:` in cards.yaml) via longest-path
   layering; `routeEdge()` builds orthogonal SVG paths; `relatedSet()` powers
   dependency highlighting.
3. JSX components (`type="text/babel"`): `tweaks-panel` → `flow-sidebar` →
   `nodes` → `panel` → `chat-panel` → `chat-agent` → `app`. `app.jsx` mounts
   only after `__flowsReady` resolves.

Components communicate via `window.*` globals, not imports (no bundler):
`window.FlowLayout`, `window.FLOWS`, `window.ChatShell`, `window.FLOW_AGENT`,
`window.SIDEBAR_W`, `window.CHAT_W`.

### React-sharing shims
`@chainlit/react-client` + `recoil` are pulled live from esm.sh, but must share
the page's single React instance. The `react-shim.js` / `react-dom-shim.js` /
`react-jsx-runtime-shim.js` files + the `<script type="importmap">` in `Flow.html`
re-export the UMD globals as ESM so CDN modules and the app use the same React.
`chat-agent.jsx` uses `new Function("s","return import(s)")(spec)` to hide the
dynamic import from Babel so it stays a real ESM import.

## Chat contract (frontend ↔ backend)

The frontend is a `@chainlit/react-client` **webapp** client — it drives the
existing chat drawer, *not* Chainlit's own UI. The backend's only jobs:
- **Stream tokens** via `cl.Message.stream_token`.
- **Return `metadata.refs`** = a list of node **ids** on the assistant message.
  The frontend renders each as a tappable chip that jumps to that node on the
  canvas. Ids must match `data/<flow>.flow.mmd` / `.cards.yaml`.
- **Be flow-aware.** Every user message is stamped with `metadata.flow_id` (and
  `active_node_id` = the node open on the canvas); `on_chat_start` also gets
  `FLOW_ID`/`FLOW_NAME` as session env as a backup. The per-message `flow_id` is
  authoritative so answers can't drift; switching flows clears chat history.

`agent.py` has two interchangeable paths: `astream_agent()` (LangChain + OpenAI,
RAG-grounded on the matched cards) and `answer_rule_based()` (lexical match, no
key). `compute_refs()` resolves chip ids up front. "Deictic" queries ("this
step", "the one I'm looking at") pin `active_node_id` to the front of results.

## Adding / editing a flow

1. Create `data/<id>.flow.mmd` (Mermaid `flowchart LR`). Node line:
   `id["Label"]:::class` where class ∈ `system | manual | decision | start | end
   | declined`. Edges: `A --> B`, labelled `A -->|Label| B`, reject `A --x B` /
   `A -- Label --x B` (reject edges drop to the shared rail to the declined node).
2. Create `data/<id>.cards.yaml`: a `flow:` block (`name`, `subtitle`) and a
   `cards:` map keyed by node id (`owner/team/sla/desc/inputs/outputs/steps/
   documents/links`, optional `subflow:` to link a sub-flow, optional `pos:
   {col, lane}` to pin layout — otherwise `autoPlace` positions it).
3. Register it in `data/index.yaml` under `flows:` (with optional `group:` and
   nested `children:` for sub-flow drill-down).
4. After editing data while the server runs, append `?fresh=1` to `/api/flows`
   (or call `reload_data()`) to bust the `lru_cache` — no restart needed.

`documents` and `links` are tolerant: a bare string or a `{name/format/status/
link}` / `{label,url}` dict both normalize (see `flow_store._normalize_*`).

## Gotchas

- **No build/test/lint tooling.** No `package.json`, no test suite — this is a
  prototype. Verify changes by serving the files and loading `Flow.html`.
- **FastAPI route ordering:** `app.py` re-inserts the `/api/flows` routes at the
  front of `fastapi_app.routes` because Chainlit's SPA catch-all (`/{full_path}`)
  is registered first and would otherwise swallow them (serving index.html).
  Don't remove that re-ordering block.
- **`backend/README.md`** still describes an in-browser static fallback for data;
  the current `flow-loader.js` removed it (live backend required). Trust the code.
