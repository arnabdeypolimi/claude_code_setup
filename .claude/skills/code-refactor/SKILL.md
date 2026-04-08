---
name: code-refactor
description: >
  Refactor Python code to match this repo's coding standards and style.
  Use when the user asks to "refactor", "clean up", "fix coding standards",
  or "apply best practices" to a module, file, or directory in this repo.
  Applies python-best-practices, pydantic v2, pytorch-lightning, and
  python-docs conventions as relevant to the target code.
---

# Code Refactor Skill

Systematically refactor Python code to match this repo's standards.

## Workflow

### 1. Read Target Code

Read every file in the target module. Never propose changes to code you haven't read.

### 2. Audit Against Checklist

Run through `references/checklist.md` and note every violation. Group them by category so the user can see the full picture before any edits are made.

### 3. Run Static Analysis

```bash
uv run ruff check <target>
uv run mypy <target>
```

Report all errors as part of the audit — these are additional violations on top of the checklist.

### 4. Apply Fixes

Apply all fixes. Prefer the Edit tool over Write for existing files (smaller diffs, easier review). Make all independent edits in parallel.

Priority order (highest impact first):

1. Type safety — enums over bare strings, `from __future__ import annotations`, proper return types
2. Pydantic — snake_case fields with aliases, `model_config`, field validators (see `references/pydantic-patterns.md`)
3. Error handling — replace `assert` with `if`/`raise`, add context to re-raised exceptions
4. Python best practices — frozen dataclasses, Protocol types, avoid mutable defaults
5. PyTorch/Lightning — only apply if the module contains `torch` or `nn.Module` code (see `references/pytorch-patterns.md`)
6. Docs — public functions must have docstrings (see `references/docs-patterns.md`)

### 5. Verify

```bash
uv run ruff check <target>
uv run ruff format <target>
uv run mypy <target>
uv run pytest tests/unit/<target-name>/ -v
```

All checks must pass before declaring done. If tests fail, fix them — don't skip.

### 6. Summarise

Report a table of every change made, grouped by category. Include file and line references.

---

## Repo-Specific Conventions

- **Python**: 3.12 — use `StrEnum`, `match`, `X | Y` unions, `from __future__ import annotations` in every file
- **Linter/Formatter**: Ruff (88 char line length)
- **Type checker**: mypy (strict — all errors must be resolved)
- **Package manager**: uv (`uv run <cmd>`)
- **Tests**: pytest, mirror source structure under `tests/unit/`
- **Logging**: `from logging_utils import get_logger` then `logger = get_logger(__name__)` — never `logging.getLogger(__name__)` or `print()`
- **Imports**: stdlib → third-party → local, each group separated by blank line
- **Config**: TOML or YAML only — never JSON for config files

## When to Apply Each Sub-Skill

| Code contains | Apply |
|---------------|-------|
| `BaseModel`, Pydantic fields | `references/pydantic-patterns.md` |
| `torch`, `nn.Module`, `LightningModule` | `references/pytorch-patterns.md` |
| Public classes / functions without docstrings | `references/docs-patterns.md` |
| All Python files | `references/checklist.md` |
