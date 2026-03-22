---
date: 2026-03-21
tags:
  - overview
aliases:
  - LLD
  - Low Level Design
status: draft
---

# What is a Low-Level Design (LLD)?

A Low-Level Design document captures all the details needed to implement a feature — from data models to business logic to test scenarios. It serves as the bridge between requirements and the corresponding code and test code.

## Why use an LLD?

- **Structured detail capture** — Ensures nothing is missed before coding begins
- **Code-ready format** — The predefined structure makes it straightforward for agents (and/or developers) to generate code from it
- **Consistency** — Every feature follows the same template, making reviews and onboarding easier

## LLD Sections

An LLD is composed of the following sections. See [[lld-structure-overview]] for a summary of all sections and how they relate.

| Section | What it captures |
|---|---|
| [[lld-background]] | Functional requirements and feature context |
| [[lld-data-models]] | Tables, entities, DTOs, message structures |
| [[lld-services]] | Service classes, inputs, outputs, exposure methods |
| [[lld-logical-processing-units]] | Business logic broken into reusable processing steps |
| [[lld-test-data]] | Reusable payloads and data structures for testing |
| [[lld-test-scenarios]] | Positive and negative scenarios in Given/When/Then format |

## How Designer helps

Rather than writing the LLD manually, [[what-is-designer|Designer]] App provides specialised [[lld-sub-agents-overview|sub-agents]] for each section. You have a guided conversation, and the sub-agent produces the structured output.
