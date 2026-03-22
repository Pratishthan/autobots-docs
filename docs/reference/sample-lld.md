# Low-Level Design — Party Management

| Field         | Value            |
| ------------- | ---------------- |
| Ticket        | {JIRA-ID}        |
| Author        | {Author Name}    |
| Reviewers     | {Reviewer Names} |
| Status        | Draft            |
| Version       | 1.0              |
| Last Updated  | {YYYY-MM-DD}     |
| Repository    | {repo-name}      |
| Domain / Tech | Java             |

> Template guidance: [lld-template.md](lld-template.md)

---

# 1. Background & Scope

## 1.1 Purpose

The Party Management System provides a flexible, metadata-driven framework for managing parties (individuals and organizations) and their relationships with domain entities across banking products.

## 1.2 Functional Overview

{High-level functional summary — what the feature does from an end-user or system perspective.}

## 1.3 In Scope

- Party creation with mandatory and optional attributes
- Party modification by ID
- Party fetch by ID
- Contact details and profile attributes management

## 1.4 Out of Scope

- {Item 1}

## 1.5 Assumptions

For current release following are the limitations:

1. {Assumptions to be listed}

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

## 2.1 Party

### Properties

| Property             | Value  |
| -------------------- | ------ |
| Model Type           | Hybrid |
| Is New Model         | True   |
| Parent Model         | None   |
| Primary Key Strategy | {TBD}  |

### Structure — Schema

| Column Name              | Data Type                        | Mandatory [Y/N] | Default Value | Description                           |
| ------------------------ | -------------------------------- | --------------- | ------------- | ------------------------------------- |
| partyNumber              | String                           | Y               |               | Business-assigned party number        |
| partyName                | String                           | Y               |               | Full legal name                       |
| shortName                | String                           | N               |               | Display name                          |
| partyTypeCode            | String                           | Y               |               | Structural classification (immutable) |
| cifId                    | String                           | N               |               | Customer Information File reference   |
| modeOfAddressing         | String                           | N               |               |                                       |
| dobOrDateOfIncorporation | BusinessDateDTO                  | N               |               | Date of birth or incorporation        |
| contactDetails           | ContactDetails                   | N               |               | Contact information for the party     |
| profileAttributes        | List `<PartyProfileAttribute>` | N               |               | Profile Attribute Data for the party  |

### Structure — Business Metadata

| Column Name              | Business Name                | Business Key [Y/N] | Validations    |
| ------------------------ | ---------------------------- | ------------------ | -------------- |
| partyNumber              | Party Number                 | Y                  | maxLength: 50  |
| partyName                | Party Name                   | N                  | maxLength: 255 |
| shortName                | Short Name                   | N                  | maxLength: 50  |
| partyTypeCode            | Party Type                   | N                  | PartyTypeCode  |
| cifId                    | CIF ID                       | N                  | maxLength: 50  |
| modeOfAddressing         | Mode Of Addressing           | N                  | maxLength: 50  |
| dobOrDateOfIncorporation | Dob Or Date Of Incorporation | N                  |                |
| contactDetails           | Contact Details              | N                  |                |
| profileAttributes        | Profile Attributes           | N                  |                |

### Domain Extensions — Java

| Property           | Value |
| ------------------ | ----- |
| ID Generator Type  | {TBD} |
| Skip Add ID Column | {TBD} |

### Domain Extensions — Node-RED

| Mixin Name | Properties |
| ---------- | ---------- |
|            |            |

### Domain Extensions — Python

| Property | Value |
| -------- | ----- |
|          |       |

## 2.2 ContactDetails

### Properties

| Property             | Value |
| -------------------- | ----- |
| Model Type           | DTO   |
| Is New Model         | True  |
| Parent Model         | None  |
| Primary Key Strategy | N/A   |

### Structure — Schema

| Column Name  | Data Type | Mandatory [Y/N] | Default Value | Description           |
| ------------ | --------- | --------------- | ------------- | --------------------- |
| phoneNumber  | String    | N               |               | Primary phone number  |
| mobileNumber | String    | N               |               | Mobile phone number   |
| emailAddress | String    | N               |               | Email contact address |

### Structure — Business Metadata

| Column Name  | Business Name | Business Key [Y/N] | Validations                   |
| ------------ | ------------- | ------------------ | ----------------------------- |
| phoneNumber  | Phone Number  | N                  | maxLength: 20                 |
| mobileNumber | Mobile Number | N                  | maxLength: 20                 |
| emailAddress | Email Address | N                  | maxLength: 255, format: email |

### Domain Extensions — Java

