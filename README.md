<p align="left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <img src="assets/logo.svg" alt="Claude Code Setup — for AI engineers" width="420">
  </picture>
</p>

<p align="left">
  <a href="https://github.com/arnabdeypolimi/claude_code_setup/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/arnabdeypolimi/claude_code_setup?color=DA7757"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-DA7757"></a>
  <img alt="Node 18+" src="https://img.shields.io/badge/node-%E2%89%A518-DA7757">
  <a href="https://github.com/arnabdeypolimi/claude_code_setup/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/arnabdeypolimi/claude_code_setup/actions/workflows/ci.yml/badge.svg"></a>
</p>

# Claude Code Setup for AI Engineers

A portable Claude Code configuration kit built for AI engineers — model training, research, prototyping, and shipping ML systems. One `npx` command bootstraps a project with the skills, agents, workflows, and plugins you actually use day-to-day.

> Not a generic dev kit. The defaults are tuned for ML/research work: PyTorch Lightning, Pydantic, Hugging Face, paper reading and writing (LaTeX/Typst), Python best practices, and end-to-end MR review.

## Why use this

- **AI/ML out of the box** — `huggingface-skills`, `pytorch-lightning`, `pydantic`, `python-best-practices`, `code-refactor` configured and ready.
- **Research workflow built in** — `latex-paper-en`, `latex-thesis-zh`, `typst-paper`, `research-paper-writing`, `paper-audit`, `industrial-ai-research`.
- **Reproducible setups** — every project gets the same `CLAUDE.md`, rules, allowlist, and agent definitions.
- **Multi-agent orchestration** — orchestrator + subagents (feature-developer, test-engineer, code-reviewer, git-manager, ci-validator) that map onto a typical training/prototyping → MR loop.
- **GitLab and GitHub** — pick one in the installer; CI validation and MR review skills wire up automatically.

## Quick start

