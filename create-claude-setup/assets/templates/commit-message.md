# Commit Message Template

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): handle null response` |
| `docs` | Documentation | `docs(readme): update install steps` |
| `style` | Formatting (no code change) | `style: format with ruff` |
| `refactor` | Code restructuring | `refactor(utils): simplify date parsing` |
| `test` | Adding/updating tests | `test(auth): add login unit tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance improvement | `perf(query): optimize database lookup` |
| `ci` | CI/CD changes | `ci: add lint stage to pipeline` |
| `build` | Build system changes | `build: update pyproject.toml` |

## Scope

The scope is optional and indicates what part of the codebase is affected:

- `auth` - Authentication
- `api` - API endpoints
- `ui` - User interface
- `db` - Database
- `config` - Configuration
- `deps` - Dependencies
- `task-N` - Specific task number

## Description

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep under 50 characters

## Body

- Explain **what** and **why**, not **how**
- Wrap at 72 characters
- Use bullet points for multiple items
- Leave blank line between subject and body

## Footer

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-Authored-By: Name <email>`

## Examples

### Simple Commit
```
feat(auth): add password reset functionality
```

### With Body
```
fix(api): handle timeout errors gracefully

The API client was crashing when requests timed out.
Added try-catch block and retry logic with exponential backoff.

Closes #42
```

### Task Commit
```
feat(task-3): add Claude Code core configuration

- config.yaml: Master config with GitLab settings
- rules.md: Global project rules and conventions
- allowlist.yaml: Security permissions
- settings.json: Tool permissions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Breaking Change
```
refactor(api)!: change response format to JSON

BREAKING CHANGE: API now returns JSON instead of XML.
All clients must update their parsers.

Migration guide: docs/migration-v2.md
```

## Quick Reference

```bash
# Feature
git commit -m "feat(scope): add new feature"

# Bug fix
git commit -m "fix(scope): resolve issue with X"

# Documentation
git commit -m "docs(readme): update installation guide"

# Tests
git commit -m "test(utils): add unit tests for helpers"

# Chore
git commit -m "chore(deps): update ruff to 0.4.0"
```
