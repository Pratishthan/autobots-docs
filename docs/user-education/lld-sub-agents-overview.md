---
date: 2026-03-21
tags:
  - overview
  - how-to
status: final
---

# LLD Sub-Agents Overview

Designer App uses a set of **LLD sub-agents** — specialised conversational agents — to guide you through each section of the [[what-is-an-lld|LLD]]. All sub-agents share the same structural pattern but differ in what they capture and produce.

To understand sub-agents, first see [[what-is-an-agent|What is an Agent?]]

## How sub-agents work

1. You select (or are guided to) a sub-agent that specialises in an LLD section
2. The sub-agent starts a **focused conversation** with you to capture data for that section 
3. It asks targeted questions to extract the required details
4. It produces **structured output** matching the LLD schema for that section

You provide information in plain English — the sub-agent handles structuring and formatting.

## Available sub-agents

| Sub-Agent            | LLD Section                      | What it captures                                               |
| -------------------- | -------------------------------- | -------------------------------------------------------------- |
| Background Agent     | [[lld-background]]               | Functional requirements, business context, reference documents |
| Data Models Agent    | [[lld-data-models]]              | Entities, DTOs, messages — attributes, types, constraints      |
| Services Agent       | [[lld-services]]                 | Service definitions, inputs/outputs, exposure methods          |
| Flow Agent           | [[lld-flows]]                    | Defines sequence in which LPUs executewithin a service.        |
| Behaviours Agent     | [[lld-logical-processing-units]] | Atomic business operations with step-by-step processing logic  |
| Test Data Agent      | [[lld-test-data]]                | Reusable test payloads with business-meaningful sample values  |
| Test Scenarios Agent | [[lld-test-scenarios]]           | Given/When/Then scenarios for positive and negative paths      |

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
