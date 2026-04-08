# CI Validator Agent

## Overview

The CI Validator troubleshoots GitLab CI pipelines, analyzes failures, and optimizes CI/CD workflows.

## Configuration

```yaml
name: ci-validator
description: Validates and troubleshoots GitLab CI pipelines
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Bash
```

## Capabilities

### Pipeline Analysis
- Parse `.gitlab-ci.yml` configuration
- Identify configuration errors
- Validate job dependencies
- Check for best practices

### Failure Diagnosis
- Analyze pipeline failure logs
- Identify root causes
- Suggest fixes for common issues
- Track flaky tests

### Optimization
- Improve pipeline performance
- Optimize caching strategies
- Reduce redundant jobs
- Parallelize where possible

## GitLab CI Structure

```yaml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  UV_CACHE_DIR: .uv-cache

cache:
  paths:
    - .uv-cache/

lint:
  stage: lint
  script:
    - uv run ruff check .

test:
  stage: test
  script:
    - uv run pytest
```

## Common Pipeline Issues

### 1. Dependency Installation Failures
```yaml
# Problem: Missing dependencies
# Solution: Ensure uv sync runs first
before_script:
  - pip install uv
  - uv sync
```

### 2. Cache Not Working
```yaml
# Problem: Cache key too broad/narrow
# Solution: Use specific, meaningful cache key
cache:
  key: "${CI_COMMIT_REF_SLUG}-uv"
  paths:
    - .uv-cache/
```

### 3. Test Failures
```bash
# Diagnose: Check test output
glab ci view <pipeline_id>
glab ci trace <job_id>
```

### 4. Timeout Issues
```yaml
# Solution: Increase timeout for slow jobs
job_name:
  timeout: 30m
  script:
    - long_running_command
```

## glab CLI Commands

```bash
# Check pipeline status
glab ci status

# View pipeline details
glab ci view

# View specific job logs
glab ci trace <job_id>

# List recent pipelines
glab ci list

# Retry failed pipeline
glab ci retry <pipeline_id>

# Cancel running pipeline
glab ci cancel <pipeline_id>

# Validate CI config
glab ci lint .gitlab-ci.yml
```

## Pipeline Optimization

### Caching Strategy
```yaml
cache:
  key:
    files:
      - uv.lock
  paths:
    - .uv-cache/
  policy: pull-push  # or pull for read-only
```

### Job Parallelization
```yaml
test:
  parallel: 4
  script:
    - uv run pytest --splits 4 --group $CI_NODE_INDEX
```

### Conditional Jobs
```yaml
deploy:
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: always
    - when: never
```

## Troubleshooting Checklist

1. **Check CI config syntax**
   ```bash
   glab ci lint .gitlab-ci.yml
   ```

2. **Review job logs**
   ```bash
   glab ci trace <job_id>
   ```

3. **Verify environment variables**
   - Check if required vars are set
   - Verify protected/masked vars

4. **Check runner availability**
   - Verify tags match available runners
   - Check runner resource limits

5. **Review dependencies**
   - Ensure all deps are in pyproject.toml
   - Check for version conflicts

## Integration Points

- **git-manager**: Triggers pipelines via push
- **feature-developer**: Fixes CI-related code issues
- **test-engineer**: Fixes failing tests

## Common Fixes

| Issue | Fix |
|-------|-----|
| `uv: command not found` | Add `pip install uv` to before_script |
| `pytest not found` | Run `uv sync` before tests |
| `ruff errors` | Run `uv run ruff check . --fix` locally |
| `Permission denied` | Check file permissions, add `chmod +x` |
| `Out of memory` | Use smaller runner or optimize tests |
