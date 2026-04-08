# Code-to-Docs Sync Workflow

Detailed procedure for keeping documentation in sync with source code changes.

---

## 1. Detect Changes

Run `git diff` against the relevant base (last documented commit, main branch, or specific range):

```bash
# Unstaged changes
git diff -- 'src/**/*.py'

# Staged changes
git diff --cached -- 'src/**/*.py'

# Against main branch
git diff main -- 'src/**/*.py'

# Since last doc update (by commit or tag)
git diff <last-doc-commit> -- 'src/**/*.py'
```

Classify each changed file:
- **New file** → may need a new doc or section in existing doc
- **Modified file** → check if public API changed
- **Deleted file** → remove from docs, update cross-references
- **Renamed file** → update all references

## 2. Identify Public API Changes

For each modified `.py` file, check for changes to:

| Change Type | What to Look For | Doc Impact |
|---|---|---|
| New class | `class Foo:` added | Add to API Reference |
| Removed class | `class Foo:` deleted | Remove from API Reference, update cross-references |
| Renamed class | `class Foo` → `class Bar` | Update all references |
| New method | `def method(self, ...)` added to public class | Add to method table |
| Changed signature | Parameters added/removed/retyped | Update Parameters section |
| Changed default | `param=old` → `param=new` | Update default values |
| New constant | `CONST = value` added | Add to Constants section |
| Changed constant value | `CONST = old` → `CONST = new` | Update value |
| New module | New directory with `__init__.py` | May need new doc file |
| New protocol/ABC | `class Proto(Protocol):` | Add interface contract |

## 3. Map Changes to Doc Files

Build a mapping of which docs reference which source files.

**ARTalk package** (`src/artalk/` → `docs/artalk/`):

```
src/artalk/core/types.py       → docs/artalk/core.md (API Reference > Classes)
src/artalk/core/config.py      → docs/artalk/core.md (Configuration)
src/artalk/core/constants.py   → docs/artalk/core.md (Constants), docs/artalk/architecture.md (Key Constants)
src/artalk/pipeline/engine.py  → docs/artalk/pipeline.md
src/artalk/motion/             → docs/artalk/motion.md (if exists)
src/artalk/renderer/           → docs/artalk/renderer.md (if exists)
src/artalk/tracking/           → docs/artalk/tracking.md (if exists)
src/artalk/ (any structural)   → docs/artalk/architecture.md (diagrams)
src/artalk/ (new sub-module)   → NEW: docs/artalk/<module>.md + update docs/artalk/README.md
```

**Other packages** (`src/<pkg>/` → `docs/modules/`):

```
src/logging_utils/             → docs/modules/logging_utils.md
src/segmentation/              → docs/modules/segmentation.md
src/<new_package>/             → NEW: docs/modules/<pkg>.md + update docs/README.md
```

**Index files to check:**
- `docs/artalk/README.md` — module documentation table and status
- `docs/README.md` — documentation structure tree

## 4. Apply Updates

### For Module Docs

- [ ] Update class definitions (fields, types, defaults)
- [ ] Update method tables (signature, description)
- [ ] Update constants (values, types)
- [ ] Update code examples if API changed
- [ ] Update "Expected Output" if behavior changed
- [ ] Update import paths if modules were reorganized
- [ ] Update "Related Modules" links if new modules added
- [ ] Update version and "Last Updated" date

### For Architecture Docs

- [ ] Update module structure diagram if modules added/removed/renamed
- [ ] Update dependency graph if import relationships changed
- [ ] Update data flow diagram if types/shapes changed
- [ ] Update configuration hierarchy if config classes changed
- [ ] Update key data types table if types added/modified/removed
- [ ] Update constants table if values changed

### For README / Index Docs

- [ ] Add entries for new module docs
- [ ] Remove entries for deleted modules
- [ ] Update module status (documented vs in-progress)
- [ ] Update package structure tree if directory layout changed

## 5. Verify

After applying updates:

- [ ] Every new public class/function appears in docs
- [ ] Every removed class/function is gone from docs
- [ ] Every renamed item uses the new name everywhere
- [ ] Every changed signature/default matches source
- [ ] Every constant value matches source
- [ ] All cross-reference links resolve (no broken `[text](path.md)`)
- [ ] All Mermaid diagrams reflect current module/class names
- [ ] Code examples use current API (would run without errors)
- [ ] Version and date are updated

## 6. Common Pitfalls

- **Stale examples** — code examples using old API that no longer works
- **Ghost references** — mentions of deleted classes/modules in prose or diagrams
- **Wrong defaults** — doc says `default=X` but source says `default=Y`
- **Missing new API** — new classes added to source but not documented
- **Diagram drift** — architecture diagrams showing old module names or missing new modules
- **Broken links** — relative links to renamed or moved doc files
