# What is a Workspace?

A workspace in Designer is the equivalent of a **feature branch** on your local machine — but managed entirely by Designer in the cloud.

## How it works

When you provide your [context](../workspaces/setting-context.md) (repository, Jira number, GitHub token), Designer triggers a Jenkins pipeline that:

1. **Clones** the repository you selected
2. **Creates a feature branch** named after your Jira ticket
3. Sets up an isolated environment where all your LLD changes will live

All changes — including the generated [LLD](what-is-an-lld.md) — are committed to this feature branch. When your LLD is complete, a **pull request** is raised from this branch to the develop branch.

## Why workspaces matter

- Your changes are **isolated** — they don't interfere with other developers' work
- Everything is **attributed to you** via your GitHub identity
- The workspace is **reproducible** — Designer can recreate it if needed

## Related

- [Creating A Workspace](../workspaces/creating-a-workspace.md) — How to create one
- [Viewing Editing Context](../workspaces/viewing-editing-context.md) — How to view or change your workspace context
- [Workspace Behind The Scenes](../workspaces/workspace-behind-the-scenes.md) — Technical details of what happens under the hood
