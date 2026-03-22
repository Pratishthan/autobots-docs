# Low-Level Design Template

| Field         | Value                          |
| ------------- | ------------------------------ |
| Ticket        | {JIRA-ID}                      |
| Author        | {Author Name}                  |
| Reviewers     | {Reviewer Names}               |
| Status        | Draft / In Review / Approved   |
| Version       | 1.0                            |
| Last Updated  | {YYYY-MM-DD}                   |
| Repository    | {repo-name}                    |
| Domain / Tech | {Java / Node-RED / Python / …} |

> Template guidance: [lld-template.md](lld-template.md)

---

# 1. Background & Scope

## 1.1 Purpose

What problem does this feature solve? What business capability does it enable?

## 1.2 Functional Overview

High-level functional summary — what the feature does from an end-user or system perspective.

## 1.3 In Scope

- Item 1

## 1.4 Out of Scope

- Item 1

## 1.5 Assumptions

- Item 1

## 1.6 Dependencies

| Dependency | Type                             | Owner | Status | Notes |
| ---------- | -------------------------------- | ----- | ------ | ----- |
|            | Service / Library / Infra / Team |       |        |       |

## 1.7 References

| Ref # | Type                         | Link / Location |
| ----- | ---------------------------- | --------------- |
| 1     | HLD / Functional Spec / Epic |                 |

---

# 2. Data Models

_(Copy section 2.x for each model. For enhancements to existing models set **Is New Model: False**.)_

## 2.1 `Data Model Name`

### Properties

| Property             | Value                                    |
| -------------------- | ---------------------------------------- |
| Model Type           | {DTO / Entity / Hybrid / Embedded}       |
| Is New Model         | {True / False}                           |
| Parent Model         | {ParentModelName / None}                 |
| Primary Key Strategy | {Auto-increment / UUID / Composite / …} |

### Structure — Schema

| Column Name | Data Type | Mandatory [Y/N] | Default Value | Description |
| ----------- | --------- | --------------- | ------------- | ----------- |
|             |           |                 |               |             |

### Structure — Business Metadata

| Column Name | Business Name | Business Key [Y/N] | Validations |
| ----------- | ------------- | ------------------ | ----------- |
|             |               |                    |             |

### Domain Extensions — Java

| Property           | Value                                               |
| ------------------ | --------------------------------------------------- |
| ID Generator Type  | {timeBasedUUIDAllocator / dbSequenceAllocator / …} |
| Skip Add ID Column | {Yes / No}                                          |

### Domain Extensions — Node-RED

| Mixin Name | Properties |
| ---------- | ---------- |
|            |            |

### Domain Extensions — Python

| Property | Value |
| -------- | ----- |
|          |       |

# 3. Enumerations

| Enum Name | Data Type | Values | Description |
| --------- | --------- | ------ | ----------- |
|           |           |        |             |

---

# 4. Service Definitions

### Service Identity

| Service Name | Service Domain | Operation Type | Description |
| ------------ | -------------- | -------------- | ----------- |
|              |                |                |             |

### Service I/O

| Service Name | Invocation Type | Parameters | Input Model | Output Model |
| ------------ | --------------- | ---------- | ----------- | ------------ |
|              | Sync / Async    |            |             |              |

### Domain Extensions — Java

| Service Name | Enable Audit | Engine |
| ------------ | ------------ | ------ |
|              | {Y / N}      |        |

### Domain Extensions — Node-RED

_(Domain-specific extensions for service definitions.)_

| Property | Value |
| -------- | ----- |
|          |       |

### Domain Extensions — Python

_(Domain-specific extensions for service definitions.)_

| Property | Value |
| -------- | ----- |
|          |       |

### Async Properties

| Service Name | Direction          | Queue / Topic | Message Model | Condition |
| ------------ | ------------------ | ------------- | ------------- | --------- |
|              | Inbound / Outbound |               |               |           |

#### Domain Extensions — Async — Java

_(Domain-specific extensions for async services.)_

#### Domain Extensions — Async — Node-RED

_(Domain-specific extensions for async services.)_

#### Domain Extensions — Async — Python

_(Domain-specific extensions for async services.)_

---

# 5. Logical Processing Units

_(Core business logic units. Can represent behaviours, processing nodes, service methods, handlers — whatever the domain calls them.)_

| Unit Name | Type | Sub-Type | Input | Output | Referenced Data | Business Logic |
| --------- | ---- | -------- | ----- | ------ | --------------- | -------------- |
|           |      |          |       |        |                 |                |

**Type**: Manual / LLM Assisted / Standard

**Sub-Type**: Enrichment / Validation / Host Call / Processing / Persistence / SetDefaults / Transformation / Complete

### Domain Extensions — Java (Behaviours)

_(Domain-specific extensions for LPUs.)_


### Domain Extensions — Node-RED (Node Properties)

