---
name: create-branch
description: Creates a feature or hotfix branch following the project's Jira-based naming conventions. Use when creating a branch, setting up a feature branch, starting work on a ticket, or when the user mentions creating a new git branch.
---

# Create Branch

Creates a feature branch from master following the project's branch naming conventions. Can be run standalone (interactive) or with all parameters pre-filled (when called from the start-task skill).

## Prerequisites

- Git repository
- Jira ticket reference (e.g., `B2BP-1234`)

## Branch Naming Convention

```
{prefix}/{ticket_ref}_{description}
```

| Ticket Type | Branch Prefix | Description                               |
| ----------- | ------------- | ----------------------------------------- |
| `infra`     | `feature/`    | Infrastructure, dependencies, config      |
| `docs`      | `feature/`    | Documentation (markdown, README)          |
| `feat`      | `feature/`    | Business feature                          |
| `fix`       | `hotfix/`     | Bug fix (runtime/compilation errors)      |
| `test`      | `feature/`    | Unit testing only                         |
| `uitest`    | `feature/`    | Playwright or Cypress                     |
| `devops`    | `feature/`    | Cloud/CI/CD (GitHub Actions, Jenkinsfile) |
| `style`     | `feature/`    | CSS/SCSS changes                          |

Only `fix` type uses `hotfix/` prefix. All other types use `feature/`.

## Implementation Steps

### Step 1: Check for Uncommitted Changes

```
RUN: git status --porcelain
CHECK: Are there uncommitted changes?
  - YES →
    INFORM: "You have uncommitted changes. They will be stashed and restored on the new branch."
    RUN: git stash push -m "create-branch: stashing changes"
    STORE {has_stash} = true
  - NO →
    STORE {has_stash} = false
```

### Step 2: Update Master Branch

```
RUN: git checkout master
RUN: git pull origin master
INFORM: "Master branch updated."
```

### Step 3: Gather Branch Information

**Note**: Either all 3 parameters are passed (from start-task skill), or none are passed and all are asked interactively.

```
CHECK: Were ALL parameters provided?
  - YES (from start-task) →
    USE {ticket_type}, {ticket_ref}, {ticket_title} as provided
    (ticket_title is already in kebab-case)
  - NO (standalone mode) →
    ASK: "What is the ticket type? (infra/docs/feat/fix/test/uitest/devops/style)"
    STORE response as {ticket_type}

    ASK: "What is the Jira ticket reference? (e.g., B2BP-1234)"
    STORE response as {ticket_ref}
    VALIDATE: Must match pattern like "ABC-123" or "ABCD-1234"

    ASK: "What is the ticket title? (will be converted to kebab-case)"
    STORE response as {ticket_title_raw}
    COMPUTE {ticket_title}: Convert to kebab-case (lowercase, spaces/underscores → dashes)

COMPUTE {prefix}:
  - IF {ticket_type} = "fix" → {prefix} = "hotfix"
  - ELSE → {prefix} = "feature"
```

### Step 4: Create Branch

```
COMPUTE {branch_name}: "{prefix}/{ticket_ref}_{ticket_title}"

DISPLAY: "Creating branch: {branch_name}"

RUN: git checkout -b {branch_name}
CHECK: Did branch creation succeed?
  - YES → CONTINUE
  - NO (branch exists) →
    ASK: "Branch already exists. Would you like to checkout the existing branch? (yes/no)"
      - YES → RUN: git checkout {branch_name}
      - NO → ASK for different ticket title and retry
```

### Step 5: Restore Stashed Changes

```
IF {has_stash} = true:
  RUN: git stash pop
  CHECK: Did stash pop succeed?
    - YES → INFORM: "Uncommitted changes restored."
    - NO (conflicts) →
      WARN: "There were conflicts restoring your changes. Please resolve them manually."
      INFORM: "Your changes are still in the stash. Use 'git stash show' to see them."
```

### Step 6: Display Success

```
DISPLAY: "✓ Branch created: {branch_name}"
DISPLAY: "✓ You are now on branch: {branch_name}"
IF {has_stash} = true:
  DISPLAY: "✓ Uncommitted changes restored"
```

## Example

Input: ticket type `infra`, ref `B2BP-1234`, title `Update NG Bootstrap to v15`

Output:

```
✓ Changes stashed
✓ Master branch updated
✓ Branch created: feature/B2BP-1234_update-ng-bootstrap-to-v15
✓ Uncommitted changes restored
```

## Error Handling

- **Checkout fails**: Stashes changes first, then retries
- **Pull fails**: Displays error and exits (suggests resolving conflicts)
- **Invalid ticket reference**: Asks user to provide valid format
- **Branch already exists**: Offers to checkout existing or create with different name
- **Stash pop conflicts**: Warns user and suggests manual resolution

**Critical**: Always ensure stashed changes are recovered, even if the command exits early or fails.

## Related Skills

- `start-task`: Creates Jira ticket AND feature branch (calls this skill internally)
- `create-pr`: Creates draft pull request for the current branch
