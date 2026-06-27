# Day 5 — Quality, Observability & Demo

**Goal of the day:** Harden the capstone into something the team would actually trust — tests from the LLD scenarios, tracing to see inside agent runs, and a polished demo — then **each pair presents**.

Day 5 is intentionally lighter on new build so it can absorb spillover from Day 4. The morning finishes and hardens; the afternoon is observability + demo.

## Learning objectives

By the end of Day 5, trainees can:

1. Turn LLD test scenarios into pytest tests (unit + integration).
2. Use Langfuse traces to inspect and debug an agent run.
3. Explain when and how batch processing applies.
4. Demo a domain and explain its design decisions.

---

## Morning

### Buffer / finish-the-build (up to 90 min)

Pairs that spilled over from Day 4 finish the happy path and reach the Day-4 checkpoint. Pairs already done start on testing. Facilitator floats and unblocks.

### Lecture 1 — Testing agentic code (30 min)

Anchor on the workspace testing setup (`pytest`, `asyncio_mode = "auto"`, markers `unit`/`integration`/`slow`/`sanity`).

- **Test the services like normal Python.** Services have no LLM — they're deterministic and should have thorough unit tests. This is where most of your test value is.
- **Turn LLD Test Scenarios into tests.** Each Given/When/Then from the LLD becomes a test: positive and negative cases. The LLD Test Data section gives you the payloads.
- **Integration tests** exercise a service-through-tool path. Mark slower ones `@pytest.mark.integration` / `slow`.
- **What not to over-test:** don't assert on exact LLM wording — assert on tool calls, structured output shape (schema), and service results. LLM output is nondeterministic; test the deterministic seams.
- Commands: `make test` (with coverage), `make test-fast` (quick), `make test-one TEST=tests/unit/test_x.py::test_y`.

### Lab 1 — Write the tests from your LLD (90 min)

> Checkpoint: every service has unit tests for its happy + negative scenarios; `make test` passes; coverage is reported.

1. For each LLD **Test Scenario**, write a pytest test using the LLD **Test Data** payloads.
2. Cover at least one **negative** path per service (bad input, missing field, etc.).
3. Add one **integration** test that drives a tool → service path.
4. Run `make test` and review `htmlcov/` coverage. Fill obvious gaps in service coverage.

---

## Afternoon

### Lecture 2 — Observability with Langfuse (30 min)

Anchor on the shared-lib observability features and `docs/session_vs_thread.md`.

- **Why:** agent runs are multi-step and partly nondeterministic. Logs alone aren't enough — you need to *see* the prompt, the tool calls, the inputs/outputs, and the final answer for a given session.
- **What Langfuse gives you:** traces keyed by **session id**, with each LLM call and tool step nested, plus `TraceMetadata` (session, app, tags).
- **Session vs thread:** the Chainlit `thread_id` becomes the session id that correlates UI ↔ agent state ↔ Langfuse trace. One conversation = one trace.
- **How to read a trace:** find the session → expand the run → look at which agent handled it, which tools fired, what the tool returned, and where it went wrong. This is the fastest way to debug "the agent did something weird."

### Lab 2 — Trace your domain (45 min)

> Checkpoint: each pair can open a Langfuse trace of their domain handling a request and narrate what each step did.

1. Ensure Langfuse keys are set (facilitator provides project keys).
2. Drive a few requests through the domain — one happy, one that previously misbehaved.
3. Open the traces. Identify: which agent answered, the tool calls, the structured output, any handoffs.
4. **Use a trace to fix one real issue** (e.g. a tool that fires too eagerly, or a prompt the model misread). Tracing-driven debugging is the takeaway.

### Lecture 3 — Batch processing (15 min, conceptual)

- Some agents run **unsupervised over many inputs**, not just in chat. Agents marked `batch_enabled: true` can be run in parallel via `batch_invoker` → `BatchResult`.
- **When it applies:** scoring/classifying/extracting over a list (e.g. qualifying many leads, processing a queue) rather than one conversational turn.
- Most capstones won't need it today — flag it as a tool in the box, and point curious pairs at the [Stretch Appendices](appendices.md).

### Demo day (60 min)

Each pair gets ~10 minutes:

1. **Live demo** of the domain handling a real request.
2. **Walk the design:** the LLD agent map — agents, tools→services, handoff topology, schemas.
3. **Show a trace** of a request in Langfuse.
4. **One thing that was hard** and how they debugged it.

Audience (other pairs + facilitator) asks one design question each. This cements the vocabulary and surfaces patterns across domains.

### Course wrap-up (20 min)

- Recap the arc: agent anatomy → building agents → **design-first LLD** → building a domain → quality & observability.
- **Next steps for the team:** point at `CLAUDE.md`, the LLD sub-agents, the Golden Prompt guidelines, and the [Stretch Appendices](appendices.md) (Docker deploy, Jenkins, multi-LLM, prompt eval) for the topics you deliberately deferred.
- Collect feedback to improve the next cohort's run.

---

## Checkpoints recap

- ☐ Services have unit tests for happy + negative scenarios; `make test` green.
- ☐ At least one integration test (tool → service).
- ☐ Pair can open and narrate a Langfuse trace, and used one to fix an issue.
- ☐ Pair delivered a demo covering live behavior, design, and a trace.
