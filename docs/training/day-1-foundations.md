# Day 1 — Foundations & First Run

**Goal of the day:** Every trainee can run a Dynagent app locally and explain, in their own words, the path a single user message takes through one agent.

By end of day, the mental model should be: *an agent is a prompt + a set of tools + an optional output schema, wired together by the Dynagent framework, talking to an LLM.*

## Learning objectives

By the end of Day 1, trainees can:

1. Explain what an LLM agent is and how it differs from a plain function or a chatbot.
2. Describe the workspace layout and the shared-venv model.
3. Run Jarvis locally in the Chainlit UI.
4. Point at the three files that define an agent (`agents.yaml`, a prompt `.md`, an optional schema `.json`) and say what each does.
5. Trace one request from the UI through a tool and back.

---

## Morning

### Lecture 1 — What is an agent? (45 min)

Talking points (anchor on [What is an agent](../core-concepts/what-is-an-agent.md)):

- **From function to agent.** A Python function has fixed logic. An LLM takes natural language and *decides* what to do. An **agent** wraps an LLM with: a **prompt** (its instructions/role), a set of **tools** (functions it may call), and optionally an **output schema** (the structured shape it must return).
- **The loop.** User message → LLM reads prompt + message → LLM may call tools → tool results feed back → LLM produces a final answer. This "reason → act → observe" loop is the heart of agentic apps.
- **Why tools matter.** The LLM can't query your database or call an API on its own. Tools are the *hands*. We give the model a menu of tools; it picks.
- **Multi-agent.** One agent rarely does everything. We compose **specialist agents** (a weather agent, a joke agent, a coordinator) and let them **hand off** to each other. Jarvis's Concierge domain has exactly this: welcome, joke, weather.
- **Prompts are source code.** In this stack prompts live as **version-controlled markdown files** next to the code. Changing behavior often means editing a `.md`, not Python. This is a recurring theme all week.

> Instructor note: keep this conceptual. No code yet. Use the Jarvis Concierge domain as the running example: "by lunch you'll be talking to this."

### Lecture 2 — The workspace & the shared venv (20 min)

Talking points (anchor on [What is a workspace](../core-concepts/what-is-a-workspace.md) and `CLAUDE.md`):

