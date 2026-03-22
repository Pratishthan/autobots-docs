# What is a Low-Level Design (LLD)?

A Low-Level Design document captures all the details needed to implement a feature — from data models to business logic to test scenarios. It serves as the bridge between requirements and the corresponding code and test code.

## Why use an LLD?

- **Structured detail capture** — Ensures nothing is missed before coding begins
- **Code-ready format** — The predefined structure makes it straightforward for agents (and/or developers) to generate code from it
- **Consistency** — Every feature follows the same template, making reviews and onboarding easier

## LLD Sections

An LLD is composed of the following sections. See [Lld Structure Overview](../building-an-lld/lld-structure-overview.md) for a summary of all sections and how they relate.

| Section | What it captures |
|---|---|
| [Lld Background](../building-an-lld/lld-background.md) | Functional requirements and feature context |
| [Lld Data Models](../building-an-lld/lld-data-models.md) | Tables, entities, DTOs, message structures |
| [Lld Services](../building-an-lld/lld-services.md) | Service classes, inputs, outputs, exposure methods |
| [Lld Logical Processing Units](../building-an-lld/lld-logical-processing-units.md) | Business logic broken into reusable processing steps |
| [Lld Test Data](../building-an-lld/lld-test-data.md) | Reusable payloads and data structures for testing |
| [Lld Test Scenarios](../building-an-lld/lld-test-scenarios.md) | Positive and negative scenarios in Given/When/Then format |

## How Designer helps

Rather than writing the LLD manually, [Designer](../getting-started/what-is-designer.md) App provides specialised [sub-agents](../reference/lld-sub-agents-overview.md) for each section. You have a guided conversation, and the sub-agent produces the structured output.
