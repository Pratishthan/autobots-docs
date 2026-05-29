# Business Process Documentation — Design

**Date:** 2026-05-29
**Status:** Approved (pending implementation plan)

## 1. Purpose

Provide a way to document **business processes** for our consumers, spanning the full
range from technical processes (e.g., SDLC feature delivery) to business processes
(e.g., loan origination). Each process is a sequence of steps; where a step is backed by
a system action, it links to the corresponding API published in our **knowledge graph
(KG)**.

The docs must serve a broad audience — developers/integrators, business/domain analysts,
implementation/solution consultants, and end customers/partners — so the same page must
read as a business narrative while exposing the technical API hooks.

### Three driving requirements

1. **Clickability** — steps link to KG APIs and to related processes.
2. **Agentic maintenance** — processes are authored/updated by agents reliably, with
   clean, parallel-safe diffs.
3. **Chat-ability (future)** — the content can feed a chat/RAG layer.

All three point away from hand-written prose and toward a **structured source of truth**.

## 2. Architecture (Hybrid B → C)

Build a structured-source-to-generated-docs pipeline now, with a schema designed so the
same model can later be projected into the knowledge graph (graph-native, "→C") without
re-authoring.

```
processes/<domain>/<id>.yaml          ← source of truth (humans/agents edit this)
        │
        ▼
   scripts/gen_processes.py           ← generator + Pydantic schema validation
        │
        ├─► docs/processes/<domain>/<id>.md   ← generated, COMMITTED (site + Obsidian + review)
        ├─► docs/processes/index.md           ← generated catalog (domain → category)
        └─► build/processes/… (gitignored)    ← enriched JSON + manifest (future chat/KG feed)
        │
        ▼
   MkDocs Material site (clickable Mermaid flow + per-step API links)
```

### Source of truth and derived artifacts

- **Committed:** the YAML source **and** the generated Markdown pages. The Markdown is a
  genuinely different artifact (prose + diagrams for humans), not a re-encoding of the
  source, so it is not "duplicated meta."
- **Not committed:** the enriched per-process JSON + manifest. These are a re-encoding of
  the YAML with derived fields added; committing them would duplicate the source and force
  a drift check. They are emitted to a gitignored `build/` directory and consumed by the
  future chat/KG phase.
- **Single authored format: YAML.** Chosen over JSON for authoring because it supports
  comments, readable multi-line prose (block scalars) for step descriptions, and quieter
  diffs. JSON is an interchange format, not an authoring one. Authors still get schema
  assistance: the generator validates YAML against the Pydantic-derived JSON Schema.

### URL derivation

Each API reference stores **only the canonical KG ID**. The clickable link URL is derived
from a configurable template in `processes.config.yaml`
(e.g., `api_url_template: "https://<kg-host>/api/{id}"`), so the host changes in one place.

## 3. Process schema (core data model)

```yaml
id: loan-origination               # stable; used for filename, anchors, future KG node id
title: Loan Origination
domain: business                   # business | technical  (top-level catalog grouping)
category: Lending                  # free-text sub-grouping within a domain
summary: End-to-end flow from application intake to disbursal.
actors:
  - id: applicant
    name: Applicant
  - id: underwriter
    name: Underwriter
steps:
  - id: submit-application
    name: Submit Application
    kind: system                   # system | manual | decision
    actor: applicant               # references an actor id (optional)
    trigger: Applicant completes the online form
    outcome: Application record created
    description: The applicant submits personal and financial details.
    inputs: [Applicant personal details, Income documents]   # optional
    outputs: [Application ID]                                 # optional
    api_refs:                                                 # only on system steps
      - id: api.loans.applications.create   # KG canonical ID; URL derived from template
        label: Create Application           # optional display override
        purpose: Persists the application   # optional
    process_ref: null              # optional: id of another process this step triggers
    next: [credit-gate]            # unconditional edge (normalized to {to, when:null})

  - id: credit-gate
    name: Credit Decision
    kind: decision                 # gateway node; renders as a diamond
    description: Routes the application based on the automated credit score.
    branches:
      - label: "Score >= 700"
        to: auto-approve
      - label: "Score < 700"
        to: verify-documents

  - id: verify-documents
    name: Verify Physical Documents
    kind: manual                   # out-of-system; no api_refs; stays in the narrative
    actor: underwriter
    trigger: Application flagged for manual review
    outcome: Documents verified or rejected
    description: Underwriter inspects the submitted documents.
    next:
      - to: kyc-check
        when: null

  - id: kyc-check
    name: Run KYC Verification
    kind: system
    actor: underwriter
    description: Hands off to the standalone KYC verification process.
    process_ref: kyc-verification  # cross-process link → renders "Triggers: KYC Verification"
    next: []
```

### Field rules

- **`kind`** is one of `system`, `manual`, `decision`.
  - `system` — backed by one or more APIs; may carry `api_refs`.
  - `manual` — out-of-system human/offline action; **no** `api_refs`. Keeps the business
    narrative complete where there is no API.
  - `decision` — a branch gateway; carries `branches` instead of (or in addition to) `next`.
