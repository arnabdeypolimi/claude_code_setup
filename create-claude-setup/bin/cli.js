#!/usr/bin/env node

import { intro, outro, text, select, multiselect, confirm, spinner, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { GROUPS } from '../src/catalog.js';
import { install, readManifest } from '../src/installer.js';
import { update } from '../src/updater.js';
import { claudeAvailable, installAllPlugins } from '../src/plugin-installer.js';

// Node version check
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error('Node.js 18+ is required. Current version: ' + process.versions.node);
  process.exit(1);
}

const args = process.argv.slice(2);
const isUpdate = args.includes('--update');
const targetArg = args.find(a => !a.startsWith('--'));

const manifest = readManifest();

async function main() {
  intro(pc.bgCyan(pc.black(' Claude Code Setup ')) + pc.dim(` v${manifest.commitSha ?? '1.0.0'}`));

  if (isUpdate) {
    const targetDir = path.resolve(targetArg ?? process.cwd());
    console.log(pc.dim(`  Updating ${targetDir}\n`));
    await update(targetDir);
    outro(pc.green('Update complete!'));
    return;
  }

  // ── Step 1: Target directory ──────────────────────────────────────────────
  const targetRaw = await text({
    message: 'Target project directory',
    placeholder: process.cwd(),
    initialValue: targetArg ?? '',
    validate(v) {
      const resolved = path.resolve(v || process.cwd());
      if (!fs.existsSync(resolved)) return `Directory does not exist: ${resolved}`;
    },
  });
  if (isCancel(targetRaw)) { cancel('Cancelled.'); process.exit(0); }
  const target = path.resolve(targetRaw || process.cwd());

  // ── Step 2: VCS platform ──────────────────────────────────────────────────
  const platform = await select({
    message: 'Version control platform',
    options: [
      { value: 'gitlab', label: 'GitLab' },
      { value: 'github', label: 'GitHub' },
      { value: 'none',   label: 'Neither / Skip' },
    ],
  });
  if (isCancel(platform)) { cancel('Cancelled.'); process.exit(0); }

  // ── Step 3: Skill groups ──────────────────────────────────────────────────
  const groupOptions = GROUPS.map(g => ({
    value: g.id,
    label: g.required ? pc.bold(g.label) : g.label,
    hint: g.hint,
  }));

  const defaultSelections = [
    'essential',
    ...(platform !== 'none' ? [platform] : []),
  ];

  const selectedGroups = await multiselect({
    message: 'Select skill groups to install',
    options: groupOptions,
    initialValues: defaultSelections,
    required: true,
  });
  if (isCancel(selectedGroups)) { cancel('Cancelled.'); process.exit(0); }

  // Always ensure essential is included
  const finalGroups = selectedGroups.includes('essential')
    ? selectedGroups
    : ['essential', ...selectedGroups];

  // ── Step 4: Project name ──────────────────────────────────────────────────
  const projectName = await text({
    message: 'Project name (written into config.yaml)',
    placeholder: path.basename(target),
    initialValue: path.basename(target),
  });
  if (isCancel(projectName)) { cancel('Cancelled.'); process.exit(0); }

  const vcsProvider = platform !== 'none' ? platform : 'git';

  // ── Step 5: Confirm ───────────────────────────────────────────────────────
  const ok = await confirm({
    message: `Install to ${pc.cyan(target)}?`,
  });
  if (isCancel(ok) || !ok) { cancel('Installation cancelled.'); process.exit(0); }

  // ── Install ───────────────────────────────────────────────────────────────
  const s = spinner();
  s.start('Installing...');

  let result;
  try {
    result = await install({
      target,
      selectedGroups: finalGroups,
      projectName: projectName || path.basename(target),
      vcsProvider,
      onProgress: msg => s.message(msg),
    });
  } catch (err) {
    s.stop(pc.red('Installation failed.'));
    console.error(err.message);
    process.exit(1);
  }

  s.stop(pc.green('Done.'));

  // ── Plugin installation ───────────────────────────────────────────────────
  const { plan } = result;
  const hasPlugins = plan.plugins.length > 0 || plan.marketplaceSetup.length > 0;

  if (hasPlugins) {
    const canAutoInstall = claudeAvailable();

    let autoInstall = false;
    if (canAutoInstall) {
      const choice = await confirm({
        message: `Auto-install ${plan.plugins.length + plan.marketplaceSetup.length} plugin(s) via \`claude plugin install\`?`,
        initialValue: true,
      });
      autoInstall = !isCancel(choice) && choice;
    }

    if (autoInstall) {
      const ps = spinner();
      ps.start('Installing plugins...');

      const pluginResults = installAllPlugins({
        plugins: plan.plugins,
        marketplaceSetup: plan.marketplaceSetup,
        targetDir: target,
        onProgress: (name, status) => ps.message(`  ${name}: ${status}`),
      });

      const failed = pluginResults.filter(r => !r.ok);
      ps.stop(failed.length === 0
        ? pc.green(`Installed ${pluginResults.length} plugin(s).`)
        : pc.yellow(`${pluginResults.length - failed.length}/${pluginResults.length} plugins installed.`));

      if (failed.length > 0) {
        console.log(pc.yellow('\n  Failed plugins (install manually inside Claude Code):'));
        for (const { plugin, error } of failed) {
          console.log(pc.yellow(`    claude plugin install ${plugin}`));
          if (error) console.log(pc.dim(`      ${error}`));
        }
        console.log('');
      }
    } else {
      // Print commands for manual install
      console.log('');
      if (!canAutoInstall) {
        console.log(pc.dim('  `claude` CLI not found — install plugins manually inside Claude Code:'));
      } else {
        console.log(pc.dim('  Run these commands inside Claude Code in your project directory:'));
      }
      console.log('');
      for (const { command, install: installCmd } of plan.marketplaceSetup) {
        console.log(pc.yellow(`  ${command}`));
        console.log(pc.yellow(`  ${installCmd}`));
      }
      for (const plugin of plan.plugins) {
        console.log(pc.cyan(`  claude plugin install ${plugin.split('@')[0]}`));
      }
      console.log('');
    }
  }

  // Skill summary
  console.log(pc.dim(`  Installed ${plan.skills.length} skill(s) across ${finalGroups.length} group(s)`));
  if (plan.copyAgents) console.log(pc.dim('  Copied agents and workflows'));
  if (plan.copyTemplates) console.log(pc.dim('  Copied config templates'));
  console.log('');

  outro(pc.green('Claude Code setup complete!') + pc.dim('\n  To update later: npx create-claude-setup --update'));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
