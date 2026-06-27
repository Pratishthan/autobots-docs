# Flow Assistant — Chainlit backend

This is the Python side that `chat-agent.jsx` (the live adapter in the Flow app)
talks to. The frontend is a **webapp** client of `@chainlit/react-client`; it
does NOT use Chainlit's own UI — it drives your existing chat drawer. So your job
on the backend is small and very specific:

## The contract (what the frontend needs from you)

### 1. Serve the flow data (single source of truth)

`flow_store.py` is now the **only** parser of the `data/` folder. `app.py`
exposes it over two endpoints, and the canvas (`flow-loader.js`) fetches them
instead of re-parsing the raw `.mmd`/`.yaml` files in the browser — so the agent
and the canvas can no longer drift:

| endpoint | returns |
|---|---|
| `GET /api/flows` | `{ flows: { <id>: <flow> }, order: [...], nav: [...] }` — the whole bundle the navigator + canvas need, in one call. |
| `GET /api/flows/{id}` | a single parsed `<flow>` (handy for drill-down / debugging). |

Each `<flow>` is `{ id, name, subtitle, nodes:[…], edges:[…] }`; nodes carry
`type/term/title/col/lane/pinned/subflow/owner/team/sla/desc/inputs/outputs/steps/documents/links`
— the exact shape `layout.js` and `nodes.jsx` consume. Append `?fresh=1` to bust
the parse cache after editing a data file without restarting.

The frontend points at this with the same `window.FLOW_AGENT.server` it uses for
chat (see below). If the server is unreachable it silently falls back to parsing
the static `data/` files in-browser, so the prototype still runs offline.

### 2. Drive the chat drawer

1. **Stream tokens.** The drawer shows a typing indicator until your first token,
   then streams text into the assistant bubble. → use `cl.Message.stream_token`.
2. **Return node references as `metadata.refs`.** A list of node **ids** (e.g.
   `["kyc", "underwriting"]`) on the *assistant* message. The frontend maps each id
   to a node and renders a tappable chip that jumps to it on the canvas. Ids must
   match `data/<flow>.flow.mmd` / `.cards.yaml`. → `msg.metadata = {"refs": [...]}`.
3. **Be flow-aware.** On connect the frontend passes the active flow as session
   env: `{ FLOW_ID, FLOW_NAME }`. Read it with `cl.user_session.get("env")`.

Everything else (chips, jump-to-node, suggestions, greeting) is the frontend's
job and already works.

## Files

| file | purpose |
|---|---|
| `app.py` | Chainlit entrypoint — `@cl.on_chat_start` / `@cl.on_message`. |
| `flow_store.py` | Parses the **same** `data/*.flow.mmd` + `*.cards.yaml` so the agent and the canvas share one source of truth. |
| `agent.py` | LangChain agent + a `lookup_steps` tool. Whatever steps the tool resolves become your `refs`. |
| `requirements.txt` | deps. |
| `.env.example` | copy to `.env`, add your key. |

## Run it

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add OPENAI_API_KEY
chainlit run app.py -h --port 8000
```

`-h` (headless) skips opening Chainlit's own browser UI — you only want the server.

## Point the frontend at it

The adapter is inert until you set `window.FLOW_AGENT` **before the app mounts**.
Add this inline `<script>` in `Flow.html`, above the babel component scripts:

```html
<script>
  window.FLOW_AGENT = {
    mode: "chainlit",
    server: "http://localhost:8000",   // your Chainlit server
    clientType: "webapp",
    // accessToken: "<JWT>",            // only if you enable Chainlit auth
  };
</script>
```

If the server is unreachable the adapter silently falls back to the built-in mock,
so the prototype never hard-fails.

## CORS / websockets

The webapp client opens a Socket.IO connection to `server`. Chainlit must allow your
page's origin. In `.env`:

```
CHAINLIT_ALLOW_ORIGINS=http://localhost:3000,https://your-flow-host
```

(Use the exact origin Flow.html is served from. `*` works for local dev but don't
ship it.)

## No-LLM smoke test

Don't want to wire an LLM yet? `agent.py` has `answer_rule_based()` — a port of the
mock's intent matching that needs zero API keys. `app.py` falls back to it
automatically when `OPENAI_API_KEY` is unset, so you can verify the wire end-to-end
first, then turn on the real agent.
