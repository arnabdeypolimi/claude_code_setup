# Cascade MR Workflow

## Overview

Workflow for managing cascading merge requests where multiple tasks build on each other, each creating an MR that targets a common base branch.

## Workflow Definition

```yaml
name: cascade-mr
description: Manages cascading merge requests for multi-task implementations
trigger:
  - manual
  - "cascade workflow"
```

## Concept

```
base-branch (e.g., feat/feature-name)
├── task-1-branch → MR #1 → base-branch
│   └── task-2-branch → MR #2 → base-branch
│       └── task-3-branch → MR #3 → base-branch
│           └── task-4-branch → MR #4 → base-branch
```

Key principles:
- Each task branches from the previous task
- All MRs target the same base branch
- MRs are merged in order (1, 2, 3, 4...)
- After each merge, remaining branches are rebased

## Setup Phase

### 1. Create Base Branch
```bash
git checkout main
git pull origin main
git checkout -b feat/<feature-name>
git push -u origin feat/<feature-name>
```

### 2. Document Tasks
Create `tasks.md` with all tasks and their dependencies.

## Task Implementation Phase

### For First Task
```bash
# Start from base branch
git checkout feat/<feature-name>
git checkout -b task-1-<description>

# Implement task
# ... make changes ...

# Commit
git add <files>
git commit -m "feat(task-1): <description>"

# Push and create MR
git push -o merge_request.create \
         -o merge_request.target=feat/<feature-name> \
         -o merge_request.title="Task-1: <Description>" \
         -o merge_request.remove_source_branch
```

### For Subsequent Tasks
```bash
# Start from previous task branch (NOT base branch)
git checkout task-N-1-<prev-description>
git checkout -b task-N-<description>

# Implement task
# ... make changes ...

# Commit
git add <files>
git commit -m "feat(task-N): <description>"

# Push and create MR (still targeting base branch)
git push -o merge_request.create \
         -o merge_request.target=feat/<feature-name> \
         -o merge_request.title="Task-N: <Description>" \
         -o merge_request.remove_source_branch
```

## Merge Phase

### Merge Order
MRs must be merged in order: Task-1, then Task-2, then Task-3, etc.

### After Each Merge - Rebase Remaining Branches
```bash
# After task-N is merged
git checkout feat/<feature-name>
git pull origin feat/<feature-name>

# Rebase each remaining branch
for branch in task-N+1 task-N+2 task-N+3; do
  git checkout $branch
  git rebase feat/<feature-name>
  git push --force-with-lease origin $branch
done
```

### Automated Rebase Script
```bash
#!/bin/bash
set -e
BASE_BRANCH="feat/<feature-name>"
REMAINING_BRANCHES=(task-3 task-4 task-5)

git checkout $BASE_BRANCH && git pull

for branch in "${REMAINING_BRANCHES[@]}"; do
  echo "Rebasing $branch..."
  git checkout "$branch"
  git rebase $BASE_BRANCH || git rebase --skip
  git push --force-with-lease origin "$branch"
done
```

## Monitoring

### List Cascade MRs
```bash
glab mr list --target-branch=feat/<feature-name>
```

### Check MR Status
```bash
glab mr view <id>
glab mr view <id> --comments
```

## Conflict Resolution

If conflicts occur during rebase:

```bash
git checkout task-N-<description>
git fetch origin
git rebase origin/feat/<feature-name>

# Resolve conflicts in files
# Then:
git add <resolved-files>
git rebase --continue

# Push updated branch
git push --force-with-lease origin task-N-<description>
```

## Important Rules

1. **Always target base branch** in MR, never the previous task branch
2. **Always branch from previous task** for cascade effect
3. **Never use squash merge** for cascade MRs (causes conflicts)
4. **Use `--force-with-lease`** instead of `--force`
5. **Rebase after each merge** to keep branches in sync

## Error Handling

| Issue | Solution |
|-------|----------|
| Merge conflict | Rebase and resolve conflicts |
| MR out of date | Rebase from base branch |
| CI failure | Fix in task branch, push again |
| Wrong target | Update MR target branch |

## Completion

After all MRs are merged:

```bash
# Final merge to main
git checkout main
git pull origin main
git merge feat/<feature-name>
git push origin main

# Or create final MR
glab mr create --source-branch feat/<feature-name> --target-branch main
```
