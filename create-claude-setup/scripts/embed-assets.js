#!/usr/bin/env node
/**
 * Copies source files from the parent repo into assets/.
 * Run from within create-claude-setup/ before committing or publishing.
 * Not distributed with the package.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PKG_DIR = path.dirname(SCRIPT_DIR);
const REPO_ROOT = path.dirname(PKG_DIR);
const ASSETS_DIR = path.join(PKG_DIR, 'assets');

// Wipe and recreate assets/
fs.rmSync(ASSETS_DIR, { recursive: true, force: true });
fs.mkdirSync(ASSETS_DIR, { recursive: true });

function copyDir(srcName, srcPath, destPath) {
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`  Copied ${srcName}`);
  } else {
    console.warn(`  Warning: ${srcName} not found at ${srcPath}`);
  }
}

copyDir('skills/',    path.join(REPO_ROOT, '.claude', 'skills'), path.join(ASSETS_DIR, 'skills'));
copyDir('templates/', path.join(REPO_ROOT, 'templates'),          path.join(ASSETS_DIR, 'templates'));
copyDir('agents/',    path.join(REPO_ROOT, 'agents'),             path.join(ASSETS_DIR, 'agents'));
copyDir('workflows/', path.join(REPO_ROOT, 'workflows'),          path.join(ASSETS_DIR, 'workflows'));

// Count skills
const skillsDest = path.join(ASSETS_DIR, 'skills');
const skillCount = fs.existsSync(skillsDest)
  ? fs.readdirSync(skillsDest).filter(f => fs.statSync(path.join(skillsDest, f)).isDirectory()).length
  : 0;

const templatesDest = path.join(ASSETS_DIR, 'templates');
const templateCount = fs.existsSync(templatesDest) ? fs.readdirSync(templatesDest).length : 0;

// Get git commit SHA (no user input — safe to use execFileSync)
let commitSha = 'unknown';
try {
  commitSha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO_ROOT }).toString().trim();
} catch {
  commitSha = `local-${Date.now()}`;
}

const manifest = {
  commitSha,
  generatedAt: new Date().toISOString(),
  skillCount,
  templateCount,
};
fs.writeFileSync(path.join(ASSETS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`\n  manifest.json written (sha: ${commitSha}, skills: ${skillCount}, templates: ${templateCount})`);
console.log('  Done. assets/ is ready to commit.');
