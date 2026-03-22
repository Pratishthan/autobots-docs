---
date: 2026-03-21
tags:
  - how-to
status: final
---

# LLD — Test Data

The Test Data section captures **reusable payloads and data structures** that will be used across test scenarios. Test data defined here is created at the component level but reused in integration and end-to-end testing.

## Key concepts

**How test data is used**

Test data defined here is referenced in [[lld-test-scenarios]] via the data set name. Individual scenarios may apply **specific overrides** on top of the base test data.

For example, if you define a "Standard Savings Account" test data set, a specific scenario might override the customer category field to test a different customer type. This approach keeps scenarios concise while maintaining traceability to the underlying data.

**Base data vs. overrides**

Define your test data sets with sensible defaults that represent a valid, happy-path payload. Each test scenario can then override only the fields relevant to its specific case — this avoids duplicating entire payloads across scenarios.

**Two-level structure**

Test Data uses a two-level structure:
1. A **summary table** that indexes all data sets with their purpose and base data set
2. A **detail sub-section per model** containing a wide table where each row is a data set and each column is a business-relevant attribute

**Parent-child data**

When a data model has child models (e.g., `Party` → `ContactDetails` → `PartyProfileAttribute`), each model gets its own wide table in the detail section. Child tables include a **Parent Data Set** column linking each child row to its parent data set. This keeps tables narrow, handles collections naturally (multiple child rows per parent), and mirrors the data model structure from [[lld-data-models]].

## Filling in the template

### Test Data — Summary Table

One row per data set. Acts as an index.

| Column | Description |
|---|---|
| Data Set Name | A business-meaningful name for this test data set (e.g., "Individual Party with Full Contact Details"). Used to reference this data in test scenarios |
| Model / Entity | The data model this payload represents — matches a model name from [[lld-data-models]] |
| Base Data Set Name | The data set this one inherits from. Override data sets only need to specify the fields that differ from the base. Leave blank for root data sets |
| Purpose | What business scenario or variation this data set supports (e.g., "Happy path creation", "Edge case with missing optional fields") |
| Notes | Any additional context — dependencies on other data sets, special setup requirements, or known limitations |

### Test Data — Detail Section

Each model gets its own sub-section (`### 11.0.x Model Name`) containing a **wide table** where:
- Each **row** is a data set
- Each **column** is a business-relevant attribute from the model's schema
- Only include columns that matter for test scenarios — not the full schema

For child models, include a **Parent Data Set** column linking each row to its parent data set. A parent can have multiple child rows (e.g., multiple profile attributes for one party).

## Tips

- Each test data set should represent a **business scenario**, not just technical defaults
- Include all attributes that have a **bearing on business logic** — purely technical fields with no impact on scenarios can be skipped
- Use **realistic, meaningful sample values** that make the scenario clear at a glance
- Name data sets after the **business context** they represent (e.g., "Individual Party with Full Contact Details") rather than generic names like "Test Data 1"
- Create **one data set per meaningful variation** — if two scenarios need different party types, define separate data sets rather than relying on overrides for everything

---

## Template Structure

> [!abstract] Template: Test Data
>
> | Data Set Name | Model / Entity | Base Data Set Name | Purpose | Notes |
> | ------------- | -------------- | ------------------ | ------- | ----- |
> |               |                |                    |         |       |
>
> ### 11.0.1 `Model Name`
>
> _(Wide table — one row per data set, one column per business-relevant attribute)_
>
> ### 11.0.2 `Child Model Name`
>
> _(Wide table — includes Parent Data Set column linking to parent rows)_
>
> *Full template: [[lld-template]]*

## Example: Party Management

> [!example]- Example: Test Data
>
> | Data Set Name | Model / Entity | Base Data Set Name | Purpose | Notes |
> | ------------------------------------------- | -------------- | ----------------------------------------- | ------------------------------------------ | ----- |
> | Individual Party with Full Contact Details  | Party          |                                           | Happy-path creation with all attributes    |       |
> | Individual Party with Mandatory Fields Only | Party          |                                           | Minimal valid creation                     |       |
> | Organization Party                          | Party          | Individual Party with Full Contact Details | Tests ORGANIZATION type                    | Override: partyTypeCode, partyName, cifId  |
>
> ---
>
> **11.0.1 Party**
>
> | Data Set Name | partyNumber | partyName | shortName | partyTypeCode | cifId | modeOfAddressing | dobOrDateOfIncorporation |
> | ------------------------------------------- | ----------- | ------------------ | ---------- | ------------- | --------- | ---------------- | ------------------------ |
> | Individual Party with Full Contact Details  | PTY-001     | John William Smith | John Smith | INDIVIDUAL    | CIF-10001 | Mr.              | 1990-05-15               |
> | Individual Party with Mandatory Fields Only | PTY-002     | Jane Doe           |            | INDIVIDUAL    |           |                  |                          |
> | Organization Party                          | PTY-003     | Acme Holdings Ltd  | Acme       | ORGANIZATION  | CIF-20001 |                  | 2005-03-12               |
>
> ---
>
> **11.0.2 ContactDetails**
>
> | Parent Data Set | phoneNumber | mobileNumber | emailAddress |
> | ------------------------------------------- | ----------------- | ---------------- | ----------------------- |
> | Individual Party with Full Contact Details  | +44-20-7946-0958  | +44-7911-123456  | john.smith@example.com  |
> | Organization Party                          | +44-20-7946-1234  |                  | info@acmeholdings.co.uk |
>
> ---
>
> **11.0.3 PartyProfileAttribute**
>
> | Parent Data Set | profileAttributeName | data |
> | ------------------------------------------ | -------------------- | --------------- |
> | Individual Party with Full Contact Details | nationality          | {"code": "GB"}  |
> | Individual Party with Full Contact Details | occupation           | {"code": "ENG"} |
>
> *Full example: [[sample-lld]]*

---

## Related

- [[lld-logical-processing-units]] — Previous section: business logic
- [[lld-test-scenarios]] — Next section: test cases that use this data
- [[lld-structure-overview]] — Overview of all LLD sections