- The monorepo workspace holds **four repos** sharing **one** venv at `ws-autobots/.venv/`:
  - `autobots-devtools-shared-lib` — the **Dynagent framework** (the engine).
  - `autobots-agents-jarvis` — a **demo app** (Concierge, Customer Support, Sales) — our sandbox this week.
  - `autobots-agents-mer`, `autobots-agents-pay` — other real apps (we'll look, not touch).
- **One venv, not four.** Activate from the workspace root: `source .venv/bin/activate`.
- **Apps depend on the shared lib.** Jarvis has a local `develop = true` path dependency on shared-lib — editing the lib is immediately visible to the app.

### Lab 1 — Get the environment running (90 min)

> Checkpoint at end: `make all-checks` is green and the app starts. Do **not** proceed to the afternoon until every pair clears this.

Steps (facilitator walks the first few on screen, pairs follow):

```bash
# 1. From the workspace root
cd ws-autobots
source .venv/bin/activate        # the SHARED venv

# 2. One-time setup if not already done
make setup                       # creates shared .venv + pre-commit hooks
make install-dev                 # installs all repos with dev deps

# 3. Sanity-check the whole workspace
make all-checks                  # format-check + lint + type-check + test
```

Then configure and run Jarvis:

```bash
cd autobots-agents-jarvis
cp .env.example .env             # then edit: add your API key(s)
# Ensure DYNAGENT_CONFIG_ROOT_DIR points at the concierge domain config
make chainlit-dev                # starts the Chainlit UI (default port 1337)
```

Open the browser, say "hi" to Jarvis, ask it to tell a joke, then ask for the weather in a city.

**Common blockers (have these answers ready):**

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ModuleNotFoundError` for shared-lib | venv not activated, or installed per-repo | Activate `ws-autobots/.venv`; re-run `make install-dev` from workspace root |
| Pyright errors everywhere | monorepo mode off | Check `pyrightconfig`/`pyproject` has `venvPath = ".."`, `venv = ".venv"` |
| Agent errors on startup | `DYNAGENT_CONFIG_ROOT_DIR` unset/wrong | Set it in `.env` to the concierge config path |
| LLM auth error | missing/invalid API key | Check the provider key in `.env` |

---

## Afternoon

### Lecture 3 — Anatomy of a domain (30 min)

Open `autobots-agents-jarvis/agent_configs/concierge/` live and walk the three building blocks.

**`agents.yaml`** — the wiring. Each agent declares its prompt, optional output schema, batch flag, and tool list:

```yaml
agents:
  weather_agent:
    prompt: "02-weather"                 # → prompts/02-weather.md
    output_schema: "weather-output.json" # → schemas/weather-output.json
    batch_enabled: false
    tools:
      - "get_weather"
      - "get_forecast"
      - "handoff"          # lets it route to another agent
      - "get_agent_list"
```

**`prompts/02-weather.md`** — the agent's instructions (its "role" and behavior). Plain markdown, version-controlled.

**`schemas/weather-output.json`** — a JSON Schema describing the structured output the agent must return (location, temperature, conditions, forecast).

Key takeaways to land:
- An agent is **mostly declared, not coded.** YAML + markdown + JSON, plus Python only for the tools.
- The `welcome_agent` has `is_default: true` — it's the entry point. `handoff` + `get_agent_list` are how agents pass control to each other.
- Note `set_context_tool` / `get_context_tool` — agents share state across handoffs. We'll cover state on Day 2.

### Lecture 4 — Sessions, state, and the request path (20 min)

Talking points (anchor on `docs/session_vs_thread.md`):

- A **session/thread id** identifies one conversation. It threads through the UI, agent state, and observability (Langfuse).
- Agents carry **state** across turns and across handoffs. Tools read/write it via `ToolRuntime` (Day 2).
- Draw the path on the whiteboard:

```
User message (Chainlit UI)
   → session id attached
   → default/coordinator agent reads prompt + message
   → LLM decides: call a tool? hand off? answer?
   → tool runs (Python) → returns a string result
   → LLM composes final answer (optionally validated against output schema)
   → streamed back to the UI
```

### Lab 2 — Trace one request (75 min)

> Checkpoint at end: each pair can stand up and narrate, against the real files, what happened when they asked for the weather.

Tasks:

1. In the running app, ask the weather agent for a city's weather. Watch the **tool steps** render in Chainlit.
2. In the code, open `agent_configs/concierge/agents.yaml` and find `weather_agent`. List its tools.
3. Open `src/autobots_agents_jarvis/domains/concierge/tools.py` and find the `get_weather` tool. Read its docstring — note the docstring is what the **LLM** reads to decide when to use it.
4. Open `prompts/02-weather.md` and `schemas/weather-output.json`. Connect: prompt = behavior, schema = output shape.
5. **Small change to prove the loop:** edit `prompts/02-weather.md` to make the weather agent always end its answer with a fun fact about the city. Restart, re-ask, observe the behavior change — **without touching Python.** This is the "prompts are source" lesson made concrete.

**Stretch (if a pair is fast):** change the output schema to add a `humidity` field and see how the agent's structured output changes.

### Day-1 retro (10 min)

Ask each pair: "Explain an agent in one sentence" and "Name the three files that define one." Clear up any fuzziness before Day 2 — Day 2 assumes this model is solid.

---

## Checkpoints recap

- ☐ `make all-checks` green; Jarvis runs in Chainlit.
- ☐ Trainee can name the three files that define an agent and what each does.
- ☐ Trainee changed agent behavior by editing only a prompt.
- ☐ Trainee can narrate the request → tool → response path.
