---
date: 2026-03-21
tags:
  - how-to
status: final
---

# LLD — Data Models

The Data Models section defines all the **data structures** involved in your feature — whether data at rest, data in motion, or data at the API boundary. This is typically the first technical section you fill in after [[lld-background|Background]].

## Key concepts

**Types of data models**

Every model you define falls into one of these categories. Understanding which type you are working with helps set the right properties in the template.

| Type | Examples | Description |
|---|---|---|
| Data at rest | JPA entities, database tables | Persistent data stored in tables — needs PK strategy, indexes |
| Data in motion | Kafka messages, queue payloads | Data flowing through messaging systems — should be self-contained |
| API boundary | DTOs, request/response objects | Data exchanged via APIs — needs clear attribute boundaries |

**New vs. Enhancement**

If a model is marked as an **enhancement** (`Is New Model: False`), the attributes listed represent **only the changes** on top of the existing model — not the full model definition. Unchanged attributes should not be repeated.

**Domain-specific details**

Beyond the generic attribute details, the section also captures:

- **Indexes** — Which columns are indexed and why. These should align with the queries defined in the [[lld-template|Data Access]] section
- **Primary keys** — Key composition and generation strategy (Auto-increment, UUID, Composite). Choose based on your domain — UUIDs for distributed systems, sequences for simpler setups
- **Relationships** — Foreign keys and associations between models. Use the `Parent Model` property to express parent-child relationships (e.g., `ContactDetails` is a child of `Party`)

## Filling in the template

### Data Model — Properties

Each model starts with a Properties table that classifies the model.

| Property | Description |
|---|---|
| Model Type | How the model is used: **DTO** (API boundary only — not persisted), **Entity** (persisted to DB with its own table and PK), **Hybrid** (serves both API and persistence), **Embedded** (value object nested inside another model, no separate table) |
| Is New Model | `True` if this is a brand-new model introduced by this feature. `False` if enhancing an existing model — in that case, only list changed/added attributes in the Schema table |
| Parent Model | If this model is a child of another (e.g., `ContactDetails` belongs to `Party`), name the parent here. `None` if it stands alone |
| Primary Key Strategy | How the primary key is generated: `Auto-increment` (DB sequence), `UUID` (application-generated), `Composite` (multi-column key). Set to `N/A` for DTOs that aren't persisted |

### Structure — Schema

One row per attribute/field in the model.

| Column | Description |
|---|---|
| Column Name | The attribute/field name as it appears in code (e.g., `partyNumber`). Follows the project's naming convention — camelCase for Java, snake_case for Python |
| Data Type | The data type of this field. Can be: (1) an OpenAPI primitive (`String`, `Integer`, `Boolean`, `Number`), (2) a **platform type** from the FBP type registry (e.g., `BusinessDateDTO`, `AmountDTO` — see [[fbp-data-types]]), or (3) a **reference to another model** defined in this LLD (`ContactDetails`, `List<PartyProfileAttribute>`) |
| Mandatory [Y/N] | `Y` if required — translates to a not-null DB constraint for entities and a required-field validation for API payloads. `N` if optional |
| Default Value | The value assigned if the caller/system doesn't provide one. Leave blank if there is no default |
| Description | What this field represents in business terms — not a technical definition but a business explanation (e.g., "Business-assigned party number", not "varchar primary key field") |

### Structure — Business Metadata

Adds business context to each attribute defined in the Schema table.

| Column             | Description                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Column Name        | Same field name as in the Schema table — this table adds business context to each attribute                                                                                                                                                       |
| Business Name      | The human-readable, business-friendly label for this field (e.g., `partyNumber` → "Party Number"). Used in generated UI labels, [[lld-test-scenarios]] and reports                                                                                |
| Business Key [Y/N] | `Y` if this field is a business identifier — a field that uniquely identifies the record from a business perspective (e.g., `partyNumber`). Distinct from the technical primary key. Drives search indexes and lookup behaviour in generated code |
| Validations        | Validation rules applied to this field — e.g., `maxLength: 50`, `format: email`, or a reference to an enumeration name like `PartyTypeCode`. These translate to validation annotations in generated code                                          |

### Domain Extensions — Java

Platform-specific properties for Java/FBP models. Only relevant for Entity and Hybrid model types.

| Property | Description |
|---|---|
| ID Generator Type | How the technical ID (primary key) is generated: `timeBasedUUIDAllocator` (time-based UUIDs — good for distributed systems and ordering) or `dbSequenceAllocator` (database sequence — simpler, sequential) |
| Skip Add ID Column | `Yes` to prevent the framework from auto-adding an `id` column — use when the model has a composite key or the ID is managed externally. `No` (default) lets the framework add the standard `id` column |

The full template also includes Domain Extensions for Node-RED and Python — see [[lld-template]].

### Enumerations

Enumerations define fixed value sets referenced by data model attributes. Listed as section 3 in the [[lld-template|template]] but documented here alongside data models since they are tightly coupled.

| Column | Description |
|---|---|
| Enum Name | The name of the enumeration type (e.g., `PartyTypeCode`). Referenced from the Schema table's Data Type or the Business Metadata's Validations column |
| Data Type | The underlying primitive type of the enum values — typically `String` or `Integer` |
| Values | The allowed values, comma-separated (e.g., `INDIVIDUAL, ORGANIZATION`) |
| Description | What this enumeration represents in business terms |

## Tips

