import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagnose } from '../src/doctor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');

test('healthy fixture reports no drift', () => {
  const report = diagnose(path.join(FIXTURES, 'healthy'));
  assert.equal(report.healthy, true);
  assert.deepEqual(report.skillsMissingOnDisk, []);
  assert.deepEqual(report.skillsExtraOnDisk, []);
  assert.deepEqual(report.pluginsMissingFromSettings, []);
  assert.deepEqual(report.pluginsExtraInSettings, []);
});

test('drifted fixture flags missing skill, extra skill, missing plugin, extra plugin', () => {
  const report = diagnose(path.join(FIXTURES, 'drifted'));
  assert.equal(report.healthy, false);
  assert.deepEqual(report.skillsMissingOnDisk, ['git-operations']);
  assert.deepEqual(report.skillsExtraOnDisk, ['python-best-practices']);
  assert.deepEqual(report.pluginsMissingFromSettings, ['code-review@claude-plugins-official']);
  assert.deepEqual(report.pluginsExtraInSettings, ['caveman@JuliusBrussee']);
});

test('missing lock file is reported as a fatal error', () => {
  assert.throws(
    () => diagnose(path.join(FIXTURES, 'does-not-exist')),
    /claude-setup\.lock\.json not found/,
  );
});
