---
name: create-pr
description: Creates a draft GitHub pull request with a generated or templated description for the current feature branch. Use when creating a pull request, submitting changes for review, opening a PR, or when the user asks to create a PR or pull request.
---

# Create PR

Interactive workflow to generate a PR description and optionally create a Pull Request via GitHub MCP.

## Prerequisites

- Git repository
- On a feature branch (not master)
- Master branch fully updated
- GitHub MCP (optional): for automatic PR creation; falls back to manual if unavailable

## Repository Information

- **Repository**: https://github.com/badcoup/badcozoneclient
- **Target Branch**: `master`

## PR Title Format

All PRs are created as **drafts** with the `[WIP]` prefix.

```
[WIP] - {ticket_ref} - {ticket_title}
```

### Title Extraction from Branch Name

```
Branch: feature/B2BP-349_remove-commitlint
         ↓
Ticket:  B2BP-349
Title:   Remove commitlint
         ↓
PR Title: [WIP] - B2BP-349 - Remove commitlint
```

Inference rules:

1. Extract ticket reference: Match pattern `{PROJECT}-{NUMBER}` (e.g., `B2BP-349`)
2. Extract title slug: Text after the `_` in the branch name
3. Transform slug to title: Replace dashes with spaces, capitalize first letter

The user is always asked to **confirm or refine** the suggested title before PR creation.

## PR Description

When generating: see `create-pr-description` skill for the full template and section inclusion criteria.

When skipping description generation, use this full template as placeholder:

```markdown
## ℹ️ What's this PR do?

-

## 👀 Where should the reviewer start?

-

## 📱 How should this be tested?

### Unit tests

- Happy path
- Corner cases

### E2E tests

- Happy path
- Corner cases

### Devices

- Check feature in Desktop Chrome
- Check feature in Desktop Safari
- Check feature in Tablet Chrome
- Check feature in Tablet Safari
- Check feature in Mobile Android
- Check feature in Mobile IOS - Chrome
- Check feature in Mobile IOS - Safari

### Multi-currency

- Check multi-currency

### Multi-timezone

- Check multi-timezone

### Authorization

- Roles with permissions
- Roles without permissions

## 📸 Screenshots (if appropriate)
```

## Implementation Steps

### Step 1: Validate Current Branch

```
CHECK: Is current branch "master"?
  - YES → EXIT with error: "You must be on a feature branch, not master"
  - NO → CONTINUE
STORE current branch as {feature_branch}
```

### Step 2: Fetch Latest Master

```
RUN: git fetch origin master
INFORM: "Fetching latest master..."
```

### Step 3: Ask About Description

```
INFORM: "This will create a Draft PR for your changes."
ASK: "Would you like me to generate a description based on your changes? (yes/no)"
  - YES → STORE {generate_description} = true
  - NO → STORE {generate_description} = false
```

### Step 4: Analyze Changes

```
RUN: git diff origin/master...HEAD --stat
RUN: git diff origin/master...HEAD --name-only
RUN: git log origin/master..HEAD --oneline
STORE changed files list
STORE commit messages
```

### Step 5: Generate or Use Template Description

```
IF {generate_description} = true:
  EXECUTE: create-pr-description skill
  STORE result as {pr_description}
ELSE:
  USE full template as {pr_description}
```

### Step 6: Check GitHub MCP Availability

```
CHECK: Is GitHub MCP available and authenticated?
  - YES → CONTINUE to Step 7a (Automatic PR Creation)
  - NO → CONTINUE to Step 7b (Manual PR Creation)
```

### Step 7a: Create PR via GitHub MCP

```
EXTRACT from {feature_branch}:
  - {ticket_ref}: Match pattern like "B2BP-123"
  - {title_slug}: Text after underscore
  - {suggested_title}: Transform slug → title case

COMPUTE {default_pr_title}: "[WIP] - {ticket_ref} - {suggested_title}"

DISPLAY: "Based on your branch, I suggest this PR title:"
DISPLAY: {default_pr_title}

ASK: "Would you like to use this title, or provide a different one?"
  - User confirms → USE {default_pr_title}
  - User provides alternative → USE user's title (ensure [WIP] prefix is kept)

ASK: "Ready to create the draft PR? (yes/no)"
  - YES →
    CREATE PR using GitHub MCP with:
      - owner: "badcoup"
      - repo: "badcozoneclient"
      - title: {pr_title}
      - body: {pr_description}
      - head: {feature_branch}
      - base: "master"
      - draft: true (ALWAYS create as draft)
    DISPLAY: PR URL (on its own line, clickable)
  - NO → DISPLAY: Title and description for manual use
```

### Step 7b: Provide for Manual Creation

```
COMPUTE {default_pr_title}: "[WIP] - {ticket_ref} - {suggested_title}"

DISPLAY: "GitHub MCP not available. Here's your PR title and description to copy:"
OUTPUT: "Title: {default_pr_title}"
OUTPUT: {pr_description}
PROVIDE: Link to create PR manually:
  https://github.com/badcoup/badcozoneclient/compare/master...{feature_branch}
REMIND: "Remember to create the PR as a Draft and use the [WIP] prefix in the title"
```

## Output Formatting Requirements

**CRITICAL**: Format URLs as clickable (on their own line):

✅ Correct:

```
PR Created: https://github.com/badcoup/badcozoneclient/pull/1234
```

❌ Incorrect:

```
PR #1234 created - [Link](https://github.com/badcoup/badcozoneclient/pull/1234)
```

## Error Handling

- **On master branch**: Exit with clear message to switch to feature branch
- **Fetch fails**: Display error (network issue or remote not available)
- **No commits on branch**: Warn that there are no changes to create a PR for
- **GitHub MCP not available**: Fall back to manual description output
- **GitHub MCP auth fails**: Fall back to manual description output
- **PR creation fails**: Display error and provide description for manual creation

## Related Skills

- `create-pr-description`: Generate PR description only
- `start-task`: Create Jira ticket and feature branch