| Property           | Value |
| ------------------ | ----- |
| ID Generator Type  | {TBD} |
| Skip Add ID Column | {TBD} |

### Domain Extensions — Node-RED

| Mixin Name | Properties |
| ---------- | ---------- |
|            |            |

### Domain Extensions — Python

| Property | Value |
| -------- | ----- |
|          |       |

## 2.3 PartyProfileAttribute

### Properties

| Property             | Value  |
| -------------------- | ------ |
| Model Type           | Hybrid |
| Is New Model         | True   |
| Parent Model         | None   |
| Primary Key Strategy | {TBD}  |

### Structure — Schema

| Column Name          | Data Type | Mandatory [Y/N] | Default Value | Description                   |
| -------------------- | --------- | --------------- | ------------- | ----------------------------- |
| profileAttributeName | String    | N               |               | Name of the profile attribute |
| data                 | Object    | N               |               | Profile attribute data object |

### Structure — Business Metadata

| Column Name          | Business Name          | Business Key [Y/N] | Validations |
| -------------------- | ---------------------- | ------------------ | ----------- |
| profileAttributeName | Profile Attribute Name | N                  |             |
| data                 | Data                   | N                  |             |

### Domain Extensions — Java

| Property           | Value |
| ------------------ | ----- |
| ID Generator Type  | {TBD} |
| Skip Add ID Column | {TBD} |

### Domain Extensions — Node-RED

| Mixin Name | Properties |
| ---------- | ---------- |
|            |            |

### Domain Extensions — Python

| Property | Value |
| -------- | ----- |
|          |       |

# 3. Enumerations

| Enum Name     | Data Type | Values                   | Description                                            |
| ------------- | --------- | ------------------------ | ------------------------------------------------------ |
| PartyTypeCode | String    | INDIVIDUAL, ORGANIZATION | Party type classification (individual or organization) |

---

# 4. Service Definitions

### Service Identity

| Service Name      | Service Domain | Operation Type | Description                                                                                                                                                               |
| ----------------- | -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| partyCreation     | {TBD}          | CREATE         | Creates a new party record with mandatory type and optional sections including contact details and profile attributes. Returns the created party with system-generated ID |
| partyModification | {TBD}          | UPDATE BY ID   | Updates an existing party record by ID. Replaces core fields and profile attributes with provided data. Returns the updated party details                                 |
| fetchPartyById    | {TBD}          | FETCH BY ID    | Retrieves complete party details including contact information and profile attributes for a specified party identifier                                                    |

### Service I/O

| Service Name      | Invocation Type | Parameters      | Input Model | Output Model |
| ----------------- | --------------- | --------------- | ----------- | ------------ |
| partyCreation     | Sync / Async    |                 | Party       | Party        |
| partyModification | Sync            | path → partyId | Party       | Party        |
| fetchPartyById    | Sync            | path → partyId |             | Party        |

### Domain Extensions — Java

| Service Name      | Enable Audit | Engine         |
| ----------------- | ------------ | -------------- |
| partyCreation     | {Y / N}      | Compose Engine |
| partyModification | {Y / N}      | Compose Engine |
| fetchPartyById    | {Y / N}      | Compose Engine |

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

| Service Name  | Direction | Queue / Topic | Message Model | Condition                 |
| ------------- | --------- | ------------- | ------------- | ------------------------- |
| partyCreation | Outbound  |               |               | Event Code: PARTY_CREATED |

#### Domain Extensions — Async — Java

**Event Mappings**

| Source | Target | Transformation | Description |
| ------ | ------ | -------------- | ----------- |
|        |        |                |             |

#### Domain Extensions — Async — Node-RED

_(Domain-specific extensions for async services.)_

#### Domain Extensions — Async — Python

_(Domain-specific extensions for async services.)_

---

# 5. Logical Processing Units

_(Core business logic units. Can represent behaviours, processing nodes, service methods, handlers — whatever the domain calls them.)_

| Unit Name                        | Type         | Sub-Type    | Config Properties | Input                            | Output      | Referenced Data | Business Logic                                                                                                                                                                   |
| -------------------------------- | ------------ | ----------- | ----------------- | -------------------------------- | ----------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| validateParty                    | LLM Assisted | Validation  |                   | PartyDTO                         |             |                 | 1. Validate whether partyNumber already exists using findByPartyNumberAndOrgCode from database 2. If already exists throw an error with Error Code "PARTY_NUMBER_ALREADY_EXISTS" |
| partyProfileAttributeDataPersist | Standard     | Persistence |                   | PartyProfileAttributeDTO         |             |                 | Standard persistence behaviour for PartyProfileAttribute entities                                                                                                                |
| partyPersist                     | Standard     | Persistence |                   | PartyDTO                         |             |                 | Standard persistence behaviour for Party entities                                                                                                                                |
| fetchPartyById                   | LLM Assisted | Processing  |                   | partyId                          | PartyEntity |                 | 1. Get partyId from requestParamsMap 2. Find party by id from database and populate the response in PartyEntity 3. If no records exist in DB throw NO_RECORDS_FOUND error        |
| modifyParty                      | LLM Assisted | Processing  |                   | PartyEntity, ExistingPartyEntity | PartyEntity |                 | 1. For each field in existingPartyEntity set it with corresponding field in the PartyEntity 2. Preserve system fields from existing entity                                       |

