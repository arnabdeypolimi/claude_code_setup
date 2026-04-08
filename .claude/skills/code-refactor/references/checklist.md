# Refactor Checklist

Run through every category for every file in the target module.

## Imports

- [ ] `from __future__ import annotations` at the top of every `.py` file
- [ ] Import order: stdlib → third-party → local (blank line between groups)
- [ ] No wildcard imports (`from x import *`)
- [ ] `TYPE_CHECKING` guard for imports only needed by type annotations

```python
# Good
from __future__ import annotations

import logging
from collections.abc import Generator
from typing import TYPE_CHECKING

import numpy as np

from tts_utils.models import TtsProvider

if TYPE_CHECKING:
    from kokoro_onnx import Kokoro
```

## Types

- [ ] All function parameters and return values annotated
- [ ] `str` enumerations replaced with `StrEnum` (Python 3.11+)
- [ ] Bare `Any` minimised — use specific types or `TypeVar`
- [ ] `X | Y` union syntax (not `Optional[X]` or `Union[X, Y]`)
- [ ] No `assert` used as a runtime guard — use `if`/`raise`

```python
# Bad
def process(provider: str) -> None: ...
assert params is not None

# Good
class Provider(StrEnum):
    KOKORO = "kokoro"
    ELEVENLABS = "elevenlabs"

def process(provider: Provider) -> None: ...
if params is None:
    raise ValueError("params must be set before calling process()")
```

## Pydantic Models

See `pydantic-patterns.md` for full detail.

- [ ] `model_config = ConfigDict(...)` defined explicitly
- [ ] Field names are `snake_case`; external/alias names use `Field(alias=...)`
- [ ] `populate_by_name=True` when alias differs from field name
- [ ] Validators use `@field_validator` / `@model_validator` (not deprecated `@validator`)
- [ ] Constrained types use `Field(ge=0, le=100)` not manual validators

## Error Handling

- [ ] No silent `except: pass` or bare `except Exception`
- [ ] Re-raised exceptions include context: `raise X(...) from err`
- [ ] Error messages include enough context to debug (values, not just type names)

```python
# Bad
try:
    data = json.loads(raw)
except Exception:
    pass

# Good
try:
    data = json.loads(raw)
except json.JSONDecodeError as err:
    raise ValueError(f"invalid JSON in response: {err}") from err
```

## Configuration

- [ ] Config files use TOML or YAML — never JSON
- [ ] Settings loaded via Pydantic `BaseSettings` (not `os.getenv` scattered through code)

```python
# Bad — JSON config file, raw env reads
with open("config.json") as f:
    cfg = json.load(f)
timeout = float(os.getenv("TIMEOUT", "30"))

# Good — TOML/YAML config, BaseSettings
# pyproject.toml or config.toml for static config
# pydantic-settings BaseSettings for env-driven config
class AppSettings(BaseSettings):
    timeout: float = 30.0
```

## Classes

- [ ] Data-only classes use `@dataclass(frozen=True)` (not plain class with `__init__`)
- [ ] No mutable default arguments (`def f(items=[])` → `def f(items: list | None = None)`)
- [ ] Public API uses Protocol for structural typing where appropriate

## Logging

- [ ] Use `logging_utils.get_logger` — never `logging.getLogger` or `print()`
- [ ] Logger is module-level: `from logging_utils import get_logger` then `logger = get_logger(__name__)`
- [ ] Keep `import logging` only when `logging.basicConfig`, `logging.INFO`, etc. are needed directly
- [ ] Log messages use `%s` formatting (not f-strings): `logger.info("done: %s", value)`

```python
# Bad
import logging
logger = logging.getLogger(__name__)

# Good
from logging_utils import get_logger
logger = get_logger(__name__)
```

## Docstrings

- [ ] Every public function/class/module has a docstring
- [ ] Docstring format: one-line summary, blank line, Args/Returns/Raises if non-trivial

See `docs-patterns.md` for templates.
