---
date: 2026-03-21
tags:
  - how-to
status: draft
---

# FAQ / Troubleshooting

## Getting Started

**Q: What do I need before I can use Designer?**
See [[prerequisites]] — you need a GitHub ID, a GitHub token with GCP Artifact Registry access, and your repository/Jira details.

**Q: I'm logging in for the first time and being asked for permissions. Is this expected?**
Yes. On first login, you need to grant the Designer application access to your GitHub account. See [[login-and-setup]].

## Workspaces

**Q: Can I work on multiple Jira tickets at the same time?**
Each workspace is tied to one Jira ticket. To switch, use [[viewing-editing-context|edit context]] to create a new workspace. Your previous workspace remains intact.

**Q: Workspace creation failed. What should I check?**
- Your GitHub token has write access to the repository
- The repository name is spelled correctly
- The Jenkins pipeline is reachable and running

## LLD

**Q: Do I have to fill out LLD sections in order?**
It's recommended — earlier sections (Background, Data Models) inform later ones. But you can go back and refine any section at any time.

**Q: Can I edit an LLD section after it's been generated?**
Yes. You can revisit any sub-agent to refine its output.

**Q: What data types are supported in Data Models?**
Both OpenAPI primitive types and platform-specific types (e.g., FPP DTO data types). The sub-agent guides you through the available options.

## General

**Q: What is the difference between Designer and Nurture?**
[[what-is-designer|Designer]] helps create Low-Level Design documents. [[what-is-nurture|Nurture]] handles downstream activities after the LLD is complete.

---

> This FAQ will grow as common questions are identified. If your question isn't here, reach out to the team.
