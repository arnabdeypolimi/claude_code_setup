import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * The `addyosmani/agent-skills` marketplace.json declares its only plugin
 * with `source: { source: "github", repo: "addyosmani/agent-skills" }`,
 * which makes Claude Code re-clone via SSH (`git@github.com:`). On machines
 * without GitHub SSH keys that fails. The plugin lives in the same repo as
 * the marketplace, so rewriting the entry to `source: "./"` lets the CLI
 * reuse the already-cloned marketplace checkout.
 */
function patchAddyAgentSkillsMarketplace() {
  const path = join(
    homedir(),
    '.claude/plugins/marketplaces/addy-agent-skills/.claude-plugin/marketplace.json'
  );
  if (!existsSync(path)) return;
  const raw = readFileSync(path, 'utf8');
  const data = JSON.parse(raw);
  let changed = false;
  for (const plugin of data.plugins ?? []) {
    if (plugin?.name === 'agent-skills' && typeof plugin.source === 'object') {
      plugin.source = './';
      changed = true;
    }
  }
  if (changed) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Check whether the `claude` CLI is available in PATH.
 */
export function claudeAvailable() {
  try {
    execFileSync('claude', ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Install a single plugin via `claude plugin install <name>`.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export function installPlugin(pluginName, targetDir) {
  try {
    execFileSync('claude', ['plugin', 'install', pluginName], {
      cwd: targetDir,
      stdio: 'pipe',
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.stderr?.toString().trim() ?? err.message };
  }
}

/**
 * Register a marketplace via `claude plugin marketplace add <source>`.
 * The CLI registers it under the marketplace's self-declared name; the
 * caller's `id` is retained only for logging/display.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export function addMarketplace(id, source, targetDir) {
  try {
    execFileSync('claude', ['plugin', 'marketplace', 'add', source], {
      cwd: targetDir,
      stdio: 'pipe',
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.stderr?.toString().trim() ?? err.message };
  }
}

/**
 * Install all plugins for a resolved plan.
 * Calls onProgress(pluginName, status) after each attempt.
 *
 * marketplaceSetup entries: { command, install, marketplace: { id, source }, pluginName }
 * plugins: array of 'name@marketplace' keys
 */
export function installAllPlugins({ plugins, marketplaceSetup, targetDir, onProgress }) {
  const results = [];

  // 1. Marketplace registrations first
  for (const { marketplace } of marketplaceSetup) {
    if (!marketplace) continue;
    const r = addMarketplace(marketplace.id, marketplace.source, targetDir);
    onProgress?.(`marketplace:${marketplace.id}`, r.ok ? 'ok' : `failed: ${r.error}`);
    if (r.ok && marketplace.id === 'addy-agent-skills') {
      patchAddyAgentSkillsMarketplace();
    }
  }

  // 2. Marketplace plugins (from marketplaceSetup) — Claude Code expects `plugin@marketplace`
  for (const { pluginName, marketplaceFlag } of marketplaceSetup) {
    if (!pluginName) continue;
    const installArg = marketplaceFlag ? `${pluginName}@${marketplaceFlag}` : pluginName;
    try {
      execFileSync('claude', ['plugin', 'install', installArg], { cwd: targetDir, stdio: 'pipe' });
      results.push({ plugin: pluginName, ok: true });
      onProgress?.(pluginName, 'ok');
    } catch (err) {
      const error = err.stderr?.toString().trim() ?? err.message;
      results.push({ plugin: pluginName, ok: false, error });
      onProgress?.(pluginName, `failed: ${error}`);
    }
  }

  // 3. Standard plugins (skip any already handled via marketplaceSetup)
  const handledViaMarketplace = new Set(
    marketplaceSetup
      .filter(m => m.pluginName && m.marketplaceFlag)
      .map(m => `${m.pluginName}@${m.marketplaceFlag}`)
  );

  for (const pluginKey of plugins) {
    if (handledViaMarketplace.has(pluginKey)) continue;
    const pluginName = pluginKey.split('@')[0];
    const r = installPlugin(pluginName, targetDir);
    results.push({ plugin: pluginName, ...r });
    onProgress?.(pluginName, r.ok ? 'ok' : `failed: ${r.error}`);
  }

  return results;
}
