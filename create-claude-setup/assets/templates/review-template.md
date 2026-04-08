# Code Review Template

## Review Format

```markdown
## Code Review: [MR Title]

### Summary
[Brief description of what was reviewed]

### Files Reviewed
- `path/to/file1.py` - [brief description]
- `path/to/file2.py` - [brief description]

---

### Findings

#### Critical Issues
> Issues that must be fixed before merge

- [ ] **[file.py:42]** - [Description of critical issue]
  ```python
  # Current code
  problematic_code()

  # Suggested fix
  better_code()
  ```

#### Suggestions
> Improvements that would enhance the code

- [ ] **[file.py:15]** - [Description of suggestion]

#### Questions
> Clarifications needed about implementation choices

- [ ] [Question about specific implementation]

#### Nitpicks
> Minor style/formatting issues (optional to fix)

- [ ] **[file.py:8]** - [Minor issue]

---

### Positive Notes
[Acknowledge good practices and well-written code]

- [Good practice 1]
- [Good practice 2]

---

### Recommendation

- [ ] **Approve** - Ready to merge
- [ ] **Approve with suggestions** - Can merge after addressing optional items
- [ ] **Request changes** - Must address critical issues before merge
- [ ] **Comment** - Need discussion before decision

---

### CI Status
- [ ] All pipelines passing
- [ ] Test coverage acceptable

---
Reviewed by Claude Code
```

## Review Checklist

### Code Quality
- [ ] Code is readable and self-documenting
- [ ] Functions have single responsibility
- [ ] No code duplication (DRY)
- [ ] Variable/function names are meaningful
- [ ] No dead code or commented-out code
- [ ] Complexity is appropriate

### Security
- [ ] No hardcoded credentials or secrets
- [ ] Input validation present where needed
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities (if applicable)
- [ ] Sensitive data not logged
- [ ] Authentication/authorization correct

### Performance
- [ ] No obvious performance issues
- [ ] No N+1 query patterns
- [ ] Efficient data structures used
- [ ] No memory leaks
- [ ] Caching considered where appropriate

### Testing
- [ ] Tests exist for new/changed code
- [ ] Tests cover edge cases
- [ ] Tests are meaningful (not just coverage)
- [ ] Tests are readable and maintainable

### Documentation
- [ ] Docstrings for public functions
- [ ] Complex logic has inline comments
- [ ] README updated if needed
- [ ] API documentation updated if needed

### Style
- [ ] Follows project code style
- [ ] Consistent formatting
- [ ] Proper use of type hints
- [ ] Imports organized correctly

## Example Reviews

### Approval
```markdown
## Code Review: feat(auth): add password reset

### Summary
Reviewed password reset functionality including email sending and token validation.

### Files Reviewed
- `src/auth/reset.py` - Password reset logic
- `src/email/sender.py` - Email sending utilities
- `tests/auth/test_reset.py` - Unit tests

---

### Findings

#### Suggestions
- [ ] **[reset.py:45]** - Consider adding rate limiting to prevent abuse

#### Nitpicks
- [ ] **[sender.py:12]** - Could use f-string instead of .format()

---

### Positive Notes
- Good separation of concerns between reset logic and email sending
- Comprehensive test coverage including edge cases
- Clear error messages for users

---

### Recommendation
- [x] **Approve with suggestions** - Can merge after addressing optional items

---
Reviewed by Claude Code
```

### Request Changes
```markdown
## Code Review: fix(api): handle null response

### Summary
Reviewed null response handling in API client.

### Files Reviewed
- `src/api/client.py` - API client with null handling

---

### Findings

#### Critical Issues
- [ ] **[client.py:78]** - Potential security issue: user input not sanitized
  ```python
  # Current - vulnerable to injection
  query = f"SELECT * FROM users WHERE id = {user_id}"

  # Suggested fix - use parameterized query
  query = "SELECT * FROM users WHERE id = ?"
  cursor.execute(query, (user_id,))
  ```

- [ ] **[client.py:92]** - Exception silently swallowed
  ```python
  # Current - hides errors
  except Exception:
      pass

  # Suggested - log and handle appropriately
  except Exception as e:
      logger.error(f"API error: {e}")
      raise APIError(f"Request failed: {e}")
  ```

---

### Recommendation
- [x] **Request changes** - Must address critical issues before merge

---
Reviewed by Claude Code
```
