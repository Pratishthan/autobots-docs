# Stretch Appendices

Optional deep-dives, **deliberately kept out of the core 5 days** so a new-to-agents audience isn't overloaded. Pull these in only when a pair finishes the capstone early, or run them as follow-up sessions after the bootcamp.

Each appendix is a pointer + a small exercise, not a full lesson — the goal is to show the door, not walk through it.

---

## A. Multi-LLM: swapping models

**Concept:** Dynagent has a single integration layer over multiple LLM providers (Gemini, Claude, others). You can swap the model "like swapping batteries" without rewriting agents.

**Why it matters:** cost/quality tradeoffs, provider outages, and matching model strength to task (a cheap model for classification, a stronger one for reasoning).

**Exercise:** point the capstone domain at a different provider via config/`.env` and re-run the demo. Note where behavior changes and where it doesn't. Discuss: which agents are model-sensitive (reasoning-heavy) vs. robust (simple tool routing)?

---

## B. Prompt evaluation

**Concept:** prompts are versioned source. The lib has tooling to tweak and **evaluate prompt quality across versions**.

**Why it matters:** "I improved the prompt" should be measurable, not vibes. Eval lets you compare versions on the same inputs.

**Exercise:** take one capstone agent, write a second version of its prompt (e.g. add examples / a validation step per the Golden Prompt guidelines), and evaluate both against a small fixed input set. Pick the winner with evidence.

---

## C. Batch processing

**Concept:** agents marked `batch_enabled: true` can run **in parallel over many inputs** via `batch_invoker` → `BatchResult`, outside of chat.

**Why it matters:** unsupervised workflows — scoring, classifying, or extracting over a list — instead of one conversational turn at a time.

**Exercise:** mark a capstone agent batch-enabled, feed it a list of inputs through `batch_invoker`, and inspect the `BatchResult`. Compare runtime vs. looping one at a time.

---

## D. Containerization & deployment

**Concept:** the apps ship as Docker images with bundled dependencies. In the monorepo, use **`Dockerfile.monorepo`** (not `Dockerfile`) so the local path dependency on shared-lib resolves.

**Why it matters:** consistent, reproducible deployment beyond a laptop.

**Exercise:** build the capstone (or Jarvis) image with `Dockerfile.monorepo` and run it via the relevant `docker-compose.monorepo.yml`. Confirm the domain answers through the containerized UI.

---

## E. Jenkins integration

**Concept:** the "batteries-included" helpers let agents **trigger and monitor Jenkins pipelines**.

**Why it matters:** agents that *do* things in CI/CD, not just talk — a step toward SDLC automation (cf. the MER app).

**Exercise:** read how MER wires Jenkins, then sketch (on paper) how the capstone domain could trigger a pipeline as a tool: what service, what tool signature, what the agent would say.

---

## F. File server & workspace management

**Concept:** helpers to **serve/manage files** within a session and manage **working directories / session artifacts**. Note the Concierge weather agent already lists `read_file_tool` / `list_files_tool`.

**Why it matters:** agents that work over documents and produce artifacts need a place to put them.

**Exercise:** give a capstone agent `read_file_tool` / `list_files_tool`, drop a file into the session workspace, and have the agent read and summarize it.

---

## Where to go next

- `ws-autobots/CLAUDE.md` — workspace conventions and gotchas.
- `autobots-devtools-shared-lib/docs/Golden_Prompt_Guidelines.md` — the prompt standard.
- `autobots-devtools-shared-lib/docs/features/` — feature deep-dives.
- The **MER** and **Pay** apps — larger real-world domains to read once the basics are solid.
