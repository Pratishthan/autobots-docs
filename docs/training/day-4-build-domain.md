# Day 4 — Build the Domain

**Goal of the day:** Turn the approved LLD into a **working domain** — scaffolded, with agents, prompts, tools, and services wired up — that runs end-to-end on the happy path.

Today is mostly mechanical *because* Day 3 did the thinking. If a pair is improvising design today, stop and fix the LLD first.

## Learning objectives

By the end of Day 4, trainees can:

1. Scaffold a new domain (or a new domain inside an app) and configure its `DYNAGENT_CONFIG_ROOT_DIR`.
2. Implement services from the LLD's Services + LPUs sections.
3. Wrap services in tools and wire agents in `agents.yaml`.
4. Run their domain end-to-end through the Chainlit UI.

---

## Morning

### Lecture 1 — Two ways to add a domain (25 min)

Make the choice explicit up front, because it changes the first 30 minutes of the lab.

**Option A — Add a domain to an existing app (recommended for the capstone).**
Follow the Jarvis multi-domain layout. Each domain lives at:

```
agent_configs/<domain>/        # agents.yaml, prompts/, schemas/
src/<package>/domains/<domain>/ # server.py, tools.py, services.py, settings.py
```

This mirrors what they did Day 2 (adding an agent), scaled up to a whole domain. No new repo, no scaffold script — copy the structure of an existing domain (e.g. `concierge`) and rename.

**Option B — Scaffold a standalone app from the Jarvis template.**
Use when the capstone should be its **own repo**. Anchor on `autobots-agents-jarvis/docs/user-manuals/scaffolding.md`:

```bash
# In a fresh clone of the Jarvis template, from project root
python3 sbin/scaffold.py <project-name> --primary-domain <domain> --dry-run   # preview
python3 sbin/scaffold.py <project-name> --primary-domain <domain>             # apply
```

The script renames the template to your project, removes the demo domains, sets the primary domain, and switches the repo to standalone (local `.venv`). Then `cp .env.example .env`, add keys, `make install-dev`, `make all-checks`, `make chainlit-dev`.

> Facilitator decision: for a one-week course, **Option A** keeps everyone in the familiar Jarvis repo and avoids repo-creation overhead. Use Option B only if the team genuinely needs a separate deliverable repo.

### Lecture 2 — The domain code map (20 min)

Open `src/autobots_agents_jarvis/domains/concierge/` and connect each file to its LLD section:

| File | Holds | From LLD section |
|------|-------|------------------|
| `services.py` | Business logic — the real functions | Services + LPUs |
| `tools.py` | `@tool` wrappers that call services and return strings | (tools wrap services) |
| `server.py` | Domain server / entry wiring | — |
| `settings.py` | Domain settings, including config root | Background |
| `agent_configs/<domain>/agents.yaml` | Agent definitions, tools, schemas | Agent map |
| `agent_configs/<domain>/prompts/*.md` | Agent prompts | Agent map + Background |
| `agent_configs/<domain>/schemas/*.json` | Output schemas | Data Models |

Land the rule from Day 2: **logic in `services.py`, thin wrappers in `tools.py`.** Services are independently testable; tools are adapters for the LLM.

Remind them of the config gotcha: **`DYNAGENT_CONFIG_ROOT_DIR`** must point at the new domain's `agent_configs/<domain>` before `create_base_agent()` runs — set per domain in `.env`/settings.

### Lab — Scaffold the domain skeleton (90 min)

> Checkpoint at end: the app starts with the new domain's **default agent** responding (even if it only says hello). Wiring before logic.

Steps (Option A):

1. Create `agent_configs/<your-domain>/` with `agents.yaml`, `prompts/`, `schemas/` — copy the concierge structure as a starting point.
2. Create `src/<package>/domains/<your-domain>/` with `services.py`, `tools.py`, `server.py`, `settings.py` — again, copy + rename from concierge.
3. Define the **coordinator/default agent** in `agents.yaml` (`is_default: true`, with `handoff` + `get_agent_list`). Give it a simple prompt for now.
4. Set `DYNAGENT_CONFIG_ROOT_DIR` for the new domain.
5. Start the app and confirm the default agent responds.

Get the skeleton **talking** before adding real behavior — it isolates wiring problems from logic problems.

---

## Afternoon

### Lab — Implement the domain from the LLD (180 min)

> Checkpoint at end: the domain runs the **happy path** end-to-end — a user request flows through the coordinator to a specialist, a tool calls a service, and a correct (schema-conforming, if applicable) answer comes back.

Work in this order — it follows the dependency arrows from the LLD:

1. **Services first.** Implement each function from the LLD's Services/LPUs sections in `services.py`. Pure Python, no LLM — these should be unit-testable on their own. Write a quick test for each as you go (Day 5 expands testing).
2. **Tools next.** Wrap each service in a `@tool` in `tools.py`:
   - `runtime: ToolRuntime[None, Dynagent]` first arg.
   - Docstring written **for the model** (clear `Args`/`Returns`) — this is what makes the agent call it correctly.
   - Return a readable string.
   - Register the tools (`register_usecase_tools(...)`).
3. **Prompts.** Author each agent's prompt using the XML-tagged Golden Prompt structure (role, inputs, tools, examples, outputs, workflow, validation). Reuse the patterns from Day 2.
4. **Schemas.** Add output schemas for agents whose output is structured (from the LLD Data Models).
5. **Agents + handoff.** Fill in `agents.yaml`: each agent with its prompt, schema, tools, and the handoff topology from your agent map.
6. **Run and iterate.** Restart, drive the happy path through the UI, watch the tool steps, fix prompts/tools until it behaves.

**Debugging guidance (point them at [systematic-debugging] habits):**

| Symptom | Likely cause | Where to look |
|---------|--------------|---------------|
| Agent won't call the right tool | Vague tool docstring or prompt | `tools.py` docstring, prompt `<tools>` section |
| Handoff goes nowhere | Target agent not registered / missing from `agents.yaml` | `agents.yaml`, tool registration |
| Wrong/garbled structured output | Schema vs prompt `<outputs>` mismatch | schema JSON + prompt |
| Service returns wrong result | Logic bug — **not** an agent problem | unit-test the service directly |
| `DYNAGENT_CONFIG_ROOT_DIR` errors | Config root not pointing at the new domain | `.env` / `settings.py` |

Keep reinforcing the split: **if the service is wrong, fix it with a unit test, not by poking the agent.** This is the single biggest time-saver.

### Quality gate before you leave (30 min)

Each pair runs and gets green:

```bash
make format
make lint
make type-check
make test-fast
```

> If the build spills here, that's fine — Day 5 morning has slack. But the **happy path must run** before going home.

### Day-4 retro (10 min)

Ask: "Which LLD section saved you the most time today?" and "What's still flaky?" Flaky behavior becomes Day 5's hardening backlog.

---

## Checkpoints recap

- ☐ New domain scaffolded; default agent responds.
- ☐ Services implemented and individually runnable/testable.
- ☐ Tools wrap services; agents wired with correct handoff topology.
- ☐ Happy path runs end-to-end in the UI.
- ☐ `make type-check` and `make test-fast` green.
