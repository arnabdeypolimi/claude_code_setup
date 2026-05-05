# Claude Code Setup

Personal Claude Code configuration kit — skills, agents, workflows, plugins, and templates for bootstrapping new projects.

## What's Inside

| Type | Location | Purpose |
|------|----------|---------|
| **Skills** | `.claude/skills/` | Custom slash-command prompts |
| **Agents** | `agents/` | Orchestrator and subagent definitions |
| **Workflows** | `workflows/` | Multi-step workflow definitions |
| **Templates** | `templates/` | Starter configs to copy into new projects |
| **Settings** | `.claude/settings.json` | Global model config and enabled plugins |

## Repo Structure

```
claude_code_setup/
├── README.md
├── CLAUDE.md
├── .claude/
│   ├── settings.json          # Enabled plugins and global model config
│   ├── settings.local.json    # Local permission overrides (not committed)
│   └── skills/                # All skill definitions (custom + research + UI/UX)
│       ├── git-operations/
│       ├── gitlab-integration/
│       ├── python-best-practices/
│       ├── python-docs/
│       ├── pydantic/
│       ├── pytorch-lightning/
│       ├── mermaid-diagrams/
│       ├── remotion-best-practices/
│       ├── code-refactor/
│       ├── skill-creator/
│       ├── industrial-ai-research/
│       ├── latex-paper-en/
│       ├── latex-thesis-zh/
│       ├── paper-audit/
│       ├── research-paper-writing/
│       ├── typst-paper/
│       └── <21 impeccable UI/UX skills>/
├── agents/
│   ├── orchestrator/
│   │   └── orchestrator.md
│   └── subagents/
│       ├── feature-developer.md
│       ├── test-engineer.md
│       ├── code-reviewer.md
│       ├── git-manager.md
│       └── ci-validator.md
├── workflows/
│   ├── feature-workflow.md
│   ├── cascade-mr.md
│   └── mr-review.md
└── templates/
    ├── CLAUDE.md              # Starter project CLAUDE.md
    ├── settings.json          # Starter project settings.json
    ├── config.yaml            # Master project configuration
    ├── rules.md               # Global rules and conventions
    ├── allowlist.yaml         # Security permissions
    ├── commit-message.md      # Commit message format guide
    ├── mr-template.md         # MR description template
    └── review-template.md     # Code review output template
```

## Skills

### Custom Development Skills

| Skill | Description |
|-------|-------------|
| `git-operations` | Git branch, commit, rebase, stash patterns |
| `gitlab-integration` | `glab` CLI for MRs, issues, CI/CD |
| `python-best-practices` | Type-first development with dataclasses, unions, protocols |
| `pydantic` | Data validation for APIs, settings, ORM models |
| `pytorch-lightning` | Neural network training with PyTorch Lightning |
| `mermaid-diagrams` | Software diagrams using Mermaid syntax |
| `remotion-best-practices` | Video creation in React with Remotion |
| `code-refactor` | Python refactoring to match project coding standards |
| `python-docs` | Create and sync Python project documentation |
| `skill-creator` | Guide for creating new skills |

### Research & Academic Skills

| Skill | Description |
|-------|-------------|
| `industrial-ai-research` | Literature research for industrial AI (anomaly detection, predictive maintenance, scheduling) |
| `latex-paper-en` | English LaTeX academic paper assistant — compile, grammar, logic, de-AI, translation |
| `latex-thesis-zh` | Chinese LaTeX degree thesis — GB/T 7714, thuthesis/pkuthss, structure review |
| `paper-audit` | Multi-agent paper review — critical, domain, literature, methodology reviewers |
| `research-paper-writing` | ML/CV/NLP paper writing — intro, abstract, method, experiments section guides |
| `typst-paper` | Typst academic paper assistant — same capabilities as `latex-paper-en` for Typst |

### Impeccable UI/UX Skills

