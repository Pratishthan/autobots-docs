---
date: 2026-03-21
tags:
  - overview
status: final
---

# What is Designer?

Designer is a conversational, UI-assisted tool that helps product owners, QA leads, and tech leads create [[what-is-an-lld|Low-Level Design (LLD)]] documents through guided conversations.

## How it works

Instead of manually writing an LLD from scratch, you have a structured conversation with an agent `Designer`. Behind the scenes, a series of specialised [[lld-sub-agents-overview|sub-agents]] guide you through each section of the LLD — capturing requirements, data models, services, behaviours, test data, and test scenarios.

## Key capabilities

- **Guided LLD creation** — Walk through each LLD section with a specialised sub-agent
- **Workspace management** — Designer creates a [[what-is-a-workspace|workspace]] (feature branch) for your changes automatically
- **Code-ready output** — The LLD structure is designed so that code generation from it becomes straightforward

## What you need to get started

See [[prerequisites]] and [[login-and-setup]] to begin.

## How Designer fits into the workflow

See [[designer-flow-diagram]] for the end-to-end flow.
