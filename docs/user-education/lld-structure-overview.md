---
date: 2026-03-21
tags:
  - overview
status: final
---

# LLD Structure Overview

A [[what-is-an-lld|Low-Level Design]] document is composed of six sections, each capturing a distinct aspect of the feature being built. Together, they provide everything needed to move from requirements to code.

## Section summary

| #   | Section                          | Purpose                                                                       |
| --- | -------------------------------- | ----------------------------------------------------------------------------- |
| 1   | [[lld-background]]               | Capture the functional requirements and business context                      |
| 2   | [[lld-data-models]]              | Define the data structures — tables, entities, DTOs, messages                 |
| 3   | [[lld-services]]                 | Describe the service classes, their inputs/outputs, and how they are exposed  |
| 4   | [[lld-flows]]                    | Stitch a set of [[lld-logical-processing-units\|lpus]] in a specific sequence |
| 5   | [[lld-logical-processing-units]] | Break business logic into reusable processing steps                           |
| 6   | [[lld-test-data]]                | Create reusable payloads and data structures for testing                      |
| 7   | [[lld-test-scenarios]]           | Define positive and negative test cases in Given/When/Then format             |

## How the sections connect

- **Background** provides the "what" and "why" that informs **all** other sections
- **Data Models** define the structures that **Services** and **LPUs** consume, produce or enrich
- **Services** stitch flows to implement business functionality
- **Flows** orchestrate **LPUs** to achieve outcomes used in **Services**
- **Logical Processing Units (LPUs)** are the atomic business operations, they consume, reference, create and enrich **Data Models**
- **Test Data** provides the payloads used in **Test Scenarios**
- **Test Scenarios** validate the **Services** end-to-end using **Test Data**

## Diagram

[[lld-structure-diagram]]

## How to fill out each section

Each section has a dedicated [[lld-sub-agents-overview|sub-agent]] that guides you through a conversation to capture the required details. See the individual section notes linked above for specifics on what data is captured and how to provide it.
