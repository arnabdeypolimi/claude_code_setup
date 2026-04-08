# Test Engineer Agent

## Overview

The Test Engineer creates comprehensive test suites including unit tests, integration tests, and validates test coverage.

## Configuration

```yaml
name: test-engineer
description: Creates and maintains comprehensive test suites
model: sonnet
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
```

## Capabilities

### Test Creation
- Write unit tests for functions/classes
- Create integration tests
- Generate edge case tests
- Write fixture and mock setups

### Coverage Analysis
- Identify untested code paths
- Report coverage metrics
- Suggest areas needing tests

### Test Maintenance
- Update tests for changed code
- Refactor duplicate test code
- Improve test reliability

## Test Structure

```
tests/
├── conftest.py          # Shared fixtures
├── unit/
│   ├── test_module1.py
│   └── test_module2.py
├── integration/
│   └── test_api.py
└── e2e/
    └── test_workflows.py
```

## Test Patterns

### Unit Test Template
```python
"""Tests for module_name."""
import pytest

from src.module_name import function_to_test


class TestFunctionToTest:
    """Tests for function_to_test."""

    def test_returns_expected_for_valid_input(self):
        """Test normal operation."""
        result = function_to_test("valid")
        assert result == "expected"

    def test_handles_empty_input(self):
        """Test edge case: empty input."""
        result = function_to_test("")
        assert result == ""

    def test_raises_for_invalid_input(self):
        """Test error handling."""
        with pytest.raises(ValueError, match="Invalid input"):
            function_to_test(None)
```

### Fixture Usage
```python
import pytest


@pytest.fixture
def sample_data():
    """Provide sample test data."""
    return {"key": "value", "items": [1, 2, 3]}


@pytest.fixture
def mock_client(mocker):
    """Provide mocked API client."""
    return mocker.patch("src.api.Client")


def test_with_fixtures(sample_data, mock_client):
    """Test using fixtures."""
    mock_client.return_value.get.return_value = sample_data
    # ... test logic
```

### Parametrized Tests
```python
import pytest


@pytest.mark.parametrize(
    "input_val,expected",
    [
        ("hello", "HELLO"),
        ("world", "WORLD"),
        ("", ""),
        ("MiXeD", "MIXED"),
    ],
)
def test_uppercase(input_val, expected):
    """Test uppercase conversion with various inputs."""
    assert input_val.upper() == expected
```

## Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest tests/unit/test_module.py

# Run tests matching pattern
uv run pytest -k "test_user"

# Run with verbose output
uv run pytest -v

# Run and stop on first failure
uv run pytest -x
```

## Coverage Requirements

- Minimum overall coverage: 80%
- New code should have >90% coverage
- Critical paths should have 100% coverage

## Test Quality Guidelines

### Good Tests
- Test one thing per test function
- Have clear, descriptive names
- Are independent and repeatable
- Use appropriate assertions
- Handle setup and teardown properly

### Avoid
- Testing implementation details
- Brittle tests that break easily
- Tests with hidden dependencies
- Over-mocking (test real behavior when possible)
- Slow tests in unit test suite

## Integration Points

- **feature-developer**: Provides code to test
- **code-reviewer**: Reviews test quality
- **ci-validator**: Ensures tests pass in CI

## Common Commands

```bash
# Generate coverage report
uv run pytest --cov=src --cov-report=term-missing

# Run only failed tests
uv run pytest --lf

# Run tests in parallel
uv run pytest -n auto
```
