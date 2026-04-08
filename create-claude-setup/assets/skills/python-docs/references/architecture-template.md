# Architecture Documentation Template

Use this template when creating architecture documentation for a Python package. Select the diagrams relevant to the project.

---

## Document Structure

```markdown
# {Package} Architecture

> {One-line description of the system}

## Overview

{2-3 sentences: what the system does, key technologies, rendering context for diagrams.}

## 1. High-Level System Architecture

{Prose: describe the end-to-end pipeline in one sentence.}

\```mermaid
flowchart TD
    subgraph Input
        A[{Input description}]
    end

    subgraph "{Processing Stage}"
        B[{Component}<br/>{key detail}]
        C[{Component}<br/>{key detail}]
    end

    subgraph Output
        Z[{Output description}]
    end

    A --> B --> C --> Z
\```

## 2. Module Structure

{Prose: brief note on how modules are organized.}

\```mermaid
graph LR
    subgraph "{module_a}/"
        A1["{file}.py<br/>{ClassA}"]
        A2["{file}.py<br/>{ClassB}"]
    end

    subgraph "{module_b}/"
        B1["{file}.py<br/>{ClassC}"]
        subgraph "{submodule}/"
            B2["{file}.py<br/>{ClassD}"]
        end
    end
\```

## 3. Module Dependency Graph

{Prose: describe dependency rules (e.g. "core is the foundation").}

\```mermaid
flowchart TD
    APP["{top-level module}"]
    CORE["{foundation module}"]

    APP --> MIDDLE
    MIDDLE --> CORE

    style CORE fill:#e1f5fe,stroke:#0288d1
\```

## 4. Data Flow

{Prose: describe the primary data transformation chain.}

\```mermaid
flowchart TD
    A["{Input}<br/><b>{shape/type}</b>"]
    -->|"{transform}"| B["{Output}<br/><b>{shape/type}</b>"]
    --> C["{Final}<br/><b>{shape/type}</b>"]
\```

## 5. Configuration Hierarchy

\```mermaid
classDiagram
    class {RootConfig} {
        +{FieldType} {field_name}
    }
    class {ChildConfig} {
        +{type} {field} = {default}
    }
    {RootConfig} --> {ChildConfig}
\```

## 6. Key Data Types

| Type | Fields | Shape / Values | Description |
|------|--------|---------------|-------------|
| `{TypeName}` | `{field}` | `{shape}` | {description} |

---

**Package Version**: {version}
**Last Updated**: {YYYY-MM-DD}
```

---

## Diagram Selection Guide

| What to show | Diagram type | When to use |
|---|---|---|
| End-to-end pipeline | `flowchart TD` | Always — primary system overview |
| File/module layout | `graph LR` | When package has 3+ modules |
| Import relationships | `flowchart TD` | When dependency rules matter |
| Data transformations | `flowchart TD` with shapes | When data changes type/shape between stages |
| Temporal interactions | `sequenceDiagram` | When order of calls between components matters |
| Config/class hierarchy | `classDiagram` | When config is nested or type hierarchy is important |
| State transitions | `stateDiagram-v2` | When objects have lifecycle states |

## Mermaid Syntax Pitfalls

- **Special characters in labels**: wrap in `"quotes"` — `subgraph "3D Model"` not `subgraph 3D Model`
- **HTML in labels**: use `<br/>` for line breaks, `<b>` for bold, `<i>` for italic inside `["..."]`
- **Node IDs**: must be alphanumeric (no spaces, hyphens). Use descriptive IDs: `AE` not `a1`
- **Edge labels**: `-->|"label"| B` — quotes optional unless label has spaces
- **Subgraph nesting**: supported but keep to 2 levels max for readability
- **Style directives**: `style NODE fill:#color,stroke:#color` — use sparingly for emphasis
- **Decision nodes**: `{curly braces}` create diamond shapes — use for branching logic
- **Dashed lines**: `-.->` for optional or secondary relationships
