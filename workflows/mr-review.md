# MR Review Workflow

## Overview

Workflow for reviewing merge requests, providing feedback, and ensuring code quality before merge.

## Workflow Definition

```yaml
name: mr-review
description: Automated merge request review process
trigger:
  - manual
  - "review MR"
  - "review merge request"
```

## Phases

### Phase 1: Fetch MR Information

**Agent:** git-manager

**Commands:**
```bash
# Get MR details
glab mr view <mr_id>

# Get MR diff
glab mr diff <mr_id>

# Get MR comments
glab mr view <mr_id> --comments

# Check CI status
glab ci status
```

### Phase 2: Code Analysis

**Agent:** code-reviewer

**Checklist:**

#### Code Quality
- [ ] Code follows project style guide
- [ ] Functions have single responsibility
- [ ] Variable names are descriptive
- [ ] No unnecessary complexity
- [ ] DRY principle followed

#### Security
- [ ] No hardcoded credentials
- [ ] Input validation present
- [ ] No SQL injection vulnerabilities
- [ ] Sensitive data not logged

#### Testing
- [ ] Tests exist for new code
- [ ] Edge cases covered
- [ ] Tests are meaningful (not just coverage)

#### Documentation
- [ ] Docstrings for public functions
- [ ] Complex logic explained
- [ ] README updated if needed

### Phase 3: Generate Review

**Output Format:**
```markdown
## MR Review: <MR Title>

### Summary
[Brief description of changes]

### Files Changed
- `path/to/file1.py` - [description]
- `path/to/file2.py` - [description]

### Findings

#### Critical Issues
- [ ] **[File:Line]** - [Description of issue]

#### Suggestions
- [ ] **[File:Line]** - [Suggestion for improvement]

#### Questions
- [ ] [Question about implementation choice]

### Positive Notes
- [Good practices observed]

### Recommendation
- [ ] **Approve** - Ready to merge
- [ ] **Request Changes** - Issues need addressing
- [ ] **Comment** - Questions/discussion needed
```

### Phase 4: Post Review

**Agent:** git-manager

**Commands:**
```bash
# Add review comment
glab mr comment <mr_id> --message "<review content>"

# Or approve
glab mr approve <mr_id>
```

## Review Guidelines

### What to Look For

#### Architecture
- Does the change fit the existing architecture?
- Are there better patterns to use?
- Is the change in the right place?

#### Performance
- Any obvious performance issues?
- N+1 queries?
- Unnecessary loops?

#### Error Handling
- Are errors handled appropriately?
- Are error messages helpful?
- Are edge cases covered?

#### Maintainability
- Will this be easy to modify later?
- Is the code self-documenting?
- Are there magic numbers/strings?

### Review Tone

- Be constructive, not critical
- Explain the "why" behind suggestions
- Acknowledge good work
- Ask questions rather than demand changes
- Offer alternatives when suggesting changes

### Example Comments

**Good:**
```
Consider using a dictionary comprehension here for better readability:
`{k: v for k, v in items if v is not None}`
```

**Bad:**
```
This is wrong. Use a dictionary comprehension.
```

## Automated Checks

Before manual review, verify:

```bash
# Lint check
uv run ruff check .

# Format check
uv run ruff format --check .

# Type check
uv run mypy src/

# Test
uv run pytest
```

## Integration with CI

The review workflow complements CI checks:

| CI Check | Review Focus |
|----------|--------------|
| Lint | Code style beyond linting |
| Tests | Test quality and coverage |
| Type check | Type safety patterns |
| Security scan | Security best practices |

## Post-Merge

After MR is merged:

1. Verify deployment (if applicable)
2. Monitor for issues
3. Update documentation
4. Close related issues

```bash
# Check merged MR
glab mr view <mr_id>

# Check pipeline after merge
glab ci status
```
