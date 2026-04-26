---
name: create-pr-description
description: Generates a PR description by analyzing branch changes, commits, and session context. Use when generating a pull request description, documenting branch changes, describing what a PR does, or when called internally by the create-pr skill.
---

# Create PR Description

Generates a PR description based on the diff between the current feature branch and master. Can be invoked standalone or called internally by the `create-pr` skill.

## Prerequisites

- Git repository
- On a feature branch (not master)

## PR Description Template

### Mandatory Sections (always included)

```markdown
## ℹ️ What's this PR do?

- Description of changes

## 👀 Where should the reviewer start?

- Key files or areas to review first

## 📸 Screenshots (if appropriate)

(Include if UI changes, otherwise note "N/A - No UI changes")
```

### Optional Sections (include only if relevant)

```markdown
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
```

### Section Inclusion Criteria

| Section        | Include when...                                         |
| -------------- | ------------------------------------------------------- |
| Unit tests     | Code logic changes that should have unit test coverage  |
| E2E tests      | Feature changes that require end-to-end testing         |
| Devices        | UI/visual changes that need cross-device testing        |
| Multi-currency | Changes affecting currency display or calculations      |
| Multi-timezone | Changes affecting dates, times, or timezone handling    |
| Authorization  | Changes to routes, guards, or permission-based features |

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

### Step 3: Analyze Changes

```
RUN: git diff origin/master...HEAD --stat
RUN: git diff origin/master...HEAD --name-only
RUN: git log origin/master..HEAD --oneline
STORE changed files list
STORE commit messages
```

### Step 4: Generate PR Description

Based on:

1. **Changed files**: Analyze file paths to determine feature areas
2. **Commit messages**: Extract intent and scope of changes
3. **Session context**: Use any prior conversation context about the task
4. **Code diff**: Understand the nature of changes (UI, logic, tests, etc.)

Generate a PR description with mandatory sections plus relevant optional sections.

### Step 5: Output Description

```
DISPLAY: "Here's the generated PR description:"
OUTPUT: {generated_description}
```

## Example

Input:

```
Branch: feature/B2BP-1234_add-export-button
Changed files:
  - src/app/modules/reports/components/export-button/...
  - src/app/modules/reports/services/export.service.ts
  - src/app/modules/reports/components/export-button/export-button.component.spec.ts
Commits:
  - feat: add export button to reports
  - test: add unit tests for export button
```

Output:

```markdown
## ℹ️ What's this PR do?

- Adds an export button to the reports module that allows users to download report data
- Implements the ExportService to handle data formatting and file generation
- Includes unit tests for the new component and service

## 👀 Where should the reviewer start?

- Start with `src/app/modules/reports/components/export-button/export-button.component.ts`
- Then review `src/app/modules/reports/services/export.service.ts`

## 📱 How should this be tested?

### Unit tests

- Happy path
- Corner cases

### Devices

- Check feature in Desktop Chrome
  ...

## 📸 Screenshots (if appropriate)

(Add screenshots of the export button in the UI)
```

## Error Handling

- **On master branch**: Exit with clear message to switch to feature branch
- **Fetch fails**: Display error (network issue or remote not available)
- **No commits on branch**: Warn that there are no changes to describe

## Related Skills

- `create-pr`: Full PR creation workflow (calls this skill internally)
- `start-task`: Create Jira ticket and feature branch
