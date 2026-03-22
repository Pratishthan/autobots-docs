---
date: 2026-03-21
tags:
  - how-to
status: final
---

# LLD — Test Scenarios

The Test Scenarios section captures the **business scenarios** that validate your feature. These are structured using the **Given/When/Then** paradigm from Behaviour-Driven Development (BDD) and are translated into Cucumber feature files.

## Key concepts

**Types of scenarios**

| Type | Description |
|---|---|
| Positive | Happy-path scenarios where the feature works as expected |
| Negative / Exception | Validation failures, error handling, and invalid inputs |
| Edge Cases | Boundary conditions and unusual combinations |
| Sanity | Lightweight checks to confirm basic feature readiness |

**Using test data in scenarios**

The Pre-conditions (Given) and Steps (When) columns frequently reference **test data sets** from [[lld-test-data]] with specific overrides. For example:

> **Given:** Pre-conditions - A "Standard Savings Account" (with customer category = "Premium")
> **When:** Steps - Interest calculation is triggered
> **Then:** Interest amount is calculated using the premium rate

This approach keeps scenarios concise while maintaining traceability to the underlying data.

**Priority levels**

| Priority | Meaning |
|---|---|
| L1 | Critical — must pass before any release |
| L2 | Important — should pass for a complete release |
| L3 | Nice to have — covers edge cases and rare paths |

**Coverage goal**

Aim to capture **all, if not most,** business scenarios — both positive and negative. Comprehensive scenario coverage here directly translates to comprehensive test coverage in the implementation.

## Filling in the template

### Positive / Negative / Edge Case Tests

All three sub-tables share the same structure. One row per scenario.

| Column | Description |
|---|---|
| Scenario Name | A descriptive name for the test scenario (e.g., "Create Party with all attributes", "Duplicate Party number") |
| Service / Unit | Which service this scenario tests — references a service name from [[lld-services]]. Scenarios test services, not individual LPUs |
| Priority | Testing priority: `L1` (critical — must pass), `L2` (important — should pass), `L3` (nice to have — edge cases and rare paths) |
| Preconditions | Initial state required before the test — often references test data sets from [[lld-test-data]] with specific overrides |
| Steps | The actions performed during the test, in numbered steps |
| Expected Result | The expected outcome — what should happen if the feature works correctly, or the expected error for negative tests (include error codes for traceability) |
| Reference Models | Data models involved in this scenario — for traceability back to [[lld-data-models]] |

### Sanity Scenarios

Lightweight end-to-end checks to confirm basic feature readiness.

| Column | Description |
|---|---|
| Scenario Name | A descriptive name for the sanity check |
| Steps | Lightweight steps to confirm basic feature readiness |
| Assertions | What to verify — quick pass/fail checks |

## Tips

- Cover every service with at least **one positive and one negative** scenario
- Use **L1/L2/L3 priority** consistently — L1 for business-critical paths, L2 for important variations, L3 for edge cases
- Reference **test data sets by name** from [[lld-test-data]] rather than inlining sample data in the scenario
- Write steps in **Given/When/Then** style — this maps directly to Cucumber step definitions
- Include **error codes** in expected results for negative scenarios (e.g., "Should throw PARTY_NUMBER_ALREADY_EXISTS") for traceability to error definitions

---

## Template Structure

> [!abstract] Template: Test Scenarios
>
> **Positive Tests**
>
> | Scenario Name | Service / Unit | Priority | Preconditions | Steps | Expected Result | Reference Models |
> | ------------- | -------------- | ------------ | ------------- | ----- | --------------- | ---------------- |
> |               |                | L1 / L2 / L3 |               |       |                 |                  |
>
> **Negative Tests**
>
> | Scenario Name | Service / Unit | Priority | Preconditions | Steps | Expected Result | Reference Models |
> | ------------- | -------------- | ------------ | ------------- | ----- | --------------- | ---------------- |
> |               |                | L1 / L2 / L3 |               |       |                 |                  |
>
> **Edge Cases**
>
> | Scenario Name | Service / Unit | Priority | Preconditions | Steps | Expected Result | Reference Models |
> | ------------- | -------------- | ------------ | ------------- | ----- | --------------- | ---------------- |
> |               |                | L1 / L2 / L3 |               |       |                 |                  |
>
> **Sanity Scenarios**
>
> | Scenario Name | Steps | Assertions |
> | ------------- | ----- | ---------- |
> |               |       |            |
>
> *Full template: [[lld-template]]*

## Example: Party Management

> [!example]- Example: Test Scenarios
>
> **Positive Tests**
>
> | Scenario Name | Service / Unit | Priority | Preconditions | Steps | Expected Result | Reference Models |
> | ------------------------------------------- | -------------- | -------- | ------------- | ------------------------------------------------ | --------------------------------------------------------------- | ---------------- |
> | Create Party with all attributes            | partyCreation  |          |               | 1. Create a Party with all attributes            | 1. Returns Party with RESPONSE as 200 OK with partyId generated |                  |
> | Create Party with only mandatory attributes | partyCreation  |          |               | 1. Create a Party with only mandatory attributes | 1. Returns Party with RESPONSE as 200 OK with partyId generated |                  |
>
> **Negative Tests**
>
> | Scenario Name | Service / Unit | Priority | Preconditions | Steps | Expected Result | Reference Models |
> | --------------------------------------------- | -------------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
> | Duplicate Party number                        | partyCreation  |          |  1. Create a Party with party number 123             | 1. Create another Party with party Number 123, it should fail with PARTY_NUMBER_ALREADY_EXISTS | 1. Should throw validation error PARTY_NUMBER_ALREADY_EXISTS |                  |
> | Create Party with missing party number        | partyCreation  |          |               | 1. Create a Party with empty party number | 1. Should throw openapi validation error |                  |
> | Create a party with dob greater than BOD date | partyCreation  |          |               | 1. Create a Party with business date greater than BOD | 1. Should throw validation error bodOrDateOfIncorporation should not be greater than Bod date |                  |
>
> *Full example: [[sample-lld]]*

---

## Related

- [[lld-test-data]] — Previous section: reusable test payloads
- [[lld-structure-overview]] — Overview of all LLD sections
