# Day 3 — Design-First: The LLD

**Goal of the day:** Teach the discipline that gates all real work in this stack — **design before code** — and produce an **approved LLD for the capstone domain**.

This is the pivot day. Days 1–2 used Jarvis as a sandbox. Today the real domain begins, on paper. By end of day each pair has an LLD they will build from on Day 4.

## Learning objectives

By the end of Day 3, trainees can:

1. Explain why this stack starts every significant feature with a Low-Level Design.
2. Name the 7 LLD sections and what each captures.
3. Use the LLD sub-agents to author each section through guided conversation.
4. Produce a complete, internally consistent LLD for the capstone domain.

---

## Morning

### Lecture 1 — Why design first (30 min)

Anchor on [What is an LLD](../core-concepts/what-is-an-lld.md) and the `dyna-vault` "Design First" philosophy.

- **The principle:** all significant work starts with a Low-Level Design document. Code follows design, not the other way around.
- **Why, for agentic apps especially:** agent behavior is emergent and expensive to debug. Deciding *what data flows, which services exist, what the agents must produce, and how you'll test it* up front prevents building three agents that don't fit together.
- **Non-intrusive:** the LLD captures intent without dictating implementation detail — it's the contract, not the code.
- **The LLD is a gate.** On this team, you don't start coding a domain until its LLD is reviewed and approved. Today they earn that gate.

### Lecture 2 — The seven sections (60 min)

Anchor on [LLD Structure Overview](../building-an-lld/lld-structure-overview.md). Walk each section, ideally against the existing Jarvis Concierge or Customer Support domain as a worked example.

| # | Section | Captures | Page |
|---|---------|----------|------|
| 1 | **Background** | Functional requirements + business context — the "what" and "why" | [link](../building-an-lld/lld-background.md) |
| 2 | **Data Models** | Tables, entities, DTOs, messages — the structures everything else consumes | [link](../building-an-lld/lld-data-models.md) |
| 3 | **Services** | Service classes, their inputs/outputs, how they're exposed | [link](../building-an-lld/lld-services.md) |
| 4 | **Flows** | A sequence of LPUs stitched into an outcome | [link](../building-an-lld/lld-flows.md) |
| 5 | **Logical Processing Units (LPUs)** | Atomic, reusable business operations | [link](../building-an-lld/lld-logical-processing-units.md) |
| 6 | **Test Data** | Reusable payloads for testing | [link](../building-an-lld/lld-test-data.md) |
| 7 | **Test Scenarios** | Positive + negative cases in Given/When/Then | [link](../building-an-lld/lld-test-scenarios.md) |

How the sections connect (draw this):

- **Background** informs everything.
- **Data Models** are consumed/produced by **Services** and **LPUs**.
- **LPUs** are the atomic operations; **Flows** orchestrate them; **Services** expose flows.
- **Test Data** feeds **Test Scenarios**, which validate the **Services** end-to-end.

Key teaching point: **this maps directly to the code they'll write Day 4.** Services → `services.py`. Tools wrap services. Test scenarios → pytest. Map each LLD section to the file it becomes so the LLD doesn't feel like bureaucracy.

### Lecture 3 — The LLD sub-agents (20 min)

Anchor on the [LLD sub-agents overview](../reference/lld-sub-agents-overview.md).

- Each LLD section has a **dedicated sub-agent** that interviews you to fill it in — you don't stare at a blank template.
- The workflow is a **conversation**: the sub-agent asks for the details its section needs; you answer; it drafts the section.
- Demonstrate live: run the Background sub-agent against the capstone brief and let the cohort watch one section get authored.

---

## Afternoon — Capstone kickoff

### Hand out the capstone brief (15 min)

Distribute the [Capstone Brief](capstone-brief-template.md) for the real team domain (prepared before the week — see [index](index.md#1-pick-the-capstone-domain)). Walk through it together:

- What problem does this domain solve?
- Who talks to it and what do they ask for?
- What does "done" look like?

Confirm scope is realistic: **2–3 agents, 1–2 tools each.** Trim now if it's too big — this is the last cheap moment to cut scope.

### Lab — Author the capstone LLD (150 min)

> Checkpoint at end: each pair has a complete, reviewed LLD covering all 7 sections, with the facilitator's sign-off. **This is the gate to Day 4.**

Each pair works through the sections **in order**, using the sub-agents:

1. **Background** — write the functional requirements and business context from the brief. Be concrete about inputs and outcomes.
2. **Data Models** — define the entities/DTOs the domain reads and produces. (For a small domain this may be a couple of DTOs.)
3. **Services** — list the service operations and their inputs/outputs. These become functions in `services.py`.
4. **LPUs** — break the business logic into atomic steps. Keep them small and reusable.
5. **Flows** — sequence the LPUs into the domain's outcomes.
6. **Test Data** — define a few realistic payloads.
7. **Test Scenarios** — write Given/When/Then cases: at least one happy path and one negative path per service.

Then **map the LLD to the agent design** — the bridge to Day 4. For each pair, decide:

- **Which agents** the domain needs (e.g. a coordinator + 1–2 specialists).
- **Which tools** each agent gets, and **which service** each tool wraps.
- **Which agents need output schemas.**
- **The handoff topology:** which agent is `is_default: true`, who routes to whom.

Capture this as a short "agent map" appended to the LLD. Day 4 is mostly mechanical if this map is solid.

### Design review (30 min)

Each pair presents their LLD + agent map (5 min each). The facilitator (and the other pairs) probe:

- Do the services cover everything the agents need? Any tool with no service behind it?
- Are the data models actually used by the services?
- Is there a test scenario for each service, including a negative case?
- Is the scope still buildable in ~1.5 days?

**Only LLDs that pass review proceed to Day 4.** Tighten any that don't.

### Day-3 retro (10 min)

Ask: "What would have gone wrong on Day 4 if you'd skipped the LLD?" Make the value of design-first explicit.

---

## Checkpoints recap

- ☐ All 7 LLD sections complete and internally consistent.
- ☐ Every service has at least one positive and one negative test scenario.
- ☐ Agent map written: agents, tools→services, schemas, handoff topology.
- ☐ Facilitator has signed off — the gate to Day 4 is cleared.
