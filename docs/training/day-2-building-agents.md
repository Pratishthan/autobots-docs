# Day 2 — Building Agents

**Goal of the day:** Each pair adds a **brand-new agent** — with its own prompt, an output schema, and a working tool backed by `ToolRuntime` — to an existing Jarvis domain, and wires it into the handoff mesh.

This is the day they go from *reading* agents to *building* them. Everything here is a rehearsal for the capstone.

## Learning objectives

By the end of Day 2, trainees can:

1. Write a well-structured agent prompt using the Golden Prompt conventions (XML-tagged sections).
2. Define an output schema and understand when an agent needs one.
3. Write a tool with the `@tool` + `ToolRuntime` pattern, and explain why tools return strings.
4. Register a tool and add an agent to `agents.yaml`.
5. Wire handoff so a coordinator can route to the new agent.

---

## Morning

### Lecture 1 — Prompts that work (45 min)

Anchor on `autobots-devtools-shared-lib/docs/Golden_Prompt_Guidelines.md`. Land these points:

- **A prompt is the agent's job description.** Vague prompts → unreliable agents. The Golden Prompt guidelines exist because prompt quality *is* product quality here.
- **Structure with XML tags.** The house style wraps sections in named tags so the model can tell them apart:

  ```xml
  <role>      Who the agent is, its place in the pipeline, key constraint
  <inputs>    Required parameters (omit for batch agents)
  <context>   Background, reference files, shared config
  <tools>     Which tools and how to use them
  <examples>  3–5 diverse input/output examples incl. edge cases
  <outputs>   Output format, schema, where it goes
  <workflow>  Step-by-step procedure (<step> sub-tags)
  <validation> A self-check the agent runs before answering
  ```

- **High-value habits:** give the agent a pipeline-aware role; declare inputs explicitly; provide 3–5 diverse examples (including edge cases); add a self-verification step before final output; phrase rules as positive directives and explain *why*.
- **Why version-controlled markdown:** prompts evolve, get reviewed in PRs, and can be evaluated across versions — just like code.

> Note: the existing Jarvis prompts (e.g. `02-weather.md`) are intentionally simple. Show a richer, XML-tagged prompt from MER or the guidelines so trainees see the target standard.

### Lecture 2 — Output schemas (20 min)

- An **output schema** is a JSON Schema the agent's structured output must satisfy (see `schemas/weather-output.json`).
- **When you need one:** the output feeds another system, another agent, or a batch process — anything that needs a *predictable shape*. Conversational chit-chat doesn't need one.
- The agent uses helper tools like `output_format_converter_tool` to emit conforming JSON.
- Schemas use standard JSON Schema (`required`, `properties`, `enum`, nested objects, arrays).

### Lab 1 — Design your agent on paper (45 min)

Before any code, each pair specs a new agent for the **Concierge** domain. Pick something small, e.g. a **"currency converter"** agent or a **"unit converter"** agent. On paper / in a doc, write:

- The agent's **role** (one paragraph, pipeline-aware).
- Its **inputs** (what the user must provide).
- The **tool(s)** it needs and each tool's signature + return.
- Its **output schema** (fields + types).
- 3 **examples** including one edge case.

> Checkpoint: facilitator reviews each pair's spec before they touch code. Catch over-scoping here.

---

## Afternoon

### Lecture 3 — Tools and `ToolRuntime` (30 min)

Open `src/autobots_agents_jarvis/domains/sales/tools.py` and walk a real tool:

```python
from autobots_devtools_shared_lib.dynagent import Dynagent
from langchain.tools import ToolRuntime, tool

@tool
def qualify_lead(
    runtime: ToolRuntime[None, Dynagent],
    company: str,
    budget: str,
    timeline: str,
    team_size: int = 1,
) -> str:
    """Qualify a new sales lead.

    Args:
        company: Company name
        budget: Budget range or amount (e.g., "$50K")
        ...
    Returns:
        A formatted message with lead qualification details
    """
    session_id = runtime.state.get("session_id", "default")
    lead = service_qualify_lead(company, budget, timeline, team_size)
    return f"✅ Lead Qualified... {lead['lead_id']}"
```

Land these points:

- **The docstring is a prompt.** The LLM reads the description and `Args` to decide *whether and how* to call the tool. Write it for the model, not just for humans.
- **`runtime: ToolRuntime[None, Dynagent]`** gives access to shared **state** (e.g. `session_id`) that persists across turns and handoffs.
- **Tools return strings.** The result goes back into the model's context as text, so return something the model can read and reason about.
- **Thin tool, real logic in services.** Notice the tool wraps `service_qualify_lead` from `services.py`. Tools are adapters; business logic lives in services. This separation matters for testing and reuse.
- **Tools must be registered** once at startup via `register_usecase_tools(tools)` before `create_base_agent()`.

### Lab 2 — Build and wire your agent (120 min)

> Checkpoint at end: the new agent answers correctly in the Chainlit UI, reachable via handoff from the welcome agent.

Steps:

1. **Write the tool** in the domain's `tools.py`:
   - `@tool` decorated, `runtime: ToolRuntime[None, Dynagent]` first arg.
   - Clear docstring with `Args` and `Returns`.
   - Put the real logic in `services.py` and call it from the tool.
2. **Register the tool** (follow the existing registration call in the domain — `register_usecase_tools(...)`).
3. **Write the prompt** in `agent_configs/concierge/prompts/NN-your-agent.md` using the XML-tagged structure.
4. **Write the schema** (if your agent has structured output) in `agent_configs/concierge/schemas/your-agent.json`.
5. **Add the agent to `agents.yaml`:**
   ```yaml
   your_agent:
     prompt: "NN-your-agent"
     output_schema: "your-agent.json"   # omit if not structured
     batch_enabled: false
     tools:
       - "your_tool"
       - "handoff"
       - "get_agent_list"
   ```
6. **Make it reachable.** The `welcome_agent` already has `handoff` + `get_agent_list`, so it can route to any registered agent. Restart and confirm: ask the welcome agent something that should route to your agent, and watch it hand off.
7. **Run quality gates:** `make format`, `make lint`, `make type-check`, `make test-fast`.

**Common blockers:**

| Symptom | Fix |
|---------|-----|
| Agent not found / no handoff target | Tool not registered, or agent not in `agents.yaml`; restart the app |
| Tool never called | Docstring too vague — the model can't tell when to use it; sharpen the description |
| Type-check failure on tool | Missing/incorrect `ToolRuntime[None, Dynagent]` annotation |
| Schema validation error | Output doesn't match required fields; use `output_format_converter_tool` and align the prompt's `<outputs>` |

### Lab 3 — Make it handoff-aware (30 min, if time)

Add a second tiny agent and have your first agent **hand off** to it (e.g. a converter that hands off to a "rates explainer"). This rehearses the **coordinator/mesh** pattern they'll use in the capstone: a coordinator agent fronts a domain and routes to specialists.

### Day-2 retro (10 min)

Each pair demos their agent in 2 minutes. Ask: "Where does business logic go, and why not in the tool?" and "What does the LLM read to decide to call your tool?"

---

## Checkpoints recap

- ☐ New agent answers in the UI, reachable by handoff.
- ☐ Tool uses `@tool` + `ToolRuntime`, logic lives in `services.py`.
- ☐ Prompt follows the XML-tagged Golden Prompt structure.
- ☐ `make type-check` and `make test-fast` pass.
