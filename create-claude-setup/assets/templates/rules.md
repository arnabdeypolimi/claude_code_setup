# Global Project Rules

These rules apply to all Claude Code interactions in this repository.

## Platform: GitLab

This is a **GitLab** repository. Follow GitLab conventions:

### Terminology
- Use "Merge Request" or "MR" (never "Pull Request" or "PR")
- Use "GitLab CI" (never "GitHub Actions")
- Use "glab" CLI (never "gh" CLI)

### glab CLI Commands
```bash
# Merge Requests
glab mr create      # Create MR
glab mr list        # List MRs
glab mr view <id>   # View MR details
glab mr merge <id>  # Merge MR

# Issues
glab issue list     # List issues
glab issue view <id> # View issue

# CI/CD
glab ci status      # Check pipeline status
glab ci view        # View pipeline
```

## Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `task-N-` - Task branches for cascade MR workflow

Examples:
- `feature/user-authentication`
- `bugfix/fix-login-error`
- `task-3-claude-core`

## Commit Messages

Follow Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks

### Examples
```
feat(auth): add OAuth2 login support
fix(api): handle null response from server
docs(readme): update installation instructions
test(utils): add unit tests for date formatting
```

## Code Style

### Python
- Use **ruff** for linting and formatting
- Follow PEP 8 conventions
- Line length: 88 characters
- Use type hints for function signatures
- Write docstrings for public functions

### Pre-commit
Always run pre-commit before committing:
```bash
pre-commit run --all-files
```

## Environment

### UV Package Manager
```bash
uv sync              # Install dependencies
uv run <command>     # Run command in environment
uv add <package>     # Add dependency
uv add --dev <pkg>   # Add dev dependency
```

### Running Tools
```bash
uv run ruff check .        # Lint
uv run ruff format .       # Format
uv run pytest              # Test
uv run mypy src/           # Type check
```

## Security

### Never Commit
- `.env` files
- API keys or tokens
- Passwords or credentials
- Private keys (`.pem`, `.key`)

### Always Check
- Use `.gitignore` for sensitive files
- Review diffs before committing
- Run security checks in CI

## Cascade MR Workflow

When implementing multiple tasks:

1. Create base feature branch from `main`
2. Create task branches cascading from each other
3. All MRs target the base feature branch
4. Merge MRs in order (task-1, task-2, task-3, ...)
5. Rebase remaining branches after each merge

```bash
# Create MR with GitLab push options
git push -o merge_request.create \
         -o merge_request.target=<base-branch> \
         -o merge_request.title="Task-N: Description" \
         -o merge_request.remove_source_branch
```

## File Organization

```
.claude/
├── config.yaml      # Master configuration
├── rules.md         # This file
├── allowlist.yaml   # Security permissions
├── settings.json    # Tool permissions
├── agents/          # Agent definitions
├── workflows/       # Workflow definitions
├── skills/          # Skill definitions (auto-triggered by context)
│   ├── git-operations/
│   ├── gitlab-integration/
│   ├── python-best-practices/
│   ├── pydantic/
│   ├── pytorch-lightning/
│   └── skill-creator/
└── templates/       # Templates
```

## Available Skills

Skills are automatically loaded based on file context:

- **git-operations**: Git branch, commit, rebase, stash operations
- **gitlab-integration**: glab CLI for MRs, issues, CI/CD
- **python-best-practices**: Type-first development with dataclasses, unions, protocols
- **pydantic**: Data validation for APIs, settings, ORM models
- **pytorch-lightning**: Neural network training with PyTorch Lightning
- **skill-creator**: Guide for creating new skills
