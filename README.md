# Claude Code Setup

Personal Claude Code configuration kit — skills, plugins, hooks, and settings for bootstrapping new projects.

## What's Inside

| Type | Purpose |
|------|---------|
| **Skills** | Custom slash-command prompts (SKILL.md files) |
| **Plugins** | Installed plugin registry and hooks |
| **Templates** | Starter `CLAUDE.md` and `settings.json` for new projects |
| **Settings** | Global model config and marketplace sources |
| **Docs** | Notes on setup, conventions, and usage |

## Repo Structure

```
claude_code_setup/
├── README.md
├── .claude/
│   ├── settings.json          # Global settings template (model, marketplaces)
│   └── settings.local.json    # Local permission overrides (not committed to projects)
├── skills/                    # Custom skill definitions
│   └── my-skill/
│       └── SKILL.md           # Skill prompt content
├── plugins/                   # Plugin hooks and configs
├── templates/
│   ├── CLAUDE.md              # Starter project CLAUDE.md
│   └── settings.json          # Starter project settings.json
└── docs/                      # Setup notes and references
```

## Quick Start for a New Project

1. **Clone this repo**
   ```bash
   git clone https://github.com/arnabdeypolimi/claude_code_setup.git
   ```

2. **Copy configs into your new project**
   ```bash
   cp claude_code_setup/templates/CLAUDE.md <your-project>/
   cp claude_code_setup/templates/settings.json <your-project>/.claude/
   ```

3. **Install recommended plugins** (inside your new project directory)
   ```bash
   claude plugin install superpowers
   claude plugin install context7
   claude plugin install pr-review-toolkit
   claude plugin install code-simplifier
   claude plugin install claude-md-management
   ```

4. **Register custom marketplaces** (one-time, global)
   ```bash
   claude plugin marketplace add ui-ux-pro-max-skill nextlevelbuilder/ui-ux-pro-max-skill
   ```

## Plugin Marketplaces

| Marketplace ID | Source | Description |
|----------------|--------|-------------|
| `claude-plugins-official` | `anthropics/claude-plugins-official` | Official Anthropic plugins |
| `ui-ux-pro-max-skill` | `nextlevelbuilder/ui-ux-pro-max-skill` | UI/UX design intelligence skill |

### Recommended Plugins

| Plugin | Marketplace | Purpose |
|--------|-------------|---------|
| `superpowers` | claude-plugins-official | Hooks, session automation |
| `context7` | claude-plugins-official | Live library documentation lookup |
| `pr-review-toolkit` | claude-plugins-official | Pull request review workflows |
| `code-simplifier` | claude-plugins-official | Code quality and simplification |
| `claude-md-management` | claude-plugins-official | CLAUDE.md file management |
| `ui-ux-pro-max` | ui-ux-pro-max-skill | UI/UX design system search |

## Global Settings

`~/.claude/settings.json` — applied across all projects:

```json
{
  "model": "sonnet",
  "extraKnownMarketplaces": {
    "ui-ux-pro-max-skill": {
      "source": {
        "source": "github",
        "repo": "nextlevelbuilder/ui-ux-pro-max-skill"
      }
    }
  }
}
```

## Adding New Skills or Plugins

1. **New skill** — create `skills/<skill-name>/SKILL.md` with the prompt content, then reference it in your project's `settings.json` under `enabledPlugins`.

2. **New plugin config** — add hook definitions or MCP server configs under `plugins/<plugin-name>/`.

3. **New template** — add starter files to `templates/` and document them here.

4. Commit and push — configs are available the next time you clone this repo into a new machine or project.