- **`api_refs`** is optional and only meaningful on `system` steps. Each ref is
  `{ id (required), label?, purpose? }`. The link URL is derived from `id`.
- **`process_ref`** (optional) is the `id` of another process this step triggers/hands off
  to. Renders as a clickable link; projects to a KG `triggers` edge later.
- **`inputs` / `outputs`** (optional free-text lists) aid developers and future chat
  retrieval; omitted where not relevant. Detailed data shapes live in the API docs in the
  KG, not duplicated here.
- **Branching:**
  - Edge conditions: each `next` entry may be a bare id (unconditional) or `{ to, when }`.
  - Decision gateways: `kind: decision` with `branches: [{ label, to }]`.
  - Both are supported; a bare `next: [x]` remains an unconditional edge
    (normalized internally to `{ to: "x", when: null }`).
- Every process, step, actor, and api_ref carries a **stable `id`** so the model projects
  cleanly to KG nodes/edges.

## 4. Page rendering (per process)

Each generated Markdown page contains:

1. **Header** — title, summary, and metadata (domain, category, actors).
2. **Flow diagram** — a clickable Mermaid graph:
   - `system` steps as rectangles, `decision` steps as diamonds, `manual` steps styled
     distinctly (e.g., dashed).
   - Edges labeled with their `when` / branch `label`.
   - Clicking a node jumps to that step's detail section.
3. **Step details** — one section per step: actor, trigger, outcome, description, and
   optional inputs/outputs.
   - `system` steps render an **API table**: label → derived link, purpose.
   - `manual` steps show a "Manual / out-of-system" badge and no API table.
   - A `process_ref` renders a "▶ Triggers: [Other Process]" clickable link.
4. **Catalog** (`docs/processes/index.md`) — all processes grouped by domain → category,
   each with its summary and a hint of how many APIs it links.

## 5. File layout, naming & config

```
processes/                          # SOURCE (committed)
  business/loan-origination.yaml
  technical/sdlc-feature-delivery.yaml
processes/process.schema.json       # generated from the Pydantic model (editor/agent assist)
processes.config.yaml               # api_url_template, KG host, output paths

scripts/gen_processes.py            # generator + validator

docs/processes/                     # GENERATED MARKDOWN (committed)
  index.md
  business/loan-origination.md
  technical/sdlc-feature-delivery.md

build/processes/                    # GENERATED JSON (gitignored, future chat/KG feed)
  index.json                        # manifest: schema_version, generated_at,
                                    #   api_url_template, processes[], trigger_graph
  business/loan-origination.json    # enriched per-process record (derived URLs, resolved
                                    #   actors, normalized edges, rollups)
```

- **Naming:** source and generated files use **kebab-case** to match the existing site and
  the `roamlinks` plugin; human Title Case lives in each page's `title`/H1. This is a
  deliberate exception to the vault's Title-Case-pages convention, justified because these
  pages are machine-generated and referenced by ID, not hand-linked.
- **Navigation:** a top-level **Business Processes** entry is added to the site
  (`mkdocs.yml` nav and/or `docs/index.md`).

## 6. Generator implementation

- **Language:** Python (fits the workspace; Python 3.12, ruff conventions).
- **Validation:** Pydantic models define the schema, giving precise validation errors
  (valuable for agentic editing) and auto-emitting `process.schema.json`.
- **Templating:** Jinja2 templates render the Markdown pages so output is easy to tune.
- **Dependencies:** `pydantic`, `pyyaml`, `jinja2`.
- **Run model:** `make processes` (or equivalent) regenerates committed Markdown and the
  gitignored JSON build artifacts.
- **CI drift check:** CI runs the generator and fails if the committed **Markdown** is
  stale relative to the YAML source — so source and rendered pages never silently diverge.
  (The JSON build artifacts are not committed and need no drift check.)

## 7. Future-proofing & explicit non-goals

### Designed-for (later phases)
- **→C (KG projection):** stable IDs and typed edges (`next`, `branches`, `process_ref`,
  `api_refs`) let a later exporter emit graph nodes/edges with no re-authoring.
- **Chat/RAG:** the enriched per-process JSON + `index.json` manifest (with `trigger_graph`
  and per-process `api_index` rollups) are the structured feed; per-file granularity suits
  per-record retrieval, and the manifest gives one-fetch discovery.

### Non-goals (now)
- Building the chat/RAG layer itself.
- CI validation that each API ref **resolves** to a real KG entry (only Markdown drift is
  checked now).
- Any write-back/projection into the KG.

## 8. Deliverables (first cut)

1. Process schema (Pydantic model + generated `process.schema.json`).
2. `scripts/gen_processes.py` generator (validation + Markdown rendering + gitignored JSON
   emission).
3. `processes.config.yaml` and `make processes` target + CI drift check.
4. Site wiring: top-level **Business Processes** section.
5. Two worked examples proving the model end to end:
   - `loan-origination` (business) — includes a `decision` gate, a `manual` step, and a
     `process_ref`.
   - `sdlc-feature-delivery` (technical).
