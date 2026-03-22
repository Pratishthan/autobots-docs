---
date: 2026-03-21
tags:
  - how-to
status: final
---

# Setting Context

Before Designer can create a [[what-is-a-workspace|workspace]], it needs to know what you're working on. This is called **setting context**. You will do this using the **[[setting-context#Context Tool]]**

## Required Details

| **Field**    | **Description**                      | **Example**               |
| ------------ | ------------------------------------ | ------------------------- |
| Repository   | The Git repository for your feature  | `fbp-core-settlement`     |
| Jira number  | The ticket associated with this work | `MER-1234`                |
| User name    | *Auto-populated* from Login          | `pralhad-2801541_infosys` |
| GitHub Token | Token for access                     | `ghp_******`              |
## Context Tool

### Accessing the Panel

Click the `settings` icon at the bottom on the `message` box
![[settings-gear-icon.png]]
### Settings Panel

This panel pops up, allowing you to set the [[setting-context#Required Details]]

![[context-panel.png]]

## How it works

1. After [[login-and-setup|logging in]], Designer prompts you to provide context
2. Enter the repository name and Jira number
3. Designer validates the details and prepares for [[creating-a-workspace|workspace creation]]

## Changing context later

If you need to switch to a different Jira ticket or repository, see [[viewing-editing-context]].
