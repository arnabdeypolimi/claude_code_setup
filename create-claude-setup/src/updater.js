import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { multiselect, select, spinner, isCancel } from '@clack/prompts';
import { readLock, writeLock, hashFile, updateLock } from './lockfile.js';
import { resolveInstallPlan, getGroupById } from './catalog.js';

const PKG_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ASSETS_DIR = path.join(PKG_DIR, 'assets');

export async function update(targetDir) {
  // 1. Read lock file
  const lock = readLock(targetDir);
  if (!lock) {
    console.error('No claude-setup.lock.json found. Run without --update for a fresh install.');
    process.exit(1);
  }

  // 2. Read current package manifest
  const manifestPath = path.join(ASSETS_DIR, 'manifest.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { commitSha: 'unknown' };

  if (lock.kitVersion === manifest.commitSha) {
    console.log('Already up to date.');
    return;
  }

  console.log(`  Kit version at install : ${lock.kitVersion}`);
  console.log(`  Current kit version    : ${manifest.commitSha}`);

  // 3. Resolve expected skills for installed groups
  const plan = resolveInstallPlan(lock.selectedGroups);
  const installedSkillNames = new Set(Object.keys(lock.installedSkills ?? {}));

  const toUpdate = [];
  const toAdd = [];

  for (const skillName of plan.skills) {
    const assetSkillMd = path.join(ASSETS_DIR, 'skills', skillName, 'SKILL.md');
    if (!fs.existsSync(assetSkillMd)) continue;

    const currentAssetHash = hashFile(assetSkillMd);

    if (!installedSkillNames.has(skillName)) {
      toAdd.push({ skillName, currentAssetHash });
    } else {
      const lockEntry = lock.installedSkills[skillName];
      if (lockEntry.assetHash !== currentAssetHash) {
        toUpdate.push({ skillName, currentAssetHash, lockEntry });
      }
    }
  }

  if (toUpdate.length === 0 && toAdd.length === 0) {
    console.log('Skills are up to date.');
    checkPluginDiff(lock, plan);
    return;
  }

  // 4. Multiselect — what to update
  const options = [
    ...toUpdate.map(({ skillName }) => ({
      value: skillName,
      label: `Update: ${skillName}`,
      hint: 'content changed upstream',
    })),
    ...toAdd.map(({ skillName }) => ({
      value: skillName,
      label: `Add: ${skillName}`,
      hint: 'new skill in group',
    })),
  ];

  const selected = await multiselect({
    message: 'Select updates to apply',
    options,
    initialValues: options.map(o => o.value),
    required: false,
  });

  if (isCancel(selected) || selected.length === 0) {
    console.log('No updates applied.');
    return;
  }

  // 5. Detect conflicts and apply
  const s = spinner();
  s.start('Applying updates...');

  const updatedSkills = { ...(lock.installedSkills ?? {}) };

  for (const skillName of selected) {
    const assetSkillMd = path.join(ASSETS_DIR, 'skills', skillName, 'SKILL.md');
    const destDir = path.join(targetDir, '.claude', 'skills', skillName);
    const destSkillMd = path.join(destDir, 'SKILL.md');
    const currentAssetHash = hashFile(assetSkillMd);

    if (fs.existsSync(destSkillMd)) {
      const onDiskHash = hashFile(destSkillMd);
      const lockEntry = lock.installedSkills?.[skillName];
      const wasModifiedLocally = lockEntry && onDiskHash !== lockEntry.installedHash;

      if (wasModifiedLocally) {
        s.stop('');
        const action = await select({
          message: `${skillName}/SKILL.md was modified locally. What do you want to do?`,
          options: [
            { value: 'backup', label: 'Backup local version and install new' },
            { value: 'skip', label: 'Keep local version (skip this file)' },
            { value: 'overwrite', label: 'Overwrite with new version (lose local changes)' },
          ],
        });

        if (isCancel(action) || action === 'skip') {
          s.start('Applying updates...');
          continue;
        }

        if (action === 'backup') {
          const ts = Math.floor(Date.now() / 1000);
          fs.copyFileSync(destSkillMd, `${destSkillMd}.bak.${ts}`);
        }

        s.start('Applying updates...');
      }
    }

    // Copy the full skill directory from assets
    const assetSkillDir = path.join(ASSETS_DIR, 'skills', skillName);
    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(assetSkillDir, destDir, { recursive: true, force: true });

    const newInstalledHash = hashFile(destSkillMd);
    updatedSkills[skillName] = {
      assetHash: currentAssetHash,
      installedHash: newInstalledHash,
      installedAt: lock.installedSkills?.[skillName]?.installedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  s.stop('Updates applied.');

  // 6. Refresh lock file
  const updatedLock = updateLock(lock, {
    kitVersion: manifest.commitSha,
    installedSkills: updatedSkills,
  });
  writeLock(targetDir, updatedLock);

  // 7. Plugin diff
  checkPluginDiff(lock, plan);
}

function checkPluginDiff(lock, plan) {
  const installed = new Set(lock.enabledPlugins ?? []);
  const newPlugins = plan.plugins.filter(p => !installed.has(p));

  if (newPlugins.length > 0) {
    console.log('\n  New plugins available for your selected groups:');
    for (const p of newPlugins) {
      console.log(`    claude plugin install ${p.split('@')[0]}`);
    }
  }
}
