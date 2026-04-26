---
name: start-task
description: Starts a new development task by creating a Jira ticket and a feature branch. Use when starting a new task, beginning new work, creating a Jira ticket, or when the user wants to set up a ticket and branch for a new feature, bug fix, or infrastructure change.
---

# Start Task

Interactive workflow to create a Jira ticket and a feature branch. Handles uncommitted changes safely throughout.

## Prerequisites

- Git repository
- Atlassian MCP (optional but recommended): enables automatic Jira ticket creation; falls back to manual if unavailable

## What This Skill Does

1. Ensures master branch is up to date (checkout + pull)
2. Checks for Atlassian MCP availability
3. Gathers task information interactively
4. Creates a Jira ticket (automatically via MCP or guides manual creation)
5. Creates a feature branch with proper naming via the `create-branch` skill
6. Moves uncommitted changes to the new branch

## Uncommitted Changes

If uncommitted changes are present:

- They are temporarily stashed
- Master is updated
- New branch is created
- Changes are restored on the new branch

## Ticket Type Mapping

| Type   | Branch Prefix | Jira Issue Type | Description                               |
| ------ | ------------- | --------------- | ----------------------------------------- |
| infra  | feature/      | Task            | Infrastructure, dependencies, config      |
| docs   | feature/      | Task            | Documentation (markdown, README)          |
| feat   | feature/      | Story           | Business feature                          |
| fix    | hotfix/       | Bug             | Bug fix (runtime/compilation errors)      |
| test   | feature/      | Task            | Unit testing only                         |
| uitest | feature/      | Task            | Playwright or Cypress                     |
| devops | feature/      | Task            | Cloud/CI/CD (GitHub Actions, Jenkinsfile) |
| style  | feature/      | Task            | CSS/SCSS changes                          |

## Implementation Steps

### Step 1: Pre-flight Checks

```
RUN: git status --porcelain
IF uncommitted changes:
  RUN: git stash push -m "start-task: stashing changes"
  STORE {has_stash} = true
ELSE:
  STORE {has_stash} = false

RUN: git checkout master
RUN: git pull origin master
INFORM: "Master branch updated."
```

### Step 2: Check MCP Availability

```
CHECK: Is Atlassian MCP installed and authenticated?
  - YES → STORE {mcp_available} = true
  - NO → STORE {mcp_available} = false
```

### Step 3: Gather Task Information

**With MCP (Automatic)**:

```
ASK: "What is the Jira project space? (e.g., B2BP)"
STORE response as {project}

ASK: "What is the ticket type? (infra/docs/feat/fix/test/uitest/devops/style)"
STORE response as {ticket_type}

ASK: "What is the ticket title? (e.g., Update NG Bootstrap to v15)"
STORE response as {ticket_title}
```

**Without MCP (Manual fallback)**:

```
INFORM: "Atlassian MCP not available. Please create the ticket manually in Jira."
ASK: Same questions as above
ASK: "Please provide the ticket number after creating it in Jira (e.g., B2BP-1234)"
STORE response as {ticket_ref}
```

### Step 4: Create Jira Ticket

**With MCP**:

```
CREATE ticket via Atlassian MCP:
  - Project: {project}
  - Issue type: mapped from {ticket_type} (see Ticket Type Mapping)
  - Title: "[FE][{TICKET_TYPE_UPPER}] {ticket_title}"
STORE returned ticket ID as {ticket_ref}
DISPLAY: "Ticket created: {ticket_ref}"
DISPLAY: https://badcoup.atlassian.net/browse/{ticket_ref}
REMIND: "Manually add in Jira: Labels (b2b_platform), Component (Front), Parent epic, Description"
```

**Without MCP**:

```
USE {ticket_ref} from Step 3
```

### Step 5: Create Feature Branch

```
COMPUTE {ticket_title_kebab}: Convert {ticket_title} to kebab-case

EXECUTE: create-branch skill with parameters:
  - ticket_type: {ticket_type}
  - ticket_ref: {ticket_ref}
  - ticket_title: {ticket_title_kebab}
```

### Step 6: Restore Stashed Changes

```
IF {has_stash} = true:
  RUN: git stash pop
  IF conflicts:
    WARN: "There were conflicts restoring your changes. Please resolve them manually."
  ELSE:
    INFORM: "Uncommitted changes restored."
```

### Step 7: Display Success

```
DISPLAY: "✓ Master branch updated"
DISPLAY: "✓ Jira ticket created: {ticket_ref}"
DISPLAY: https://badcoup.atlassian.net/browse/{ticket_ref}
DISPLAY: "✓ Branch created: {branch_name}"
IF {has_stash}: DISPLAY: "✓ Uncommitted changes moved to new branch"
REMIND: "Open the ticket in Jira and add: Labels, Component, Parent epic, Description"
```

## Output Formatting Requirements

**CRITICAL**: The Jira ticket link MUST be on its own line so Cursor renders it as clickable:

✅ Correct:

```
Ticket: https://badcoup.atlassian.net/browse/B2BP-1234
```

❌ Incorrect:

```
Ticket: [FE][INFRA] Title (B2BP-1234) - https://badcoup.atlassian.net/browse/B2BP-1234
```

## Error Handling

- **Git checkout fails**: Stashes changes first, then retries
- **Git pull fails**: Displays error and exits (suggests resolving conflicts)
- **MCP not available**: Falls back to manual ticket creation
- **MCP auth fails**: Falls back to manual ticket creation (see Troubleshooting)
- **MCP ticket creation fails**: Falls back to manual ticket creation
- **Branch already exists**: Asks if user wants to checkout existing or create with different name
- **Stash pop conflicts**: Displays conflict message, suggests manual resolution

**Critical**: Always ensure stashed changes are recovered, even if the workflow exits early or fails.

## Troubleshooting

### MCP Authentication Error

If you see:

```
{"error":true,"message":"Authentication failed: {\"code\":401,\"message\":\"Unauthorized\"}"}
```

Solution: Toggle the Atlassian MCP off and on in Cursor Settings → MCP section. This refreshes the auth token.

## Related Skills

- `create-branch`: Create feature branch only (called internally by this skill)
- `create-pr`: Create draft pull request for the branch