### Domain Extensions — Java (Behaviours)

_(Domain-specific extensions for LPUs)_

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

| Model Name | Method Name                 | Query / Filter Logic                                     | Parameters          | Return Type |
| ---------- | --------------------------- | -------------------------------------------------------- | ------------------- | ----------- |
| Party      | findByPartyNumberAndOrgCode |                                                          |                     | Single      |
| Party      | findByRandomQuery           | select * from tablename where randomQuery=":randomQuery" | randomQuery: String | List        |

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

| Boundary Name | Scope / Operations Covered | Rollback Strategy |
| ------------- | -------------------------- | ----------------- |
|               |                            |                   |

### Domain Extensions — Node-RED

_(Domain-specific extensions for flow & state.)_

### Domain Extensions — Python

_(Domain-specific extensions for flow & state.)_

---

# 9. Error Definitions

_(Registry of new error codes introduced by this feature. Error handling logic is captured in each processing unit's business logic.)_

| Error Code                   | Error Message                | Severity | Trigger Condition                 | Description  |
| ---------------------------- | ---------------------------- | -------- | --------------------------------- | ------------ |
| PARTY_NUMBER_ALREADY_EXISTS  | PARTY_NUMBER_ALREADY_EXISTS  |          | Duplicate partyNumber on creation | Party Number |
| PARTY_WITH_ID_DOES_NOT_EXIST | PARTY_WITH_ID_DOES_NOT_EXIST |          | Party not found for given partyId | Party Id     |

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

| Data Set Name | Model / Entity | Purpose | Sample Data | Notes |
| ------------- | -------------- | ------- | ----------- | ----- |
|               |                |         |             |       |

---

## 11.1 Positive Tests

| Scenario Name                               | Service / Unit | Priority | Preconditions | Steps                                            | Expected Result                                                 | Reference Models |
| ------------------------------------------- | -------------- | -------- | ------------- | ------------------------------------------------ | --------------------------------------------------------------- | ---------------- |
| Create Party with all attributes            | partyCreation  |          |               | 1. Create a Party with all attributes            | 1. Returns Party with RESPONSE as 200 OK with partyId generated |                  |
| Create Party with only mandatory attributes | partyCreation  |          |               | 1. Create a Party with only mandatory attributes | 1. Returns Party with RESPONSE as 200 OK with partyId generated |                  |

## 11.2 Negative Tests

| Scenario Name                                 | Service / Unit | Priority | Preconditions | Steps                                                                                                                                  | Expected Result                                                                               | Reference Models |
| --------------------------------------------- | -------------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Duplicate Party number                        | partyCreation  |          |               | 1. Create a Party with party number 123 2. Create another Party with party Number 123, it should fail with PARTY_NUMBER_ALREADY_EXISTS | 1. Should throw validation error PARTY_NUMBER_ALREADY_EXISTS                                  |                  |
| Create Party with missing party number        | partyCreation  |          |               | 1. Create a Party with empty party number                                                                                              | 1. Should throw openapi validation error                                                      |                  |
| Create a party with dob greater than BOD date | partyCreation  |          |               | 1. Create a Party with business date greater than BOD                                                                                  | 1. Should throw validation error bodOrDateOfIncorporation should not be greater than Bod date |                  |

## 11.3 Edge Cases

| Scenario Name | Service / Unit | Priority | Preconditions | Steps | Expected Result | Reference Models |
| ------------- | -------------- | -------- | ------------- | ----- | --------------- | ---------------- |
|               |                |          |               |       |                 |                  |

## 11.4 Sanity Scenarios

| Scenario Name | Steps | Assertions |
| ------------- | ----- | ---------- |
|               |       |            |

---

# 12. Domain Extension Sections

_(Introduce domain-specific sections that don't fit the core structure above. Delete or add blocks as needed.)_

---

# 13. Revision History

| Version | Date | Author | Changes       |
| ------- | ---- | ------ | ------------- |
| 1.0     |      |        | Initial draft |
