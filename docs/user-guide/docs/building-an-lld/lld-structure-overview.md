# LLD Structure Overview

A [Low-Level Design](../core-concepts/what-is-an-lld.md) document is composed of seven sections, each capturing a distinct aspect of the feature being built. Together, they provide everything needed to move from requirements to code.

## Section summary

| #   | Section                                                        | Purpose                                                                       |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | [Background](lld-background.md)                               | Capture the functional requirements and business context                      |
| 2   | [Data Models](lld-data-models.md)                              | Define the data structures — tables, entities, DTOs, messages                 |
| 3   | [Services](lld-services.md)                                    | Describe the service classes, their inputs/outputs, and how they are exposed  |
| 4   | [Flows](lld-flows.md)                                          | Stitch a set of [LPUs](lld-logical-processing-units.md) in a specific sequence |
| 5   | [Logical Processing Units](lld-logical-processing-units.md)    | Break business logic into reusable processing steps                           |
| 6   | [Test Data](lld-test-data.md)                                  | Create reusable payloads and data structures for testing                      |
| 7   | [Test Scenarios](lld-test-scenarios.md)                        | Define positive and negative test cases in Given/When/Then format             |

## How the sections connect

- **Background** provides the "what" and "why" that informs **all** other sections
- **Data Models** define the structures that **Services** and **LPUs** consume, produce or enrich
- **Services** stitch flows to implement business functionality
- **Flows** orchestrate **LPUs** to achieve outcomes used in **Services**
- **Logical Processing Units (LPUs)** are the atomic business operations, they consume, reference, create and enrich **Data Models**
- **Test Data** provides the payloads used in **Test Scenarios**
- **Test Scenarios** validate the **Services** end-to-end using **Test Data**

## Diagram

![LLD Structure Diagram](../images/lld-structure-diagram.png)

## How to fill out each section

Each section has a dedicated [sub-agent](../reference/lld-sub-agents-overview.md) that guides you through a conversation to capture the required details. See the individual section notes linked above for specifics on what data is captured and how to provide it.
