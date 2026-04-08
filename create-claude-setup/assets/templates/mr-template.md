# Merge Request Template

## MR Description Format

```markdown
## Summary

Brief description of the changes in this MR.

## Related Issue

Closes #<issue_number>

## Changes Made

- [Change 1]
- [Change 2]
- [Change 3]

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Configuration change

## Security Impact Assessment

- [ ] This change handles sensitive data (PII, credentials, tokens, etc.)
- [ ] This change modifies authentication or authorization logic
- [ ] This change affects API endpoints or external interfaces
- [ ] This change introduces new dependencies or third-party libraries
- [ ] This change modifies security controls or configurations
- [ ] No security impact identified

## Security Considerations

[Describe any security implications, mitigations, or relevant context. Required if any security impact box is checked above.]

## Testing

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Security testing performed (if applicable)

### Test Instructions
1. [Step 1]
2. [Step 2]
3. [Expected result]

## Checklist

- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data in code/commits
- [ ] All tests pass locally
- [ ] CI pipeline passes

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Additional Notes

[Any additional context or notes for reviewers]

---
Generated with Claude Code
```

## Example MRs

### Feature MR
```markdown
## Summary

Add user authentication with OAuth2 support for GitLab login.

## Related Issue

Closes #45

## Changes Made

- Add `GitLabAuthProvider` class for OAuth2 flow
- Create login/logout endpoints in API
- Add auth middleware for protected routes
- Store tokens securely in session

## Type of Change

- [x] New feature (non-breaking change that adds functionality)

## Security Impact Assessment

- [x] This change handles sensitive data (PII, credentials, tokens, etc.)
- [x] This change modifies authentication or authorization logic
- [x] This change affects API endpoints or external interfaces
- [ ] This change introduces new dependencies or third-party libraries
- [ ] This change modifies security controls or configurations
- [ ] No security impact identified

## Security Considerations

OAuth2 tokens are stored server-side in encrypted sessions. No tokens are exposed to the client. Login endpoints are rate-limited to prevent brute-force attacks.

## Testing

### Test Coverage
- [x] Unit tests added/updated
- [x] Integration tests added/updated
- [x] Manual testing completed
- [x] Security testing performed (if applicable)

### Test Instructions
1. Navigate to /login
2. Click "Login with GitLab"
3. Authorize the application
4. Should redirect to dashboard with user info

## Checklist

- [x] Code follows project standards
- [x] Self-review completed
- [x] Documentation updated
- [x] No sensitive data in code/commits
- [x] All tests pass locally
- [x] CI pipeline passes

---
Generated with Claude Code
```

### Bug Fix MR
```markdown
## Summary

Fix timeout error when API requests take longer than 30 seconds.

## Related Issue

Fixes #72

## Changes Made

- Increase default timeout to 60 seconds
- Add retry logic with exponential backoff
- Improve error message for timeout failures

## Type of Change

- [x] Bug fix (non-breaking change that fixes an issue)

## Security Impact Assessment

- [ ] This change handles sensitive data (PII, credentials, tokens, etc.)
- [ ] This change modifies authentication or authorization logic
- [ ] This change affects API endpoints or external interfaces
- [ ] This change introduces new dependencies or third-party libraries
- [ ] This change modifies security controls or configurations
- [x] No security impact identified

## Security Considerations

N/A

## Testing

### Test Coverage
- [x] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Security testing performed (if applicable)

### Test Instructions
1. Make API request that takes >30 seconds
2. Should complete without timeout error
3. If still fails, should retry up to 3 times

## Checklist

- [x] Code follows project standards
- [x] Self-review completed
- [x] Documentation updated
- [x] No sensitive data in code/commits
- [x] All tests pass locally
- [x] CI pipeline passes

---
Generated with Claude Code
```

### Task MR (Cascade)
```markdown
## Summary

Task-3: Add Claude Code core configuration files.

## Changes Made

- `.claude/config.yaml` - Master configuration
- `.claude/rules.md` - Global project rules
- `.claude/allowlist.yaml` - Security permissions
- `.claude/settings.json` - Tool permissions

## Type of Change

- [x] Configuration change

## Security Impact Assessment

- [ ] This change handles sensitive data (PII, credentials, tokens, etc.)
- [ ] This change modifies authentication or authorization logic
- [ ] This change affects API endpoints or external interfaces
- [ ] This change introduces new dependencies or third-party libraries
- [x] This change modifies security controls or configurations
- [ ] No security impact identified

## Security Considerations

Allowlist and settings files define tool permissions for Claude Code. Reviewed to ensure no over-permissive access is granted.

## Testing

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [x] Manual testing completed
- [ ] Security testing performed (if applicable)

## Checklist

- [x] Code follows project standards
- [x] Self-review completed
- [x] Documentation updated
- [x] No sensitive data in code/commits
- [x] CI pipeline passes

## Cascade Info

- **Base Branch:** feat/claude-code-setup
- **Previous Task:** task-2-python-setup
- **Next Task:** task-4-agents

---
Generated with Claude Code
```
