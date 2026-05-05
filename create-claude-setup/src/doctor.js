import fs from 'node:fs';
import path from 'node:path';

/**
 * Diagnose drift between claude-setup.lock.json and the project's
 * actual .claude/ directory.
 *
 * Returns a plain report object. No console output, no exit codes —
 * the CLI layer decides how to render and what to exit with.
 */
export function diagnose(projectDir) {
  const lockPath = path.join(projectDir, 'claude-setup.lock.json');
  if (!fs.existsSync(lockPath)) {
    throw new Error(`claude-setup.lock.json not found at ${lockPath}`);
  }
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

  const skillsDir = path.join(projectDir, '.claude', 'skills');
  const settingsPath = path.join(projectDir, '.claude', 'settings.json');

  // ---- Skills drift ----
  const expectedSkills = new Set(Object.keys(lock.installedSkills ?? {}));
  const actualSkills = new Set(
    fs.existsSync(skillsDir)
      ? fs.readdirSync(skillsDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name)
      : [],
  );

  const skillsMissingOnDisk = [...expectedSkills].filter(s => !actualSkills.has(s)).sort();
  const skillsExtraOnDisk = [...actualSkills].filter(s => !expectedSkills.has(s)).sort();

  // ---- Plugin drift ----
  const expectedPlugins = new Set(lock.enabledPlugins ?? []);
  let actualPlugins = new Set();
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    actualPlugins = new Set(
      Object.entries(settings.enabledPlugins ?? {})
        .filter(([, enabled]) => enabled === true)
        .map(([name]) => name),
    );
  }

  const pluginsMissingFromSettings = [...expectedPlugins].filter(p => !actualPlugins.has(p)).sort();
  const pluginsExtraInSettings = [...actualPlugins].filter(p => !expectedPlugins.has(p)).sort();

  const healthy =
    skillsMissingOnDisk.length === 0 &&
    skillsExtraOnDisk.length === 0 &&
    pluginsMissingFromSettings.length === 0 &&
    pluginsExtraInSettings.length === 0;

  return {
    healthy,
    skillsMissingOnDisk,
    skillsExtraOnDisk,
    pluginsMissingFromSettings,
    pluginsExtraInSettings,
  };
}
