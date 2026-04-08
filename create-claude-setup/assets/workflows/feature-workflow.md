# Feature Workflow

## Overview

End-to-end workflow for implementing a complete feature from requirements to merged MR.

## Workflow Definition

```yaml
name: feature-workflow
description: Complete feature implementation lifecycle
trigger:
  - manual
  - "implement feature"
  - "add feature"
```

## Phases

### Phase 1: Requirements Analysis

**Agent:** orchestrator

**Steps:**
1. Parse feature request/issue
2. Identify acceptance criteria
3. Break down into subtasks
4. Estimate complexity

**Output:** Feature specification document

### Phase 2: Branch Setup

**Agent:** git-manager

**Steps:**
1. Ensure on correct base branch
2. Pull latest changes
3. Create feature branch
4. Push branch to remote

**Commands:**
```bash
git checkout main
git pull origin main
git checkout -b feature/<feature-name>
git push -u origin feature/<feature-name>
```

### Phase 3: Implementation

**Agent:** feature-developer

**Steps:**
1. Analyze existing codebase patterns
2. Implement feature code
3. Add inline documentation
4. Run linter and fix issues

**Verification:**
```bash
uv run ruff check .
uv run ruff format .
```

### Phase 4: Testing

**Agent:** test-engineer

**Steps:**
1. Create unit tests for new code
2. Create integration tests if needed
3. Verify coverage meets requirements
4. Run full test suite

**Verification:**
```bash
uv run pytest --cov=src --cov-report=term-missing
```

### Phase 5: Self-Review

**Agent:** code-reviewer

**Steps:**
1. Review code quality
2. Check for security issues
3. Verify documentation
4. Suggest improvements

**Output:** Review report with findings

### Phase 6: Documentation Update

**Agent:** feature-developer

**Steps:**
1. Create/update module documentation in `docs/modules/`
2. Follow template structure from `_template.md`
3. Document all public functions, classes, and constants
4. Include usage examples
5. Update `docs/README.md` if new module added

**Verification:**
- Documentation file exists for affected module
- All public APIs documented
- Examples are runnable

### Phase 7: Commit and MR

**Agent:** git-manager

**Steps:**
1. Stage changes
2. Create commit with conventional message
3. Push to remote
4. Create merge request

**Commands:**
```bash
git add .
git commit -m "feat(<scope>): <description>"
git push -o merge_request.create \
         -o merge_request.target=main \
         -o merge_request.title="feat: <description>"
```

### Phase 8: CI Validation

**Agent:** ci-validator

**Steps:**
1. Monitor pipeline status
2. Analyze any failures
3. Fix issues if found
4. Verify all checks pass

**Commands:**
```bash
glab ci status
glab ci view
```

### Phase 9: Review and Merge

**Steps:**
1. Address reviewer feedback
2. Update MR if needed
3. Get approval
4. Merge MR

## Error Handling

| Phase | Error | Action |
|-------|-------|--------|
| Implementation | Unclear requirements | Request clarification |
| Testing | Tests fail | Fix code or update tests |
| Self-Review | Critical issues | Return to implementation |
| CI | Pipeline fails | Diagnose and fix |

## Success Criteria

- [ ] All acceptance criteria met
- [ ] Code follows project standards
- [ ] Tests pass with >80% coverage
- [ ] No security vulnerabilities
- [ ] Module documentation updated in `docs/modules/`
- [ ] CI pipeline passes
- [ ] MR approved and merged

## Example Usage

```
User: Implement user authentication feature

orchestrator:
1. Analyzes request → delegates to feature-developer
2. feature-developer implements auth code
3. Delegates to test-engineer for tests
4. code-reviewer reviews implementation
5. feature-developer updates docs/modules/auth.md
6. git-manager creates commits and MR
7. ci-validator monitors pipeline
8. Reports completion to user
```
