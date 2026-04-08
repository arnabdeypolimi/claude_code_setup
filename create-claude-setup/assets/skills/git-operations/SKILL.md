---
name: git-operations
description: Common git operation patterns and commands. Use when working with git branches, commits, staging, rebasing, stashing, or any other git operations. Triggers include branching, committing, merging, rebasing, and syncing with remote repositories.
---

# Git Operations

Reusable patterns for common git operations in this repository.

## Branch Operations

### Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/<name>
```

### Create Task Branch (Cascade)
```bash
git checkout <parent-branch>
git checkout -b task-N-<description>
```

### Delete Branch
```bash
git branch -d <branch-name>          # Safe delete
git branch -D <branch-name>          # Force delete
git push origin --delete <branch-name>  # Delete remote
```

### List Branches
```bash
git branch                           # Local branches
git branch -r                        # Remote branches
git branch -a                        # All branches
```

## Commit Operations

### Standard Commit
```bash
git add <files>
git commit -m "<type>(<scope>): <description>"
```

### Commit Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

### Amend Last Commit
```bash
git commit --amend -m "new message"  # Change message only
git add <files> && git commit --amend --no-edit  # Add files to last commit
```

### View Commit History
```bash
git log --oneline -10                # Recent commits
git log --oneline --graph -20        # With graph
git log --oneline -- <file>          # For specific file
```

## Staging Operations

### Stage Files
```bash
git add file1.py file2.py            # Specific files
git add "*.py"                       # By pattern
git add .                            # All changes
```

### Unstage Files
```bash
git restore --staged <file>
```

### View Changes
```bash
git diff                             # Unstaged changes
git diff --staged                    # Staged changes
```

## Sync Operations

### Fetch Updates
```bash
git fetch origin
```

### Pull Changes
```bash
git pull origin <branch>
```

### Push Changes
```bash
git push origin <branch>             # Normal push
git push -u origin <branch>          # Set upstream
git push --force-with-lease origin <branch>  # Force push (use carefully!)
```

## Rebase Operations

### Rebase on Branch
```bash
git checkout <feature-branch>
git rebase <base-branch>
```

### Interactive Rebase
```bash
git rebase -i HEAD~<n>
```

### Continue After Conflict
```bash
# After resolving conflicts
git add <resolved-files>
git rebase --continue
```

### Abort Rebase
```bash
git rebase --abort
```

## Stash Operations

### Stash Changes
```bash
git stash
git stash push -m "description"
```

### List Stashes
```bash
git stash list
```

### Apply Stash
```bash
git stash pop                        # Apply and remove
git stash apply                      # Apply and keep
```

### Drop Stash
```bash
git stash drop stash@{0}
```

## Diff Operations

### Compare Branches
```bash
git diff main..feature-branch
```

### Compare Commits
```bash
git diff <commit1>..<commit2>
```

### Show Changed Files
```bash
git diff --name-only main..HEAD
```

## Reset Operations

### Soft Reset (keep changes staged)
```bash
git reset --soft HEAD~1
```

### Mixed Reset (keep changes unstaged)
```bash
git reset HEAD~1
```

### Hard Reset (discard changes)
```bash
git reset --hard HEAD~1
```

## Cherry Pick

### Pick Single Commit
```bash
git cherry-pick <commit-sha>
```

### Pick Without Commit
```bash
git cherry-pick --no-commit <commit-sha>
```

## Tags

### Create Tag
```bash
git tag v1.0.0
git tag -a v1.0.0 -m "Release 1.0.0"
```

### Push Tags
```bash
git push origin v1.0.0
git push origin --tags
```

## Safety Guidelines

1. **Never force push to main**
2. **Use `--force-with-lease` instead of `--force`**
3. **Always pull before pushing**
4. **Review diff before committing**
5. **Don't commit sensitive data**
