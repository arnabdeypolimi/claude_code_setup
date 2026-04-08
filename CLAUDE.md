# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a portable Claude Code configuration kit. It stores skills, agent definitions, workflows, and project templates that can be copied into new projects to bootstrap a consistent Claude Code setup.

## Repo Conventions

- `.claude/skills/<name>/SKILL.md` — skill prompt content (local custom skills)
- `agents/<type>/<name>.md` — agent definitions (orchestrator and subagents)
- `workflows/<name>.md` — multi-step workflow definitions
- `templates/` — starter files to copy into new projects
  - `CLAUDE.md` — starter project CLAUDE.md
  - `settings.json` — starter `.claude/settings.json`
  - `config.yaml` — master project configuration template
  - `rules.md` — global rules and conventions template
  - `allowlist.yaml` — security permissions template
  - `commit-message.md` — commit message format guide
  - `mr-template.md` — merge request description template
  - `review-template.md` — code review output template

`settings.local.json` files are machine-specific and should **not** be committed to project repos.

## Skill Sources

| Source | Skills |
|--------|--------|
| Custom (this repo) | `git-operations`, `gitlab-integration`, `python-best-practices`, `python-docs`, `pydantic`, `pytorch-lightning`, `mermaid-diagrams`, `remotion-best-practices`, `code-refactor`, `skill-creator` |
| *(source TBD)* | `industrial-ai-research`, `latex-paper-en`, `latex-thesis-zh`, `paper-audit`, `research-paper-writing`, `typst-paper` |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 21 UI/UX skills (`frontend-design`, `animate`, `adapt`, `arrange`, `audit`, `bolder`, `clarify`, `colorize`, `critique`, `delight`, `distill`, `extract`, `harden`, `normalize`, `onboard`, `optimize`, `overdrive`, `polish`, `quieter`, `teach-impeccable`, `typeset`) |

## Deploying to a New Project

### Installer (recommended)

Requires Node.js 18+. Run from inside the target project directory:

```bash
npx github:arnabdeypolimi/claude_code_setup/create-claude-setup
```

Interactively selects skill groups and generates `settings.json`. Prints plugin install commands at the end. To update skills later: `npx create-claude-setup --update`.

The installer lives in `create-claude-setup/`. Run `node scripts/embed-assets.js` from that directory before committing to refresh `assets/` when skills or templates change.

### Manual deploy

```bash
cp templates/CLAUDE.md <project>/
cp templates/settings.json <project>/.claude/
cp templates/config.yaml <project>/.claude/
cp templates/rules.md <project>/.claude/
cp templates/allowlist.yaml <project>/.claude/
```

Then install plugins from inside the project directory:

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

Register custom marketplaces once globally:

```bash
claude plugin marketplace add ui-ux-pro-max-skill nextlevelbuilder/ui-ux-pro-max-skill
claude plugin marketplace add thedotmack thedotmack/claude-plugins
```

Then install marketplace plugins:

```bash
claude plugin install claude-mem --marketplace thedotmack
claude plugin install ui-ux-pro-max --marketplace ui-ux-pro-max-skill
```

## Plugin Marketplaces

| ID | GitHub Source |
|----|--------------|
| `claude-plugins-official` | `anthropics/claude-plugins-official` |
| `ui-ux-pro-max-skill` | `nextlevelbuilder/ui-ux-pro-max-skill` |
| `thedotmack` | `thedotmack/claude-plugins` |

## Global Settings Location

The owner's global Claude settings live at `~/.claude/settings.json`. The model is set to `sonnet` globally. Project-level `settings.json` files can override this per repo.
