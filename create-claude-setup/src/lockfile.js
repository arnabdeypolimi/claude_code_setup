import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LOCK_FILENAME = 'claude-setup.lock.json';

export function readLock(targetDir) {
  const p = path.join(targetDir, LOCK_FILENAME);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function writeLock(targetDir, lockData) {
  const p = path.join(targetDir, LOCK_FILENAME);
  fs.writeFileSync(p, JSON.stringify(lockData, null, 2) + '\n', 'utf8');
}

export function hashFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function buildLock({ kitVersion, selectedGroups, projectName, vcsProvider, installedSkills, enabledPlugins, installedTemplates }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: '1',
    kitVersion,
    installedAt: now,
    lastUpdated: now,
    selectedGroups,
    projectName,
    vcsProvider,
    installedSkills,
    enabledPlugins,
    installedTemplates,
  };
}

export function updateLock(existing, updates) {
  return {
    ...existing,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
}
