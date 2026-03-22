---
date: 2026-03-21
tags:
  - how-to
  - #todo
status: draft
---

# LLD — Flows

A Flow defines the **sequence in which [[lld-logical-processing-units|LPUs]] execute** within a [[lld-services|service]]. While LPUs are the atomic operations, a Flow stitches them together into an end-to-end processing pipeline.

## Key concepts

**How Flows relate to Services and LPUs**

- A **Service** exposes business functionality to consumers
- A **Flow** defines the orchestration — which LPUs run and in what order
- An **LPU** performs a single atomic operation

A service may have one or more flows (e.g., a happy-path flow and an error-handling flow).

**Typical flow pattern**

Most flows follow a common sequence:

| Step | Purpose | Example LPU |
|---|---|---|
| 1. Validate | Check that the input is well-formed and complete | `Validate Account Request` |
| 2. Enrich | Fetch additional data needed for processing | `Enrich Customer Details` |
| 3. Process | Apply business rules and calculations | `Calculate Interest Amount` |
| 4. Persist | Store the result in the database | `Save Account Record` |
| 5. Publish | Notify downstream systems via events | `Publish Account Created Event` |

Not every flow will have all five steps — some may skip enrichment or publishing, others may have multiple processing steps.

**Illustrative example**

> **Flow:** Create Savings Account
> **Service:** Account Service
> **Sequence:**
> 1. `Validate Account Opening Request` — Check mandatory fields, customer eligibility
> 2. `Enrich Customer Profile` — Fetch KYC status and risk category
> 3. `Apply Account Opening Rules` — Determine account type, interest tier
> 4. `Persist Account` — Save the new account record
> 5. `Publish Account Created Event` — Notify downstream systems

## Filling in the template

### Flow & State

Captures the states and transitions in a flow's lifecycle.

| Column | Description |
|---|---|
| State Name | A named state in the flow's lifecycle (e.g., "Validated", "Enriched", "Persisted"). Represents a checkpoint after one or more LPUs complete |
| Description | What this state means — what has been accomplished at this point in the flow |
| Transitions To | Which state(s) can follow this one (e.g., "Validated" → "Enriched") |
| Trigger Condition | What causes the transition — typically the successful completion of an LPU or a specific business condition |

### Domain Extensions — Java (Transactional Boundaries)

Defines which operations must succeed or fail as a unit.

| Column | Description |
|---|---|
| Boundary Name | A name for the transactional boundary (e.g., "Party Creation Transaction") |
| Scope / Operations Covered | Which LPUs or operations are grouped within this transaction — they all succeed or fail together |
| Rollback Strategy | What happens on failure — full rollback, partial rollback, compensating action, etc. |

## Tips

- Map flows to service operations **1:1** where possible — if a service has three operations, expect three flows
- Follow the **standard pattern order** (Validate → Enrich → Process → Persist → Publish) unless your domain requires a different sequence
- Keep flows focused on **orchestration, not logic** — the business rules belong in the LPUs. The flow just defines the order
- Define **state transitions** explicitly — capture what triggers each transition and what the valid next states are
- For **transactional boundaries**, document which LPUs must succeed or fail together as a unit

---

## Template Structure

> [!abstract] Template: Flow & State
>
> | State Name | Description | Transitions To | Trigger Condition |
> | ---------- | ----------- | -------------- | ----------------- |
> |            |             |                |                   |
>
> **Domain Extensions — Java (Transactional Boundaries)**
>
> | Boundary Name | Scope / Operations Covered | Rollback Strategy |
> | ------------- | -------------------------- | ----------------- |
> |               |                            |                   |
>
> *Full template: [[lld-template]]*

## Example: Party Management

> [!example]- Example: Flow & State
>
> | State Name | Description | Transitions To | Trigger Condition |
> | ---------- | ----------- | -------------- | ----------------- |
> |            |             |                |                   |
>
> **Domain Extensions — Java (Transactional Boundaries)**
>
> | Boundary Name | Scope / Operations Covered | Rollback Strategy |
> | ------------- | -------------------------- | ----------------- |
> |               |                            |                   |
>
> *Note: This section was not fully populated in the sample LLD. In practice, you would define state transitions and transactional boundaries here.*
>
> *Full example: [[sample-lld]]*

---

## Related

- [[lld-services]] — Previous section: services that use these flows
- [[lld-logical-processing-units]] — The atomic operations stitched together by flows
- [[lld-test-scenarios]] — Test scenarios validate the end-to-end flow
- [[lld-structure-overview]] — Overview of all LLD sections
