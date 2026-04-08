# Module Documentation Template

Use this template when creating documentation for a Python module. Replace placeholders in `{braces}`.

---

```markdown
# Module: {module_name}

> {One-line description of what this module does}

## Overview

{2-3 sentences explaining the module's purpose and role in the system.}

- **{Capability 1}**: {brief description}
- **{Capability 2}**: {brief description}

{Note which other modules depend on this one and which it depends on.}

## API Reference

### Classes

#### `{ClassName}`

{One-sentence description.}

\```python
from {package}.{module} import {ClassName}

obj = {ClassName}(
    {param1}: {Type1},  # {description}
    {param2}: {Type2} = {default},  # {description}
)
\```

**Parameters:**
- `{param1}` ({Type1}): {description}
- `{param2}` ({Type2}, optional): {description}. Default: `{default}`

**Attributes:**
- `{attr}` ({Type}): {description}

**Methods:**

| Method | Description |
|--------|-------------|
| `{method}({params}) -> {ReturnType}` | {description} |

### Functions

#### `{function_name}({params}) -> {ReturnType}`

{One-sentence description.}

**Parameters:**
- `{param}` ({Type}): {description}

**Returns:** {Type} — {description}

### Constants

\```python
from {package}.{module} import (
    {CONSTANT_1},  # {value} — {description}
    {CONSTANT_2},  # {value} — {description}
)
\```

## Usage Examples

### Basic Usage

\```python
{Minimal runnable example}
\```

**Expected Output:**
\```
{output}
\```

### {Advanced Pattern Name}

\```python
{Example showing a common non-trivial pattern}
\```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `{option}` | {type} | `{default}` | {description} |

## Related Modules

- [`{related_module}`](./{related_module}.md) — {relationship description}

---

**Package Version**: {version}
**Last Updated**: {YYYY-MM-DD}
```

---

## Template Usage Notes

- **Only document public API** — skip `_private` members unless they are the only way to accomplish something important
- **Runnable examples** — every code example should work if pasted into a Python file with the right imports
- **Exact types** — use the actual type annotations from source, not simplified versions
- **Omit empty sections** — if a module has no constants, drop the Constants section
- **Tables over prose** — prefer tables for methods, config options, constants
- **One class per `####`** — if the module has many classes, list them all under `### Classes` with `####` each
