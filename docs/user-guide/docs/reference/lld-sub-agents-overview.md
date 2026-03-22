# LLD Sub-Agents Overview

Designer App uses a set of **LLD sub-agents** — specialised conversational agents — to guide you through each section of the [LLD](../core-concepts/what-is-an-lld.md). All sub-agents share the same structural pattern but differ in what they capture and produce.

To understand sub-agents, first see [What is an Agent?](../core-concepts/what-is-an-agent.md)

## How sub-agents work

1. You select (or are guided to) a sub-agent that specialises in an LLD section
2. The sub-agent starts a **focused conversation** with you to capture data for that section
3. It asks targeted questions to extract the required details
4. It produces **structured output** matching the LLD schema for that section

You provide information in plain English — the sub-agent handles structuring and formatting.

## Available sub-agents

| Sub-Agent            | LLD Section                      | What it captures                                               |
| -------------------- | -------------------------------- | -------------------------------------------------------------- |
| Background Agent     | [Lld Background](../building-an-lld/lld-background.md)               | Functional requirements, business context, reference documents |
| Data Models Agent    | [Lld Data Models](../building-an-lld/lld-data-models.md)              | Entities, DTOs, messages — attributes, types, constraints      |
| Services Agent       | [Lld Services](../building-an-lld/lld-services.md)                 | Service definitions, inputs/outputs, exposure methods          |
| Flow Agent           | [Lld Flows](../building-an-lld/lld-flows.md)                    | Defines sequence in which LPUs executewithin a service.        |
| Behaviours Agent     | [Lld Logical Processing Units](../building-an-lld/lld-logical-processing-units.md) | Atomic business operations with step-by-step processing logic  |
| Test Data Agent      | [Lld Test Data](../building-an-lld/lld-test-data.md)                | Reusable test payloads with business-meaningful sample values  |
| Test Scenarios Agent | [Lld Test Scenarios](../building-an-lld/lld-test-scenarios.md)           | Given/When/Then scenarios for positive and negative paths      |

## Common pattern

Every sub-agent follows the same interaction pattern:

1. **Anchored** - to the provided background (except Background Agent)
2. **Context gathering** — The agent understands what you're building
3. **Guided capture** — Targeted questions to extract section-specific details
4. **Output generation** — Structured output conforming to the LLD schema
5. **Review & refine** — You can review and iterate on the output

## Tips

- Work through sections **in order** when possible — earlier sections (Background, Data Models) inform later ones (Services, Behaviours)
- You can always go back and refine a previous section
- The sub-agent has a strong understanding of the expected output structure — trust its prompts and provide the information it asks for
