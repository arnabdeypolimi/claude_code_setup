# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a portable Claude Code configuration kit. It stores skills, plugin configs, hooks, and project templates that can be copied into new projects to bootstrap a consistent Claude Code setup.

## Repo Conventions

- `skills/<name>/SKILL.md` — skill prompt content for custom slash commands
- `plugins/<name>/` — hook definitions and MCP server configs
- `templates/CLAUDE.md` — starter CLAUDE.md to copy into new projects
- `templates/settings.json` — starter `.claude/settings.json` for new projects
- `docs/` — setup notes and references

`settings.local.json` files are machine-specific and should **not** be committed to project repos.

## Deploying to a New Project

```bash
cp templates/CLAUDE.md <project>/
cp templates/settings.json <project>/.claude/
```

Then install plugins from inside the project directory:

```bash
claude plugin install superpowers
claude plugin install context7
claude plugin install pr-review-toolkit
claude plugin install code-simplifier
claude plugin install claude-md-management
```

Register the custom marketplace once globally:

```bash
claude plugin marketplace add ui-ux-pro-max-skill nextlevelbuilder/ui-ux-pro-max-skill
```

## Plugin Marketplaces

| ID | GitHub Source |
|----|--------------|
| `claude-plugins-official` | `anthropics/claude-plugins-official` |
| `ui-ux-pro-max-skill` | `nextlevelbuilder/ui-ux-pro-max-skill` |

## Global Settings Location

The owner's global Claude settings live at `~/.claude/settings.json`. The model is set to `sonnet` globally. Project-level `settings.json` files can override this per repo.
