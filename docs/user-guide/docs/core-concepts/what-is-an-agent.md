# What is an Agent?

Before understanding [sub-agents](../reference/lld-sub-agents-overview.md), it helps to understand the anatomy of an Agent.

![agent-anatomy.png](../images/agent-anatomy.png)

## Anatomy

- A **model provider** acts as the LLM Agent
- The agent is provided with instructions on its role, context, and behaviour using a **system prompt**
- The agent is given access to **tools** which allow the LLM to trigger actions such as reading files, writing files, triggering pipelines, etc.
- Optionally, the agent is provided an **output schema** to define what is expected from it
- **Chat messages** from the user are fed from a chat UI to the model
- Every message, response, and tool call action is logged using **tracing**

## Multi-Agent Systems

An agent can exist on its own or be part of a larger system of agents. The multi-agent system can be created in 2 ways:

### **Supervisory Pattern**

Sub-agent is wrapped as a tool and made available to a coordinator agent. In such architecture, the coordinator agent will redirect work to one of the [sub-agents](../reference/lld-sub-agents-overview.md) and gets back control once the sub-agent has done its job.

### Agent Mesh Pattern

Each sub-agent is aware of the other [sub-agents](../reference/lld-sub-agents-overview.md) in the system and can independently handoff control based on its judgement of the user intent.

When an agent is composed into another agent in either of these ways, it becomes a [sub-agent](../reference/lld-sub-agents-overview.md).
