# Capstone Brief — Dexter (FBP Extensibility Assistant)

> Filled-in capstone brief, derived from the [Capstone Brief Template](capstone-brief-template.md).
> Capstone slice: **Service Extensibility — new columns only**. The other extensibility types are out of scope (see below).
> Hand this out on **Day 3**; trainees expand it into a full LLD.

---

## Brief

### Domain name

`dexter`

### The problem (2–3 sentences)

Implementation teams extend FBP services by hand-writing Service-Extensibility configs (new columns and their validations) — slow, error-prone, and easy to get subtly wrong (wrong Operation, unsupported data type, a mandatory column with no default). **Dexter** turns a plain-language request into a correct Service-Extensibility config and validates existing configs against the live service schema and FBP's rules — all in the no-code / no-compile paradigm.

### Who uses it

An **implementation engineer** extending existing FBP services — e.g. "add a `loyalty_tier` column to the customer service" — who wants the config drafted correctly, or wants their hand-written config checked before applying it.

### Example interactions (3–5)

1. User: "Add an optional text column `loyalty_tier` to the customer service." → Generates an **Input Fields — Schema** row: `loyalty_tier | Create | String | N | — | Customer loyalty tier`.
2. User: "Make `email` mandatory on the customer service." → `email` exists in the catalog, so Operation = **Modify**, Mandatory = **Y**; Dexter warns that an existing column going mandatory needs a Default Value or backfill.
3. User (multi-service): "Add `loyalty_tier` to the customer service and a mandatory `region` to the orders service." → Returns **two** `2.x` service blocks, each with its own schema/validation tables; `region` on orders flagged for needing a Default Value.
4. User (edge): "Add an `id` column to the orders service." → `id` already exists → validator **rejects** the implied `Create` and explains it must be a `Modify`.
5. User (negative): "Add a `price` column of type Money to invoices." → `Money` is not in the supported-data-types enum → flagged with the supported-type list.

### Inputs & outputs

- **Inputs the domain needs:** a natural-language extension request **or** an existing config to validate; the target service name(s); (for validation) the config tables.
- **Outputs it produces:**
  - A **structured** Service-Extensibility config — an array of services, each with **Input Fields — Schema**, **Input Fields — Validations**, **Output Fields — Schema**, and **Service — Validations** tables (needs an output schema).
  - A **structured** validation report — a list of `{severity, service, column, message}` (needs an output schema).

The config shape mirrors the LLD's **Section 2 — Service Extensibility**:

- **Schema row:** Column Name · Operation `{Create / Modify}` · Data Type · Mandatory `{Y/N}` · Default Value · Description
- **Validation row:** Column Name · Validation Type `{Required / Regex / Range / Length / Enum / Custom}` · Detail · Error Message

### Data it touches

A read-only **FBP service catalog** — existing services, their current columns, and the **supported-data-types enum** — served by a **mock API** and reached through a tool. Dexter **reads** this to ground generation and validation; it does **not** write or apply configs. (Assume the supported-data-types enum is provided by the catalog.)

### What "done" looks like (definition of done)

- [ ] Happy path runs end-to-end in the Chainlit UI (request → generated config).
- [ ] Each service has unit tests (happy + negative) from the LLD scenarios.
- [ ] A Langfuse trace shows the request flowing correctly.
- [ ] The pair can demo it and explain the design.

### Proposed agent map (facilitator's starting hypothesis — trainees refine on Day 3)

| Agent | Role | Default? | Tools | Wraps service(s) | Output schema? |
|-------|------|----------|-------|------------------|----------------|
| `dexter_coordinator` | Greets, understands the request, routes generate vs. validate | yes (`is_default: true`) | `handoff`, `get_agent_list` | — | no |
| `column_generator` | Turns an NL request into a Service-Extensibility config (one or more services), grounded in the catalog | no | `get_service_schema`, `handoff` | `generation` | **yes** (config) |
| `column_validator` | Checks a config against catalog + FBP rules, explains issues | no | `get_service_schema`, `handoff` | `validation` | **yes** (report) |

**Validation rules the `column_validator` should enforce (from the LLD):**

- Operation correctness: `Create` only if the column does **not** exist in the catalog; `Modify` only if it **does**.
- A `Create` column with Mandatory = `Y` must have a Default Value (or be flagged for backfill).
- Data Type must be in the supported-data-types enum.
- Validation Type must be one of `{Required / Regex / Range / Length / Enum / Custom}`; types that need a `Detail` (Regex / Range / Length / Enum / Custom) must provide one.

### Out of scope (say it explicitly)

- The other three extensibility types — **CRUD APIs, Fetch APIs, Groovy LPUs** (this capstone is **columns only**).
- **Applying / persisting** configs to FBP (output is returned, never written).
- Generating Groovy for the `Custom` validation type (accept it as a pass-through string; don't author logic).
- Auth, persistence beyond session, batch mode.

---

## Reference to compare against

Dexter's shape — a coordinator routing to a generator and a validator, both grounding on a read-only catalog tool — maps cleanly onto Jarvis's Customer Support domain (coordinator + ticket-handler + knowledge-base). Use it as a reference, not a copy.
