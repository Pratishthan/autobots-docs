# Setting Context

Before Designer can create a [workspace](../core-concepts/what-is-a-workspace.md), it needs to know what you're working on. This is called **setting context**. You will do this using the **[Setting Context#Context Tool](setting-context.md#context-tool)**

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
![settings-gear-icon.png](../images/settings-gear-icon.png)
### Settings Panel

This panel pops up, allowing you to set the [Setting Context#Required Details](setting-context.md#required-details)

![context-panel.png](../images/context-panel.png)

## How it works

1. After [logging in](../getting-started/login-and-setup.md), Designer prompts you to provide context
2. Enter the repository name and Jira number
3. Designer validates the details and prepares for [workspace creation](creating-a-workspace.md)

## Changing context later

If you need to switch to a different Jira ticket or repository, see [Viewing Editing Context](viewing-editing-context.md).
