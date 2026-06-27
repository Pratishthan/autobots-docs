# Capstone Brief Template

The capstone is the **spine of the week** — a real domain the team needs, designed and built by the trainees. The facilitator fills this in **before Day 1** and hands it out on **Day 3**.

Keep it to **one page**. The trainees expand it into a full LLD on Day 3; this brief just frames the problem and bounds the scope.

---

## Scope rules (read before filling in)

A good capstone domain:

- Solves a **genuine, small** team problem (useful, not throwaway).
- Fits in **2–3 agents**, each with **1–2 tools**.
- Has **clear inputs and outputs** describable in an LLD.
- Needs **no new infrastructure** (no new DB, no new external system).
- Is buildable end-to-end (happy path) in **~1.5 days** by a pair.

If the idea doesn't fit those bounds, **cut it down** until it does. Over-scoped capstones are the #1 way the week fails.

---

## Brief

### Domain name

`<short-name>` (lowercase, hyphenated — becomes the domain/config name, e.g. `helpdesk`)

### The problem (2–3 sentences)

> What does this domain do, and why does the team need it?

### Who uses it

> Who talks to this domain, and in what situation? (e.g. "an internal engineer asking the helpdesk to triage an access issue")

### Example interactions (3–5)

> Concrete things a user would say, and what a good response looks like. Include at least one **edge case** or **negative** path.

1. User: "…" → Expected: …
2. User: "…" → Expected: …
3. User (edge case): "…" → Expected: …

### Inputs & outputs

- **Inputs the domain needs:** …
- **Outputs it produces:** … (note which are **structured** — those need output schemas)

### Data it touches

> Entities/records the domain reads or writes. Keep it to what already exists — no new infrastructure.

### What "done" looks like (definition of done)

- [ ] Happy path runs end-to-end in the Chainlit UI.
- [ ] Each service has unit tests (happy + negative) from the LLD scenarios.
- [ ] A Langfuse trace shows the request flowing correctly.
- [ ] The pair can demo it and explain the design.

### Proposed agent map (facilitator's starting hypothesis — trainees refine on Day 3)

| Agent | Role | Default? | Tools | Wraps service(s) | Output schema? |
|-------|------|----------|-------|------------------|----------------|
| `<coordinator>` | Routes requests, greets | yes (`is_default: true`) | `handoff`, `get_agent_list` | — | no |
| `<specialist-1>` | … | no | `<tool>`, `handoff` | `<service>` | yes/no |
| `<specialist-2>` | … | no | `<tool>`, `handoff` | `<service>` | yes/no |

### Out of scope (say it explicitly)

> List what this capstone will **not** do, so pairs don't gold-plate. (e.g. "no auth, no persistence beyond session, no batch mode.")

---

## Fallback teaching domain

If no real domain is ready, use an **Internal IT-Helpdesk Assistant**:

- **`helpdesk_coordinator`** (default) — greets, understands the request, routes.
- **`triage_agent`** — classifies the issue (access / hardware / software / other), sets priority. Tool: `classify_issue` → a `triage` service. Structured output: `{category, priority, summary}`.
- **`knowledge_agent`** — answers common how-to questions from a small canned knowledge base. Tool: `search_kb` → a `knowledge` service.

It maps cleanly onto Jarvis's Customer Support domain (coordinator + ticket-handler + knowledge-base), so there's a reference to compare against — without copying it.
