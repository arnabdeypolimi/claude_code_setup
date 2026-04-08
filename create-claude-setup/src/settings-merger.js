import fs from 'node:fs';
import path from 'node:path';

export function buildSettings(pluginsToEnable) {
  const enabledPlugins = {};
  for (const key of pluginsToEnable) {
    enabledPlugins[key] = true;
  }
  return {
    permissions: {
      allow: [
        'Bash(git *)',
        'Bash(mkdir *)',
        'Bash(ls *)',
        'Bash(cat *)',
        'Bash(head *)',
        'Bash(tail *)',
        'Bash(tree *)',
        'Bash(pwd)',
      ],
      deny: [
        'Bash(rm -rf /)',
        'Bash(sudo *)',
      ],
    },
    model: 'sonnet',
    enabledPlugins,
    context: {
      include: ['.claude/rules.md', '.claude/config.yaml', 'CLAUDE.md'],
    },
  };
}

export function mergeSettings(targetDir, pluginsToEnable) {
  const settingsPath = path.join(targetDir, '.claude', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    return buildSettings(pluginsToEnable);
  }

  const existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const merged = { ...existing };

  // Merge enabledPlugins additively — never remove existing entries
  merged.enabledPlugins = { ...(existing.enabledPlugins ?? {}) };
  for (const key of pluginsToEnable) {
    merged.enabledPlugins[key] = true;
  }

  return merged;
}