- Start from **business entities** — identify the real-world things your feature manages (Party, Account, Transaction) before listing technical fields
- Choose the right **Model Type** — if the API payload differs from what is stored (flattened fields, computed values, omitted internal columns), define them as separate DTO and Entity models rather than forcing a Hybrid
- Define **child models separately** — if a model contains a nested object or collection (like `contactDetails` inside `Party`), create a separate model for the child with `Parent Model` set accordingly. This keeps each schema table flat and readable
- Fill in **Business Metadata** completely — the Business Name and Business Key columns drive generated UI labels and search behaviour. Skipping them leads to placeholder names in generated code
- Use **consistent naming** — follow the project's field naming conventions. The sub-agent will mirror whatever style you use
- List **enumerations** at the end — any fixed value sets (status codes, type codes) belong in the Enumerations table rather than being described inline

---

## Template Structure

> [!abstract] Template: Data Models & Enumerations
>
> **Data Model — Properties**
>
> | Property | Value |
> | -------------------- | ---------------------------------------- |
> | Model Type | {DTO / Entity / Hybrid / Embedded} |
> | Is New Model | {True / False} |
> | Parent Model | {ParentModelName / None} |
> | Primary Key Strategy | {Auto-increment / UUID / Composite / …} |
>
> **Structure — Schema**
>
> | Column Name | Data Type | Mandatory [Y/N] | Default Value | Description |
> | ----------- | --------- | --------------- | ------------- | ----------- |
> |             |           |                 |               |             |
>
> **Structure — Business Metadata**
>
> | Column Name | Business Name | Business Key [Y/N] | Validations |
> | ----------- | ------------- | ------------------ | ----------- |
> |             |               |                    |             |
>
> **Domain Extensions — Java**
>
> | Property | Value |
> | ------------------ | --------------------------------------------------- |
> | ID Generator Type | {timeBasedUUIDAllocator / dbSequenceAllocator / …} |
> | Skip Add ID Column | {Yes / No} |
>
> **Enumerations**
>
> | Enum Name | Data Type | Values | Description |
> | --------- | --------- | ------ | ----------- |
> |           |           |        |             |
>
> *Full template: [[lld-template]]*

## Example: Party Management

> [!example]- Example: Data Models & Enumerations
>
> **2.1 Party — Properties**
>
> | Property | Value |
> | -------------------- | ------ |
> | Model Type | Hybrid |
> | Is New Model | True |
> | Parent Model | None |
> | Primary Key Strategy | {TBD} |
>
> **Party — Schema**
>
> | Column Name | Data Type | Mandatory [Y/N] | Default Value | Description |
> | ------------------------ | -------------------------------- | --------------- | ------------- | ------------------------------------- |
> | partyNumber | String | Y | | Business-assigned party number |
> | partyName | String | Y | | Full legal name |
> | shortName | String | N | | Display name |
> | partyTypeCode | String | Y | | Structural classification (immutable) |
> | cifId | String | N | | Customer Information File reference |
> | modeOfAddressing | String | N | | |
> | dobOrDateOfIncorporation | BusinessDateDTO | N | | Date of birth or incorporation |
> | contactDetails | ContactDetails | N | | Contact information for the party |
> | profileAttributes | List `<PartyProfileAttribute>` | N | | Profile Attribute Data for the party |
>
> **Party — Business Metadata**
>
> | Column Name | Business Name | Business Key [Y/N] | Validations |
> | ------------------------ | ---------------------------- | ------------------ | -------------- |
> | partyNumber | Party Number | Y | maxLength: 50 |
> | partyName | Party Name | N | maxLength: 255 |
> | shortName | Short Name | N | maxLength: 50 |
> | partyTypeCode | Party Type | N | PartyTypeCode |
> | cifId | CIF ID | N | maxLength: 50 |
> | modeOfAddressing | Mode Of Addressing | N | maxLength: 50 |
> | dobOrDateOfIncorporation | Dob Or Date Of Incorporation | N | |
> | contactDetails | Contact Details | N | |
> | profileAttributes | Profile Attributes | N | |
>
> ---
>
> **2.2 ContactDetails — Properties**
>
> | Property | Value |
> | -------------------- | ----- |
> | Model Type | DTO |
> | Is New Model | True |
> | Parent Model | None |
> | Primary Key Strategy | N/A |
>
> **ContactDetails — Schema**
>
> | Column Name | Data Type | Mandatory [Y/N] | Default Value | Description |
> | ------------ | --------- | --------------- | ------------- | --------------------- |
> | phoneNumber | String | N | | Primary phone number |
> | mobileNumber | String | N | | Mobile phone number |
> | emailAddress | String | N | | Email contact address |
>
> **ContactDetails — Business Metadata**
>
> | Column Name | Business Name | Business Key [Y/N] | Validations |
> | ------------ | ------------- | ------------------ | ----------------------------- |
> | phoneNumber | Phone Number | N | maxLength: 20 |
> | mobileNumber | Mobile Number | N | maxLength: 20 |
> | emailAddress | Email Address | N | maxLength: 255, format: email |
>
> ---
>
> **Enumerations**
>
> | Enum Name | Data Type | Values | Description |
> | ------------- | --------- | ------------------------ | ------------------------------------------------------ |
> | PartyTypeCode | String | INDIVIDUAL, ORGANIZATION | Party type classification (individual or organization) |
>
> *Full example: [[sample-lld]]*

---

## Related

- [[lld-background]] — Previous section: business context
- [[lld-services]] — Next section: defining services
- [[lld-structure-overview]] — Overview of all LLD sections