Source: [pbakaus/impeccable](https://github.com/pbakaus/impeccable)

| Skill | Description |
|-------|-------------|
| `frontend-design` | Production-grade frontend interfaces |
| `animate` | Purposeful animations and micro-interactions |
| `adapt` | Responsive design across screen sizes |
| `arrange` | Layout, spacing, and visual rhythm |
| `audit` | Accessibility, performance, and theming checks |
| `bolder` | More visually interesting and stimulating designs |
| `clarify` | UX copy, error messages, and microcopy |
| `colorize` | Strategic color additions |
| `critique` | UX evaluation and visual hierarchy assessment |
| `delight` | Joy, personality, and unexpected touches |
| `distill` | Strip to essence, reduce complexity |
| `extract` | Reusable components and design tokens |
| `harden` | Error handling, i18n, text overflow resilience |
| `normalize` | Realign to design system standards |
| `onboard` | Onboarding flows and first-run experiences |
| `optimize` | Loading speed, rendering, animation performance |
| `overdrive` | Technically ambitious interface implementations |
| `polish` | Final quality pass for alignment and consistency |
| `quieter` | Tone down visually aggressive designs |
| `teach-impeccable` | One-time project design context setup |
| `typeset` | Typography, font choices, hierarchy |

## Agents

| Agent | Model | Role |
|-------|-------|------|
| `orchestrator` | opus | Coordinates multi-agent workflows, delegates to subagents |
| `feature-developer` | opus | Implements features and fixes following project patterns |
| `test-engineer` | sonnet | Creates unit, integration, and edge-case tests |
| `code-reviewer` | sonnet | Reviews for quality, security, and best practices |
| `git-manager` | sonnet | Manages branches, commits, and MRs via `glab` |
| `ci-validator` | sonnet | Troubleshoots GitLab CI pipelines |

## Workflows

| Workflow | Description |
|----------|-------------|
| `feature-workflow` | End-to-end feature implementation: requirements → MR |
| `cascade-mr` | Cascading MRs where multiple task branches build on each other |
| `mr-review` | Automated MR review: fetch diff → analyse → post feedback |

## Quick Start for a New Project

### Option A — Interactive installer (recommended)

**Requirements:** Node.js 18+

Run from inside your project directory:

```bash
npx github:arnabdeypolimi/claude_code_setup
```

The installer will ask you:
1. Target directory
2. VCS platform (GitLab / GitHub / Neither)
3. Which skill groups to install (Essential is always included)
4. Project name

If `claude` is in your PATH, it will offer to auto-install plugins. Otherwise it prints the exact commands to run.

**Skill groups:**

| Group | Skills | Plugins |
|-------|--------|---------|
| **Essential** *(always)* | `git-operations` | superpowers, context7, claude-md-management, pr-review-toolkit, code-review, code-simplifier, **claude-mem** |
| GitLab | `gitlab-integration` | gitlab |
| GitHub | — | github |
| Python Development | python-best-practices, python-docs, pydantic, pytorch-lightning, code-refactor | — |
| Frontend / UI-UX Design | 21 impeccable skills | frontend-design, playwright, **ui-ux-pro-max** |
| Research & Academic | industrial-ai-research, latex-paper-en, latex-thesis-zh, paper-audit, research-paper-writing, typst-paper | — |
| AI / Machine Learning | — | huggingface-skills |
| Diagrams & Docs | mermaid-diagrams, skill-creator | — |
| Video / React | remotion-best-practices | — |
| Security | — | security-guidance |
| Marketing | — | **marketing-skills** |
| Caveman Mode | — | **caveman** |
| Agent Skills | — | **agent-skills** |

**To update skills later:**

```bash
npx github:arnabdeypolimi/claude_code_setup --update
```

The updater detects changed/added skills, shows a multiselect, and handles local edit conflicts (backup / overwrite / skip).

---

### Option B — Manual setup

1. **Clone this repo**
   ```bash
   git clone https://github.com/arnabdeypolimi/claude_code_setup.git
   ```

2. **Copy configs into your new project**
   ```bash
   cp claude_code_setup/templates/CLAUDE.md <your-project>/
   cp claude_code_setup/templates/settings.json <your-project>/.claude/
   cp claude_code_setup/templates/config.yaml <your-project>/.claude/
   cp claude_code_setup/templates/rules.md <your-project>/.claude/
   cp claude_code_setup/templates/allowlist.yaml <your-project>/.claude/
   ```

3. **Install plugins** (inside your new project directory, within Claude Code)
   ```bash
   claude plugin install superpowers
   claude plugin install context7
   claude plugin install pr-review-toolkit
   claude plugin install code-simplifier
   claude plugin install claude-md-management
   claude plugin install code-review
   claude plugin install skill-creator
   claude plugin install gitlab
   claude plugin install playwright
   claude plugin install security-guidance
   claude plugin install huggingface-skills
   claude plugin install frontend-design
   ```

4. **Register custom marketplaces** (one-time, global)
   ```bash
   claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
   claude plugin marketplace add thedotmack/claude-mem
   claude plugin marketplace add coreyhaines31/marketingskills
   claude plugin marketplace add JuliusBrussee/caveman
   claude plugin marketplace add addyosmani/agent-skills
   ```

5. **Install marketplace plugins**
   ```bash
   claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
   claude plugin install claude-mem@thedotmack
   claude plugin install marketing-skills@marketingskills
   claude plugin install caveman@caveman
   claude plugin install agent-skills@addy-agent-skills
   ```

## Plugin Marketplaces

| Marketplace ID | GitHub Source | Description |
|----------------|---------------|-------------|
| `claude-plugins-official` | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Official Anthropic plugins |
| `ui-ux-pro-max-skill` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UI/UX design intelligence |
| `thedotmack` | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | Community plugins (claude-mem) |
| `marketingskills` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | Marketing skills (CRO, copywriting) |
| `caveman` | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | Ultra-compressed responses |
| `addy-agent-skills` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Addy Osmani's agent skills collection |

## Global Settings

`~/.claude/settings.json` — applied across all projects:

```json
{
  "model": "sonnet"
}
```
