# LLD — Background

The Background section captures the **functional requirements** and **business context** for the feature being built. It sets the foundation for all other [LLD sections](lld-structure-overview.md).

## Key concepts

The Background section is structured into several sub-sections, each serving a distinct purpose:

| Sub-section | Purpose |
|---|---|
| Purpose | The business problem being solved — the "why" behind the feature |
| Functional Overview | A high-level summary of what the feature does from an end-user or system perspective |
| In Scope / Out of Scope | Clear boundaries — what this LLD covers and what it explicitly does not |
| Assumptions | Known constraints or limitations that influence the design |
| Dependencies | External services, libraries, teams, or infrastructure this feature depends on |
| References | Pointers to BRDs, HLDs, epics, or other source documents |

## Filling in the template

### Background Sub-sections

| Sub-section | Format | Description |
|---|---|---|
| Purpose (1.1) | Free-text | The business problem this feature solves and what business capability it enables. Focus on the "why", not the "how" |
| Functional Overview (1.2) | Free-text | A high-level summary of what the feature does from an end-user or system perspective. Keep it concise — the detail comes in later sections |
| In Scope (1.3) | Bullet list | The boundaries of this LLD — what will be designed and implemented |
| Out of Scope (1.4) | Bullet list | What is explicitly not covered — prevents scope creep and sets reviewer expectations |
| Assumptions (1.5) | Bullet list | Known constraints, limitations, or decisions taken without full information. May need revisiting as the design progresses |

### Dependencies (1.6)

One row per external dependency.

| Column | Description |
|---|---|
| Dependency | Name of the dependency (e.g., a service, library, or team) |
| Type | Classification: `Service`, `Library`, `Infra`, or `Team` |
| Owner | Who owns this dependency |
| Status | Current status of the dependency (e.g., Available, In Progress, Blocked) |
| Notes | Any additional context — version requirements, timeline risks, etc. |

### References (1.7)

One row per reference document.

| Column | Description |
|---|---|
| Ref # | A sequential reference number for easy citation elsewhere in the LLD |
| Type | The kind of document: `HLD`, `Functional Spec`, `Epic`, `BRD`, etc. |
| Link / Location | URL or file path to the document |

## Tips

- Be specific about the **business problem** being solved, not just the technical implementation
- Link to existing requirement documents (BRD, Confluence pages) rather than duplicating their content
- Mention any **constraints** or **assumptions** that will influence the design
- If this feature extends existing functionality, describe what already exists and what is changing

---

## Template Structure

!!! abstract "Template: Background & Scope"

    **1.1 Purpose**

    What problem does this feature solve? What business capability does it enable?

    **1.2 Functional Overview**

    High-level functional summary — what the feature does from an end-user or system perspective.

    **1.3 In Scope**

    - Item 1

    **1.4 Out of Scope**

    - Item 1

    **1.5 Assumptions**

    - Item 1

    **1.6 Dependencies**

    | Dependency | Type | Owner | Status | Notes |
    | ---------- | -------------------------------- | ----- | ------ | ----- |
    |            | Service / Library / Infra / Team |       |        |       |

    **1.7 References**

    | Ref # | Type | Link / Location |
    | ----- | ---------------------------- | --------------- |
    | 1     | HLD / Functional Spec / Epic |                 |

    *Full template: [Lld Template](../reference/lld-template.md)*

## Example: Party Management

??? example "Example: Background & Scope"

    **1.1 Purpose**

    The Party Management System provides a flexible, metadata-driven framework for managing parties (individuals and organizations) and their relationships with domain entities across banking products.

    **1.3 In Scope**

    - Party creation with mandatory and optional attributes
    - Party modification by ID
    - Party fetch by ID
    - Contact details and profile attributes management

    **1.5 Assumptions**

    For current release following are the limitations:

    1. {Assumptions to be listed}

    *Full example: [Sample Lld](../reference/sample-lld.md)*

---

## Related

- [Lld Structure Overview](lld-structure-overview.md) — Overview of all LLD sections
- [Lld Data Models](lld-data-models.md) — Next section: defining your data structures
