import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { install } from '../src/installer.js';

test('installer writes settings.json, lock, and skills into a fresh dir', async () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-it-'));

  const result = await install({
    target,
    selectedGroups: ['essential'],
    projectName: 'integration-test',
    vcsProvider: 'github',
  });

  // Plan exists
  assert.ok(result.plan, 'install() returned a plan');
  assert.ok(result.plan.skills.includes('git-operations'), 'essential skill copied');

  // Files exist
  assert.ok(fs.existsSync(path.join(target, '.claude', 'settings.json')), 'settings.json written');
  assert.ok(fs.existsSync(path.join(target, 'claude-setup.lock.json')), 'lock file written');
  assert.ok(
    fs.existsSync(path.join(target, '.claude', 'skills', 'git-operations', 'SKILL.md')),
    'git-operations skill copied',
  );

  // Settings is valid JSON with expected shape
  const settings = JSON.parse(
    fs.readFileSync(path.join(target, '.claude', 'settings.json'), 'utf8'),
  );
  assert.equal(typeof settings.enabledPlugins, 'object');
  assert.equal(settings.enabledPlugins['superpowers@claude-plugins-official'], true);

  fs.rmSync(target, { recursive: true, force: true });
});
