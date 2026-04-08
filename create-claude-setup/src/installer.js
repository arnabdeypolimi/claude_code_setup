import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveInstallPlan } from './catalog.js';
import { mergeSettings } from './settings-merger.js';
import { buildLock, writeLock, hashFile } from './lockfile.js';

const PKG_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ASSETS_DIR = path.join(PKG_DIR, 'assets');

export function readManifest() {
  const p = path.join(ASSETS_DIR, 'manifest.json');
  if (!fs.existsSync(p)) return { commitSha: 'unknown', generatedAt: 'unknown' };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export async function install({ target, selectedGroups, projectName, vcsProvider, onProgress }) {
  const plan = resolveInstallPlan(selectedGroups);
  const manifest = readManifest();

  const claudeDir = path.join(target, '.claude');
  const skillsDir = path.join(claudeDir, 'skills');

  // 1. Ensure destination directories exist
  fs.mkdirSync(skillsDir, { recursive: true });
  if (plan.copyAgents) {
    fs.mkdirSync(path.join(claudeDir, 'agents', 'orchestrator'), { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'agents', 'subagents'), { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'workflows'), { recursive: true });
  }
  if (plan.copyTemplates) {
    fs.mkdirSync(path.join(claudeDir, 'templates'), { recursive: true });
  }

  const installedSkills = {};

  // 2. Copy skills (skip if already exists)
  for (const skillName of plan.skills) {
    const src = path.join(ASSETS_DIR, 'skills', skillName);
    const dest = path.join(skillsDir, skillName);

    if (!fs.existsSync(src)) continue;

    if (!fs.existsSync(dest)) {
      fs.cpSync(src, dest, { recursive: true });
    }

    // Hash the SKILL.md for lock tracking
    const skillMd = path.join(dest, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      const h = hashFile(skillMd);
      const assetSkillMd = path.join(src, 'SKILL.md');
      const assetHash = fs.existsSync(assetSkillMd) ? hashFile(assetSkillMd) : h;
      installedSkills[skillName] = {
        assetHash,
        installedHash: h,
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    onProgress?.(`  Copied skill: ${skillName}`);
  }

  // 3. Copy agents and workflows
  if (plan.copyAgents) {
    const agentsSrc = path.join(ASSETS_DIR, 'agents');
    const agentsDest = path.join(claudeDir, 'agents');
    if (fs.existsSync(agentsSrc)) {
      fs.cpSync(agentsSrc, agentsDest, { recursive: true, force: false });
      onProgress?.('  Copied agents');
    }

    const workflowsSrc = path.join(ASSETS_DIR, 'workflows');
    const workflowsDest = path.join(claudeDir, 'workflows');
    if (fs.existsSync(workflowsSrc)) {
      fs.cpSync(workflowsSrc, workflowsDest, { recursive: true, force: false });
      onProgress?.('  Copied workflows');
    }
  }

  // 4. Copy and process templates
  const installedTemplates = [];
  if (plan.copyTemplates) {
    const templateFiles = {
      'config.yaml': path.join(claudeDir, 'config.yaml'),
      'rules.md': path.join(claudeDir, 'rules.md'),
      'allowlist.yaml': path.join(claudeDir, 'allowlist.yaml'),
      'commit-message.md': path.join(claudeDir, 'templates', 'commit-message.md'),
      'mr-template.md': path.join(claudeDir, 'templates', 'mr-template.md'),
      'review-template.md': path.join(claudeDir, 'templates', 'review-template.md'),
    };

    for (const [srcName, destPath] of Object.entries(templateFiles)) {
      const srcPath = path.join(ASSETS_DIR, 'templates', srcName);
      if (!fs.existsSync(srcPath) || fs.existsSync(destPath)) continue;

      let content = fs.readFileSync(srcPath, 'utf8');

      // Token replacement for config.yaml
      if (srcName === 'config.yaml') {
        content = applyTokens(content, projectName, vcsProvider);
      }

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content, 'utf8');
      installedTemplates.push(srcName);
    }

    onProgress?.('  Copied templates');
  }

  // 5. Generate settings.json
  const settings = mergeSettings(target, plan.plugins);
  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  onProgress?.('  Wrote settings.json');

  // 6. Write lock file
  const lock = buildLock({
    kitVersion: manifest.commitSha,
    selectedGroups,
    projectName,
    vcsProvider,
    installedSkills,
    enabledPlugins: plan.plugins,
    installedTemplates,
  });
  writeLock(target, lock);
  onProgress?.('  Wrote claude-setup.lock.json');

  return { plan, lock };
}

function applyTokens(content, projectName, vcsProvider) {
  const vcsCli = vcsProvider === 'github' ? 'gh' : vcsProvider === 'gitlab' ? 'glab' : vcsProvider;

  // Replace placeholder project name (various common patterns in config.yaml)
  content = content.replace(/name:\s*["']?thg-demo-2026["']?/g, `name: "${projectName}"`);
  content = content.replace(/name:\s*["']?my-project["']?/g, `name: "${projectName}"`);

  // Replace VCS provider
  content = content.replace(/platform:\s*["']?gitlab["']?/g, `platform: "${vcsProvider}"`);
  content = content.replace(/provider:\s*["']?gitlab["']?/g, `provider: "${vcsProvider}"`);
  content = content.replace(/cli:\s*["']?glab["']?/g, `cli: "${vcsCli}"`);

  return content;
}
