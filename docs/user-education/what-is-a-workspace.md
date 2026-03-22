---
date: 2026-03-21
tags:
  - overview
status: final
---

# What is a Workspace?

A workspace in Designer is the equivalent of a **feature branch** on your local machine — but managed entirely by Designer in the cloud.

## How it works

When you provide your [[setting-context|context]] (repository, Jira number, GitHub token), Designer triggers a Jenkins pipeline that:

1. **Clones** the repository you selected
2. **Creates a feature branch** named after your Jira ticket
3. Sets up an isolated environment where all your LLD changes will live

All changes — including the generated [[what-is-an-lld|LLD]] — are committed to this feature branch. When your LLD is complete, a **pull request** is raised from this branch to the develop branch.

## Why workspaces matter

- Your changes are **isolated** — they don't interfere with other developers' work
- Everything is **attributed to you** via your GitHub identity
- The workspace is **reproducible** — Designer can recreate it if needed

## Related

- [[creating-a-workspace]] — How to create one
- [[viewing-editing-context]] — How to view or change your workspace context
- [[workspace-behind-the-scenes]] — Technical details of what happens under the hood
