# Creating a Workspace

Once you have [set your context](setting-context.md), Designer will suggest you proceed with workspace creation.

## Steps

1. Confirm the context details (repository, Jira number, GitHub token)
2. Designer triggers the workspace creation
3. Wait for the process to complete — this takes a moment

## How to create workspace

### After setting context

After setting the context the first time, agent will prompt you to create the workspace.

![workspace-post-context.png](../images/workspace-post-context.png)

### Using the Workspace Tool

1. Use the `Tools` icon at the bottom on the `message` box
2. Pick the `Create Workspace` tool

![workspace-with-tool.png](../images/workspace-with-tool.png)

## What happens behind the scenes

When you create a workspace, Designer triggers a **Jenkins pipeline** that:

1. Clones the selected repository
2. Creates a feature branch based on your Jira number
3. Sets up the branch for your changes

For more technical detail, see [Workspace Behind The Scenes](workspace-behind-the-scenes.md).

## After creation

Once the workspace is ready, you can begin [building your LLD](../building-an-lld/lld-structure-overview.md) by working through each section with the [sub-agents](../reference/lld-sub-agents-overview.md).

## Troubleshooting

If workspace creation fails, check:
- Your GitHub token has write access to the repository
- The repository name is correct
- The Jenkins pipeline is reachable

See [Faq](../faq.md) for common issues.
