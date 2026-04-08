---
name: python-docs
description: Create, update, and sync Python project documentation from source code. Use when asked to document a module, generate API references, create architecture diagrams with Mermaid, update docs after code changes, or keep documentation in sync with source. Triggers include "document", "write docs", "update docs", "sync docs", "architecture diagram", "module docs", "API reference", "document this module", "docs are outdated", or when code changes require corresponding documentation updates.
---

# Python Documentation

Generate and maintain documentation for Python projects by analyzing source code.

## Docs Folder Layout

```
docs/
├── README.md                  # Project-level documentation index
├── artalk/                    # ARTalk package docs (maps to src/artalk/)
│   ├── README.md             # ARTalk docs index with module table
│   ├── architecture.md       # System architecture with Mermaid diagrams
│   ├── core.md               # Core types, config, constants
│   └── pipeline.md           # High-level orchestration API
└── modules/                   # Non-ARTalk module docs (maps to other src/ packages)
    ├── _template.md          # Template for new module docs
    ├── logging_utils.md      # Logging utilities (maps to src/logging_utils/)
    └── segmentation.md       # Segmentation module (maps to src/segmentation/)
```

### File Placement Rules

| Source location | Doc location | Index to update |
|---|---|---|
| `src/artalk/` | `docs/artalk/<module>.md` | `docs/artalk/README.md` module table |
| `src/artalk/` (architecture) | `docs/artalk/architecture.md` | `docs/artalk/README.md` module table |
| `src/<other_pkg>/` | `docs/modules/<pkg>.md` | `docs/README.md` structure tree |

- ARTalk sub-module docs go in `docs/artalk/` (e.g., `motion.md`, `renderer.md`, `tracking.md`)
- Non-ARTalk package docs go in `docs/modules/`
- New module doc template lives at `docs/modules/_template.md`
- Cross-references between artalk docs use relative paths: `[core.md](core.md)`
- Cross-references from modules/ to artalk/ use: `[artalk](../artalk/)`

### After Creating/Moving Any Doc

1. Update the relevant index (`docs/artalk/README.md` or `docs/README.md`)
2. Fix all cross-reference links affected by the change
3. Verify no broken relative links remain

## Workflow Selection

| Request | Workflow |
|---------|----------|
| Document a module | **Create Module Doc** |
| Architecture / system diagram | **Create Architecture Doc** |
| Code changed, update docs | **Sync Docs** |
| Check doc accuracy | **Sync Docs** (audit mode) |

## Create Module Doc

1. **Determine doc location** — use the file placement rules above
2. **Explore the module** — read `__init__.py`, all `.py` files, identify public classes, functions, protocols, constants
3. **Extract structure:**
   - Classes: name, bases, fields (with types and defaults), methods (with signatures)
   - Functions: name, params, return type, docstring summary
   - Constants: name, value, type
   - Protocols/ABCs: interface contracts
4. **Identify relationships** — imports between modules, inheritance, composition, protocol implementations
5. **Write the doc** using the template in [references/module-template.md](references/module-template.md)
6. **Update the index** — add entry to `docs/artalk/README.md` module table or `docs/README.md` structure tree
7. **Verify accuracy** — cross-check every class name, method signature, and constant value against source

Key rules:
- Only document public API (no `_private` members unless they are essential)
- Include runnable code examples with expected output
- Use exact types from source — do not generalize or simplify
- Link to related module docs with relative paths

## Create Architecture Doc

1. **Map the package** — identify all top-level modules and sub-modules
2. **Trace dependencies** — grep imports to build the dependency graph
3. **Identify data flow** — follow primary data types through the pipeline, noting tensor shapes or type transformations
4. **Select diagrams** from patterns in [references/architecture-template.md](references/architecture-template.md):
   - System overview (flowchart TD)
   - Module dependency graph (flowchart TD)
   - Data flow with types/shapes (flowchart TD)
   - Configuration hierarchy (classDiagram)
   - Subsystem detail (flowchart TD per subsystem)
5. **Write the doc** — place in the appropriate package docs dir (e.g., `docs/artalk/architecture.md`)
6. **Update the index** — ensure architecture doc is listed in the package README
7. **Validate Mermaid** — ensure all ```` ```mermaid ```` blocks use valid syntax: correct diagram type keyword, quoted labels with special characters, proper arrow syntax

Mermaid quick reference:
```
flowchart TD          — top-down flowchart
flowchart LR          — left-right flowchart
classDiagram          — class/config hierarchy
sequenceDiagram       — temporal interactions
graph LR/TD           — simple directed graph
```

Node syntax: `ID["Label with<br/>line break"]`, `ID{Decision}`, `ID([Rounded])`
Edge syntax: `A --> B`, `A -->|label| B`, `A -.->|dashed| B`
Subgraphs: `subgraph "Title" ... end`

## Sync Docs

When source code changes, update corresponding documentation.

1. **Detect changes** — use `git diff` (or compare source vs docs) to identify what changed:
   - New classes, functions, or modules
   - Renamed or removed public API
   - Changed signatures, types, or default values
   - New constants or configuration fields
2. **Map changes to docs** — use the source-to-doc mapping in [references/sync-workflow.md](references/sync-workflow.md)
3. **Apply updates** following the checklist in [references/sync-workflow.md](references/sync-workflow.md)
4. **Verify** — confirm every change in source is reflected in docs, and no stale references remain

Priority order for sync:
1. **Breaking changes** — removed/renamed API, changed signatures
2. **New public API** — new classes, functions, modules
3. **Value changes** — updated constants, defaults, config fields
4. **Diagrams** — update architecture diagrams if module structure or data flow changed
5. **Index files** — update `docs/artalk/README.md` and `docs/README.md` if structure changed

## Documentation Style

- **Heading hierarchy**: `#` doc title, `##` sections, `###` subsections, `####` items
- **Tables** for API references (method, description), config options, constants
- **Code blocks** with language tag (`python`, `bash`, `yaml`, `mermaid`)
- **Cross-references** as relative markdown links: `[core.md](core.md)`
- **Footer** with package version and last-updated date
- Concise prose — one sentence per concept, no filler
- Match existing doc style in the project when updating
