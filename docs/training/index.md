# Onboarding Bootcamp: From Zero to a New Domain

A **5-day, hands-on** training that takes a developer from "what is an agent?" all the way to **shipping a new domain** in a Dynagent application.

This is a **facilitator guide**. Each day has a page with learning objectives, lecture talking points, step-by-step labs, checkpoint criteria, and instructor notes. Trainees do not read this guide directly — the facilitator drives from it.

---

## Who this is for

- **Audience:** 5 new team members with **solid Python** (functions, classes, pytest, git) but **little or no experience** with LLMs, prompts, or multi-agent frameworks.
- **Group size:** 5 trainees, working in **2 pairs + 1 paired with the facilitator** for the capstone. Pairing keeps everyone coding without anyone stuck alone.
- **Facilitators:** 1 lead instructor (2 is comfortable for the capstone days).

## What they walk away with

By Friday each pair has **designed and built a real, working domain** — the team's actual next domain — following the full design-first workflow: LLD → scaffold → agents/prompts/tools → tests → observability → demo.

## The week at a glance

| Day | Theme | Concept focus | Build (lab) | End-of-day checkpoint |
|-----|-------|---------------|-------------|------------------------|
| **[1](day-1-foundations.md)** | Foundations & first run | What an agent is, LLM basics, the workspace, anatomy of a domain | Set up venv + `.env`, run Jarvis, trace one request | Jarvis runs locally; can explain one agent's path |
| **[2](day-2-building-agents.md)** | Building agents | Prompts, output schemas, tools + `ToolRuntime`, handoff & coordinators | Add a new agent (tool + schema) to a Jarvis domain | A new agent answering in the UI |
| **[3](day-3-lld-design.md)** | Design-first: the LLD | The 7 LLD sections and their sub-agents | **Capstone kickoff:** author the LLD for the team domain | Approved LLD for the capstone |
| **[4](day-4-build-domain.md)** | Build the domain | Scaffolding, `server.py` / `tools.py` / `services.py`, config roots | Scaffold + implement the capstone from the LLD | Capstone runs end-to-end (happy path) |
| **[5](day-5-quality-and-demo.md)** | Quality, observability & demo | pytest patterns, Langfuse, batch, polish | Harden capstone + **demo day** | Each pair demos their domain |

The schedule is **flexible** — Day 3 (LLD) and Day 4 (build) are the tightest. It is expected and fine for the capstone build to spill into Day 5 morning; Day 5 has slack built in.

Optional deep-dives (Docker deploy, Jenkins, multi-LLM swap, prompt evaluation, batch processing) live in [Stretch Appendices](appendices.md) — pull them in only if a pair finishes early.

---

## Before the week starts (facilitator prep)

Do this **a few days ahead** so Day 1 is about concepts, not yak-shaving.

### 1. Pick the capstone domain

The whole week points at one **real domain the team needs**. Choose it before Day 1. Good capstone domains:

- Solve a genuine, small team problem (so the work is useful, not throwaway).
- Fit in **2–3 agents** with **1–2 tools each** — big enough to be real, small enough to finish in 1.5 days.
- Have **clear inputs and outputs** that can be described in an LLD.
- Don't require new infrastructure (no new database, no external system the team doesn't already have).

Write a one-paragraph brief using the [Capstone Brief Template](capstone-brief-template.md) and have it ready to hand out on Day 3. Each pair can build the **same** domain (compare solutions) or a **slice** each — facilitator's call.

> If you genuinely have no real domain ready, fall back to a teaching domain such as an **internal IT-helpdesk assistant** (triage agent + knowledge-base agent + ticket agent). It exercises every concept and maps cleanly to Jarvis's Customer Support domain.

### 2. Verify environment access

Every trainee needs, before Day 1:

- Laptop with **Python 3.12+** and **Poetry** installed (`brew install poetry` on macOS).
- **Git** + a **GitHub account** with access to the org repos.
- **LLM API key(s)** for the provider the team uses (e.g. `GOOGLE_API_KEY` and/or `ANTHROPIC_API_KEY`).
- IDE (VS Code or PyCharm) with the workspace cloned.
- (Optional but recommended) **Langfuse** project keys for Day 5 observability.

### 3. Dry-run the setup yourself

Walk through [Day 1](day-1-foundations.md) end to end on a clean machine. The most common Day-1 blockers:

- **Shared venv confusion** — all repos use `ws-autobots/.venv`, not per-repo venvs. Activate from the workspace root.
- **`DYNAGENT_CONFIG_ROOT_DIR`** not set in `.env` (different per domain).
- **Pyright monorepo mode** — needs `venvPath = ".."` and `venv = ".venv"`; some repos have it commented out.
- **Path dependency on shared-lib** — Jarvis uses `develop = true`; make sure `make install-dev` ran from the workspace.

Capture anything that bites you in a shared "gotchas" doc for the cohort.

---

## Reference material this course builds on

The course leans on existing docs — reuse them rather than re-explaining:

- **Core concepts:** [What is a workspace](../core-concepts/what-is-a-workspace.md), [What is an agent](../core-concepts/what-is-an-agent.md), [What is an LLD](../core-concepts/what-is-an-lld.md)
- **The LLD track:** [Structure overview](../building-an-lld/lld-structure-overview.md) and its seven section pages
- **Shared lib:** `autobots-devtools-shared-lib/README.md`, `docs/Golden_Prompt_Guidelines.md`, `docs/session_vs_thread.md`
- **Jarvis (the toy app):** `autobots-agents-jarvis/README.md`, `docs/user-manuals/scaffolding.md`
- **Workspace conventions:** `ws-autobots/CLAUDE.md`

---

## How to facilitate (quick guidance)

- **Ratio:** ~30% lecture, ~70% lab. Keep lectures to 30–45 min blocks; the keyboard is where learning sticks.
- **Checkpoints are gates, not suggestions.** Don't start the next half-day until every pair hits the checkpoint. If a pair is stuck, fix it before moving on — concepts compound.
- **Narrate the "why."** This audience knows Python; they don't know *why* prompts are version-controlled, *why* design comes first, *why* tools return strings. Always connect the mechanic to the reason.
- **Let them struggle briefly, then unblock.** 5–10 minutes of productive struggle is good; 30 minutes of being lost is not.
- **End each day with a 10-min retro:** what clicked, what's still fuzzy. Adjust the next day.