**Requirements:** Node.js 18+, [Claude Code](https://claude.ai/code) installed.

From inside your project directory:

```bash
npx github:arnabdeypolimi/claude_code_setup
```

The installer asks for:
1. Target directory
2. VCS platform (GitLab / GitHub / Neither)
3. Skill groups to install (Essential is always included)
4. Project name

If `claude` is on your PATH, plugins auto-install. Otherwise the exact commands are printed.

To update skills later:

```bash
npx github:arnabdeypolimi/claude_code_setup --update
```

The updater detects changed/added skills, shows a multiselect, and resolves local edit conflicts (backup / overwrite / skip).

## Diagnose drift — `doctor`

After install, your project has a `claude-setup.lock.json` that records which skills and plugins were set up. `doctor` checks that nothing has drifted:

```bash
npx github:arnabdeypolimi/claude_code_setup doctor
```

It reports:
- Skills listed in the lock but missing from `.claude/skills/`
- Skills present on disk but not in the lock
- Plugins enabled in the lock but missing from `.claude/settings.json`
- Plugins enabled in `.claude/settings.json` but not in the lock

Exits non-zero if drift is found, so it's safe to run in CI.

## AI engineer workflows

Concrete things you can do once installed:

| You want to... | Skills / plugins that fire |
|----------------|---------------------------|
| Fine-tune a model on HF Jobs | `huggingface-skills:huggingface-llm-trainer`, `huggingface-vision-trainer`, `huggingface-trackio` |
| Pick the right model for a task | `huggingface-skills:huggingface-best`, `huggingface-local-models` |
| Wire training code into Lightning | `pytorch-lightning`, `python-best-practices` |
| Add typed validation to a serving API | `pydantic`, `python-best-practices` |
| Read and summarize a paper | `huggingface-skills:huggingface-papers`, `paper-audit` |
| Write or polish a paper (LaTeX / Typst) | `latex-paper-en`, `latex-thesis-zh`, `typst-paper`, `research-paper-writing` |
| Research a domain (e.g. industrial AI) | `industrial-ai-research` |
| Run a structured MR review | `pr-review-toolkit`, `code-review`, `code-simplifier` |
| Refactor legacy Python to current standards | `code-refactor` |
| Diagram a system or training pipeline | `mermaid-diagrams` |
| Build a Gradio demo | `huggingface-skills:huggingface-gradio` |
| Run Transformers in JS / browser | `huggingface-skills:transformers-js` |

## What's inside

| Type | Location | Purpose |
|------|----------|---------|
| Skills | `.claude/skills/` | Custom slash-command prompts |
| Agents | `agents/` | Orchestrator and subagent definitions |
| Workflows | `workflows/` | Multi-step workflow definitions |
| Templates | `templates/` | Starter configs to copy into new projects |
| Settings | `.claude/settings.json` | Global model config and enabled plugins |

## Skills

### AI / ML / data

| Skill | Description |
|-------|-------------|
| `pytorch-lightning` | Organize PyTorch into LightningModules, multi-GPU/TPU, DDP/FSDP/DeepSpeed |
| `pydantic` | v2 validation for APIs, settings, ORM models — Rust-powered core |
| `python-best-practices` | Type-first development with dataclasses, discriminated unions, Protocol |
| `python-docs` | Generate and sync API references and Mermaid architecture diagrams |
| `code-refactor` | Refactor Python to repo coding standards (best-practices + Pydantic v2 + Lightning) |

Plus the full **`huggingface-skills`** plugin: `huggingface-llm-trainer`, `huggingface-vision-trainer`, `huggingface-best`, `huggingface-local-models`, `huggingface-datasets`, `huggingface-trackio`, `huggingface-gradio`, `huggingface-papers`, `huggingface-paper-publisher`, `huggingface-community-evals`, `huggingface-tool-builder`, `transformers-js`, `hf-cli`.

### Research and academic

| Skill | Description |
|-------|-------------|
| `industrial-ai-research` | Literature research for industrial AI (anomaly detection, predictive maintenance, scheduling) |
| `latex-paper-en` | English LaTeX paper assistant — compile, grammar, logic, de-AI, translation |
| `latex-thesis-zh` | Chinese LaTeX thesis — GB/T 7714, thuthesis/pkuthss, structure review |
| `paper-audit` | Multi-agent paper review — critical, domain, literature, methodology reviewers |
| `research-paper-writing` | ML/CV/NLP paper writing — intro, abstract, method, experiments guides |
| `typst-paper` | Typst academic paper assistant — same coverage as `latex-paper-en` for Typst |

### Engineering and ops

| Skill | Description |
|-------|-------------|
| `git-operations` | Git branch, commit, rebase, stash patterns |
| `gitlab-integration` | `glab` CLI for MRs, issues, CI/CD |
| `mermaid-diagrams` | Class, sequence, flow, ER, C4, state diagrams |
| `remotion-best-practices` | Video creation in React with Remotion |
| `skill-creator` | Guide for creating new skills |

### UI / UX (impeccable)

Source: [pbakaus/impeccable](https://github.com/pbakaus/impeccable). Useful when shipping demos, dashboards, or evaluation UIs around your models.

`frontend-design`, `animate`, `adapt`, `arrange`, `audit`, `bolder`, `clarify`, `colorize`, `critique`, `delight`, `distill`, `extract`, `harden`, `normalize`, `onboard`, `optimize`, `overdrive`, `polish`, `quieter`, `teach-impeccable`, `typeset`.

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

## Skill groups (installer)

| Group | Skills | Plugins |
|-------|--------|---------|
| **Essential** *(always)* | `git-operations` | superpowers, context7, claude-md-management, pr-review-toolkit, code-review, code-simplifier, **claude-mem** |
| GitLab | `gitlab-integration` | gitlab |
| GitHub | — | github |
| Python Development | python-best-practices, python-docs, pydantic, pytorch-lightning, code-refactor | — |
| AI / Machine Learning | — | huggingface-skills |
| Research & Academic | industrial-ai-research, latex-paper-en, latex-thesis-zh, paper-audit, research-paper-writing, typst-paper | **academic-research-skills** |
| Frontend / UI-UX | 21 impeccable skills | frontend-design, playwright, **ui-ux-pro-max** |
| Diagrams & Docs | mermaid-diagrams, skill-creator | — |
| Video / React | remotion-best-practices | — |
| Security | — | security-guidance |
| Marketing | — | **marketing-skills** |
| Caveman Mode | — | **caveman** |
| Agent Skills | — | **agent-skills** |

## Repo layout

```
claude_code_setup/
├── README.md
├── CLAUDE.md
├── create-claude-setup/        # Installer (npx entry point)
├── .claude/
│   ├── settings.json           # Enabled plugins and global model config
│   └── skills/                 # All skill definitions
├── agents/
│   ├── orchestrator/orchestrator.md
│   └── subagents/{feature-developer,test-engineer,code-reviewer,git-manager,ci-validator}.md
├── workflows/
│   ├── feature-workflow.md
│   ├── cascade-mr.md
│   └── mr-review.md
└── templates/
    ├── settings.json           # Starter project settings.json
    ├── config.yaml             # Master project configuration
    ├── rules.md                # Global rules and conventions
    ├── allowlist.yaml          # Security permissions
    ├── commit-message.md       # Commit message format guide
    ├── mr-template.md          # MR description template
    └── review-template.md      # Code review output template
```

## Manual setup

If you'd rather not run the installer:

1. Clone this repo:
   ```bash
   git clone https://github.com/arnabdeypolimi/claude_code_setup.git
   ```

2. Copy templates into your project:
   ```bash
   mkdir -p <your-project>/.claude
   cp claude_code_setup/templates/settings.json <your-project>/.claude/
   cp claude_code_setup/templates/config.yaml <your-project>/.claude/
   cp claude_code_setup/templates/rules.md <your-project>/.claude/
   cp claude_code_setup/templates/allowlist.yaml <your-project>/.claude/
   ```

3. Install plugins from inside Claude Code:
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
   claude plugin install firebase
   ```

4. Register custom marketplaces (one-time, global):
   ```bash
   claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
   claude plugin marketplace add thedotmack/claude-mem
   claude plugin marketplace add coreyhaines31/marketingskills
   claude plugin marketplace add JuliusBrussee/caveman
   claude plugin marketplace add addyosmani/agent-skills
   claude plugin marketplace add Imbad0202/academic-research-skills
   ```

5. Install marketplace plugins:
   ```bash
   claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
   claude plugin install claude-mem@thedotmack
   claude plugin install marketing-skills@marketingskills
   claude plugin install caveman@caveman
   claude plugin install agent-skills@addy-agent-skills
   claude plugin install academic-research-skills@academic-research-skills
   ```

## Plugin marketplaces

| ID | Source | Description |
|----|--------|-------------|
| `claude-plugins-official` | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Official Anthropic plugins |
| `ui-ux-pro-max-skill` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UI/UX design intelligence |
| `thedotmack` | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | claude-mem (cross-session memory) |
| `marketingskills` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | Marketing skills (CRO, copywriting) |
| `caveman` | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | Ultra-compressed responses |
| `addy-agent-skills` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Addy Osmani's agent skills |
| `academic-research-skills` | [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | Academic research pipeline (research → write → review → revise → finalize) |

## Global settings

`~/.claude/settings.json` is applied across all projects. The owner's default:

```json
{ "model": "sonnet" }
```

Project-level `.claude/settings.json` overrides this per repo. `settings.local.json` is machine-specific and is **not** committed.
