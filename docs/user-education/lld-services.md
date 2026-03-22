---
date: 2026-03-21
tags:
  - how-to
status: final
---

# LLD — Services

The Services section describes **how business functionality is exposed** to consumers. In Java terms, these correspond to service classes; more broadly, they represent the entry and exit points of your feature.

## Key concepts

**Exposure methods**

A service can be made available through different channels:

| Method                  | Description                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Sync via REST API       | Exposed via an HTTP endpoint — define the operation type (CREATE, FETCH, UPDATE, DELETE)                         |
| Async via Streaming API | Consumed via a message queue or Kafka subscriber — requires async properties (direction, topic, event condition) |
| Batch                   | For future use                                                                                                   |


**Service Identity vs. Service I/O**

The template separates a service's identity (what it is and what it does) from its I/O (what goes in and what comes out). This separation makes it easier to review services at a glance before diving into data flow details.

**Sync vs. Async**

A service can support both synchronous and asynchronous invocation. If a service has async behaviour (e.g., publishing an event after creation), capture the async properties separately — including direction (Inbound/Outbound), queue/topic name, message model, and trigger condition.

## Filling in the template

### Service Identity

Defines what each service is and what it does.

| Column         | Description                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service Name   | The programmatic name of the service (e.g., `partyCreation`, `fetchPartyById`). Maps to a service class/method in code                            |
| Service Domain | The business domain this service belongs to (e.g., "Party Management", "Accounts"). Used for grouping and routing in the framework                |
| Operation Type | The CRUD classification: `CREATE`, `FETCH BY ID`, `UPDATE BY ID`, `FETCH ALL`, etc. Drives the HTTP method and endpoint pattern in generated APIs |
| Description    | What this service does in business terms — the outcome, not the implementation steps                                                              |

### Service I/O

Defines what goes in and what comes out of each service.

| Column | Description |
|---|---|
| Service Name | Same service name as in the Identity table |
| Invocation Type | How this service is called: `Sync` (request-response), `Async` (message-driven), or both (`Sync / Async`) |
| Parameters | Path/query parameters beyond the request body (e.g., `path → partyId`). Leave blank if the service only takes a body |
| Input Model | The data model consumed as input by this service. Can be a single model (e.g., `Party`) or a collection (e.g., `List<Party>`). Leave blank for services with no request body (e.g., fetch operations) |
| Output Model | The data model returned as output by this service. Can be a single model (e.g., `Party`) or a collection (e.g., `List<Party>`) |

### Domain Extensions — Java

| Property | Description |
|---|---|
| Service Name | Same service name |
| Enable Audit | `Y` to enable audit logging for this service — tracks who called it, when, and with what data. `N` to skip |
| Engine | The processing engine: `Compose Engine` for services that use local LPUs within the same microservice, or `Process Manager` for services that depend on other microservices for their actions |

### Async Properties

Captures messaging details for services with asynchronous behaviour.

| Column        | Description       |
| ------------- | ----------------- |
| Service Name  | Same service name |
| Direction     | #todo             |
| Queue / Topic | #todo             |
| Message Model | #todo             |
| Condition     | #todo             |

## Tips

- Name services after **business operations** (e.g., `partyCreation`, `fetchPartyById`) rather than technical patterns
- Define **clear I/O models** — every service should reference data models from the [[lld-data-models|Data Models]] section. Avoid inline field lists
- Specify the **invocation type** explicitly (Sync, Async, or both) — this drives how the service is wired in the framework
- Document **async event conditions** — if a service publishes events, capture the event code and the condition under which it fires
- Keep service descriptions **focused on the business outcome**, not the implementation steps — the implementation detail belongs in [[lld-logical-processing-units|LPUs]]

---

## Template Structure

> [!abstract] Template: Service Definitions
>
> **Service Identity**
>
> | Service Name | Service Domain | Operation Type | Description |
> | ------------ | -------------- | -------------- | ----------- |
> |              |                |                |             |
>
> **Service I/O**
>
> | Service Name | Invocation Type | Parameters | Input Model | Output Model |
> | ------------ | --------------- | ---------- | ----------- | ------------ |
> |              | Sync / Async    |            |             |              |
>
> **Domain Extensions — Java**
>
> | Service Name | Enable Audit | Engine |
> | ------------ | ------------ | ------ |
> |              | {Y / N}      |        |
>
> **Async Properties**
>
> | Service Name | Direction | Queue / Topic | Message Model | Condition |
> | ------------ | ------------------ | ------------- | ------------- | --------- |
> |              | Inbound / Outbound |               |               |           |
>
> *Full template: [[lld-template]]*

## Example: Party Management

> [!example]- Example: Service Definitions
>
> **Service Identity**
>
> | Service Name | Service Domain | Operation Type | Description |
> | ----------------- | -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | partyCreation     | {TBD}          | CREATE         | Creates a new party record with mandatory type and optional sections including contact details and profile attributes. Returns the created party with system-generated ID |
> | partyModification | {TBD}          | UPDATE BY ID   | Updates an existing party record by ID. Replaces core fields and profile attributes with provided data. Returns the updated party details |
> | fetchPartyById    | {TBD}          | FETCH BY ID    | Retrieves complete party details including contact information and profile attributes for a specified party identifier |
>
> **Service I/O**
>
> | Service Name | Invocation Type | Parameters | Input Model | Output Model |
> | ----------------- | --------------- | --------------- | ----------- | ------------ |
> | partyCreation     | Sync / Async    |                 | Party       | Party        |
> | partyModification | Sync            | path → partyId | Party       | Party        |
> | fetchPartyById    | Sync            | path → partyId |             | Party        |
>
> **Domain Extensions — Java**
>
> | Service Name | Enable Audit | Engine |
> | ----------------- | ------------ | -------------- |
> | partyCreation     | {Y / N}      | Compose Engine |
> | partyModification | {Y / N}      | Compose Engine |
> | fetchPartyById    | {Y / N}      | Compose Engine |
>
> **Async Properties**
>
> | Service Name | Direction | Queue / Topic | Message Model | Condition |
> | ------------- | --------- | ------------- | ------------- | ------------------------- |
> | partyCreation | Outbound  |               |               | Event Code: PARTY_CREATED |
>
> *Full example: [[sample-lld]]*

---

## Related

- [[lld-data-models]] — Previous section: data structures
- [[lld-logical-processing-units]] — Next section: business logic
- [[lld-structure-overview]] — Overview of all LLD sections
