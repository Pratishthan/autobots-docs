# Workspace — Behind the Scenes

This note explains the technical flow that occurs when you [create a workspace](creating-a-workspace.md).

## Pipeline flow

1. **Clone** — The selected repository is cloned using your GitHub token
2. **Branch creation** — A feature branch is created, named after your Jira ticket (e.g., `feature/PROJ-1234` #todo)
3. **LLD changes** — As you work through the [LLD](../core-concepts/what-is-an-lld.md) sections, all generated content is committed to this branch
4. **Pull request** — When the LLD is finalised, a pull request is raised from the feature branch to the develop branch
5. Pipeline URL: #todo

## Identity

All Git operations (clone, commit, PR) are performed **under your GitHub identity** — not a shared service account. This means:
- Commits show your name and email
- The PR is authored by you
- Access controls are respected based on your permissions

## Infrastructure

- The pipeline runs on **Jenkins**
- The repository is hosted on a GitHub under **GHCP-Finacle** org
- Workspace directory is created on **Jenkins** server

## Related

- [What Is A Workspace](../core-concepts/what-is-a-workspace.md) — Conceptual overview
- [Prerequisites](../getting-started/prerequisites.md) — What access you need