| LPU Name | Repository | Package | Behaviour File Name | Rendering Properties |
| -------- | ---------- | ------- | ------------------- | -------------------- |
|          |            |         |                     |                      |

### Domain Extensions — Python (Tool Definitions)

| Tool Name | Parameters | Return Type | State Access | Description |
| --------- | ---------- | ----------- | ------------ | ----------- |
|           |            |             |              |             |

---

# 6. External Calls

_(External system calls made by this feature — APIs, host calls, third-party services.)_

| Call Name | Target System | Protocol | Method / Operation | Input | Output | Timeout | Retry | Error Handling |
| --------- | ------------- | -------- | ------------------ | ----- | ------ | ------- | ----- | -------------- |
|           |               |          |                    |       |        |         |       |                |

### Domain Extensions — Java

_(Domain-specific extensions for external calls.)_

### Domain Extensions — Node-RED

_(Domain-specific extensions for external calls.)_

### Domain Extensions — Python

_(Domain-specific extensions for external calls.)_

---

# 7. Data Access

| Model Name | Method Name | Query / Filter Logic | Parameters | Return Type |
| ---------- | ----------- | -------------------- | ---------- | ----------- |
|            |             |                      |            |             |

### Domain Extensions — Java (Repository Queries)

_(Domain-specific extensions for data access.)_

### Domain Extensions — Node-RED

_(Domain-specific extensions for data access.)_

### Domain Extensions — Python

_(Domain-specific extensions for data access.)_

---

# 8. Flow & State

| State Name | Description | Transitions To | Trigger Condition |
| ---------- | ----------- | -------------- | ----------------- |
|            |             |                |                   |

### Domain Extensions — Java (Transactional Boundaries)

_(Domain-specific extensions for flow & state.)_


### Domain Extensions — Node-RED

_(Domain-specific extensions for flow & state.)_

### Domain Extensions — Python

_(Domain-specific extensions for flow & state.)_

---

# 9. Error Definitions

_(Registry of new error codes introduced by this feature. Error handling logic is captured in each processing unit's business logic.)_

| Error Code | Error Message | Severity | Trigger Condition | Description |
| ---------- | ------------- | -------- | ----------------- | ----------- |
|            |               |          |                   |             |

---

# 10. Configuration

_(New configuration introduced by this feature — environment variables, feature flags, tuning parameters.)_

| Config Key | Source | Default | Description | Sensitive |
| ---------- | ------ | ------- | ----------- | --------- |
|            |        |         |             |           |

**Source**: env / config file / database / vault / …

---

# 11. Test Scenarios

## 11.0 Test Data

| Data Set Name | Model / Entity | Purpose | Notes |
| ------------- | -------------- | ------- | ----- |
|               |                |         |       |
### 11.0.1 `Data Set Name`

_(Data Set Structure in Markdown table format for the Data set name)_


---

## 11.1 Positive Tests

| Scenario Name | Service / Unit | Priority     | Preconditions | Steps | Expected Result | Reference Models |
| ------------- | -------------- | ------------ | ------------- | ----- | --------------- | ---------------- |
|               |                | L1 / L2 / L3 |               |       |                 |                  |

## 11.2 Negative Tests

| Scenario Name | Service / Unit | Priority     | Preconditions | Steps | Expected Result | Reference Models |
| ------------- | -------------- | ------------ | ------------- | ----- | --------------- | ---------------- |
|               |                | L1 / L2 / L3 |               |       |                 |                  |

## 11.3 Edge Cases

| Scenario Name | Service / Unit | Priority     | Preconditions | Steps | Expected Result | Reference Models |
| ------------- | -------------- | ------------ | ------------- | ----- | --------------- | ---------------- |
|               |                | L1 / L2 / L3 |               |       |                 |                  |

## 11.4 Sanity Scenarios

| Scenario Name | Steps | Assertions |
| ------------- | ----- | ---------- |
|               |       |            |

---

# 12. Domain Extension Sections

_(Introduce domain-specific sections that don't fit the core structure above. Delete or add blocks as needed.)_

## 12.1 Component Breakdown — Node-RED

| Srl No. | From Repo | From Queue | To Repo | To Queue | Description |
| ------- | --------- | ---------- | ------- | -------- | ----------- |
|         |           |            |         |          |             |

## 12.2 Agent Configuration — Python / Dynagent

| Agent Name | Prompt File | Output Schema | Tools | Batch Enabled | Is Default |
| ---------- | ----------- | ------------- | ----- | ------------- | ---------- |
|            |             |               |       |               |            |

## 12.3 State Extensions — Python / Dynagent

| Field Name | Type | Description | Used By |
| ---------- | ---- | ----------- | ------- |
|            |      |             |         |

---

# 13. Revision History

| Version | Date | Author | Changes       |
| ------- | ---- | ------ | ------------- |
| 1.0     |      |        | Initial draft |
