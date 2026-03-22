# LLD — Logical Processing Units

Logical Processing Units (LPUs) are the **atomic business operations** that make up a [Lld Flows](lld-flows.md)'s processing logic. They break down complex business functionality into smaller, reusable chunks.

## Key concepts

**Types**

| Type         | Description                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- |
| Manual       | Hand-coded — the developer writes the implementation from scratch                           |
| LLM Assisted | Code generated from the business logic description with [Nurture Overview](../nurture/nurture-overview.md) help           |
| Standard     | Uses a platform-provided standard pattern (e.g., CRUD persistence) — no custom logic needed |

**Sub-types**

The functional classification of each LPU. Used to optimise chaining of LPUs in Flows.

| Sub-Type | Purpose |
|---|---|
| Validation | Input and business rule checks |
| Enrichment | Fetching additional data to augment the input |
| Host Call | Calling an external system |
| Processing | Core business logic and calculations |
| Persistence | Writing to a data store |
| SetDefaults | Applying default values before processing |
| Transformation | Converting data from one format to another |
| Complete | Finalising a flow or aggregating results |

**Why LPUs matter**

- **Validation** — By explicitly capturing inputs and outputs at each step, you can verify that data flows correctly from the edges of the feature through to the final result
- **Reusability** — Well-defined LPUs can be reused across services
- **Code generation** — Clear processing logic in plain English translates directly into implementable steps

**Illustrative example**

> **LPU:** Calculate interest amount
> **Input:** Principal amount, interest rate, tenor
> **Output:** Calculated interest amount
> **Sub-Type:** Processing
> **Logic:**
> 1. Retrieve the principal amount and interest rate from the input
> 2. Apply the interest formula based on the tenor
> 3. Return the calculated interest amount

## Filling in the template

### Logical Processing Units

One row per atomic business operation.

| Column          | Description                                                                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit Name       | The programmatic name of the LPU (e.g., `validateParty`, `partyPersist`). Should be descriptive of the operation                                                                                                                                                     |
| Type            | How this LPU is implemented: `Manual` (hand-coded), `LLM Assisted` (LLM-generated from business logic), or `Standard` (platform-provided pattern)                                                                                                                    |
| Sub-Type        | The functional classification: `Validation`, `Enrichment`, `Host Call`, `Processing`, `Persistence`, `SetDefaults`, `Transformation`, `Complete`. Used to optimise chaining of LPUs in Flows. Input / Output operations need to be at the edges of the [Lld Flows](lld-flows.md) |
| Input           | The [Lld Data Models](lld-data-models.md) consumed by this LPU (e.g., `PartyDTO`, `PartyProfileAttributeDTO`)                                                                                                                                                                          |
| Output          | The [Lld Data Models](lld-data-models.md) produced by this LPU (e.g., `PartyResponseDTO`). Leave blank for side-effect-only operations like persistence                                                                                                                                |
| Referenced Data | [Lld Data Models](lld-data-models.md) used by this LPU during processing that come from other sources — not provided as input to the service (e.g., looking up existing records from the database)                                                                                     |
| Business Logic  | Step-by-step description of what this LPU does, in plain English with numbered steps. This is the implementation specification — clear enough for a developer or LLM to translate into code                                                                          |

## Tips

- Define **one LPU per business rule** — if an LPU does two unrelated things, split it into two
- Use **Sub-Type** to classify each LPU — this optimises how the framework chains LPUs in a flow
- Write **business logic in plain English** — numbered steps describing what happens, not pseudo-code. The implementation translates from this
- Reference **data models by name** — use the exact model names from [Lld Data Models](lld-data-models.md) in the Input and Output columns for traceability
- Keep LPUs **reusable across flows** — a well-defined persistence or validation LPU can serve multiple services

---

## Template Structure

!!! abstract "Template: Logical Processing Units"

    | Unit Name | Type | Sub-Type | Input | Output | Referenced Data | Business Logic |
    | --------- | ---- | -------- | ----- | ------ | --------------- | -------------- |
    |           |      |          |       |        |                 |                |

    **Type**: Manual / LLM Assisted / Standard

    **Sub-Type**: Enrichment / Validation / Host Call / Processing / Persistence / SetDefaults / Transformation / Complete

    *Full template: [Lld Template](../reference/lld-template.md)*

## Example: Party Management

??? example "Example: Logical Processing Units"

    | Unit Name | Type | Sub-Type | Input | Output | Referenced Data | Business Logic |
    | -------------------------------- | ------------ | ----------- | -------------------------------- | ----------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | validateParty                    | LLM Assisted | Validation  | PartyDTO                         |             |                 | 1. Validate whether partyNumber already exists using findByPartyNumberAndOrgCode from database 2. If already exists throw an error with Error Code "PARTY_NUMBER_ALREADY_EXISTS" |
    | partyProfileAttributeDataPersist | Standard     | Persistence | PartyProfileAttributeDTO         |             |                 | Standard persistence behaviour for PartyProfileAttribute entities |
    | partyPersist                     | Standard     | Persistence | PartyDTO                         |             |                 | Standard persistence behaviour for Party entities |
    | fetchPartyById                   | LLM Assisted | Processing  | partyId                          | PartyEntity |                 | 1. Get partyId from requestParamsMap 2. Find party by id from database and populate the response in PartyEntity 3. If no records exist in DB throw NO_RECORDS_FOUND error |
    | modifyParty                      | LLM Assisted | Processing  | PartyEntity, ExistingPartyEntity | PartyEntity |                 | 1. For each field in existingPartyEntity set it with corresponding field in the PartyEntity 2. Preserve system fields from existing entity |

    *Full example: [Sample Lld](../reference/sample-lld.md)*

---

## Related

- [Lld Services](lld-services.md) — Previous section: services that orchestrate LPUs
- [Lld Test Data](lld-test-data.md) — Next section: test payloads
- [Lld Structure Overview](lld-structure-overview.md) — Overview of all LLD sections
