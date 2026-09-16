# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [1.2.0] — 2026-09-16

### Added
- Installer: optional **Headroom (Context Compression)** group for [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom). If `uv` is on PATH, offers to run `uv tool install --python 3.13 "headroom-ai[all]"` (defaults to No; installs machine-wide); otherwise prints the command.
- Installer: `toolSetup` group field for external CLI tools (`src/tool-installer.js`).
- Installer: **Ponytail (Lazy Senior Dev)** group — [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) plugin marketplace.
- Research & Academic Writing group now installs the [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) marketplace plugin.

### Changed
- `create-claude-setup` package version → `1.2.0`.
- Root package version → `1.2.0`.

## [1.1.1] — 2026-05-05

### Changed
- Refactor.

## [1.1.0] — 2026-05-05

### Added
- `doctor` subcommand: diagnoses drift between `claude-setup.lock.json` and the project's `.claude/` directory. Reports missing/extra skills and plugins; exits non-zero on drift.
- MIT LICENSE.
- GitHub Actions CI: runs `node:test` suite on Node 18 + 20, validates JSON config files, syntax-checks the installer.
- PR template and issue templates (bug, skill request).
- README badges (release, license, Node version, CI status) and `doctor` usage section.
- Test infrastructure using built-in `node:test` (no new runtime deps).

### Changed
- `create-claude-setup` package version → `1.1.0`.
- Root package version → `1.1.0`.

## [1.0.0] — 2026-05-05

### Added
- Initial release. Installer, skills, agents, workflows, templates, AI-engineer-positioned README, logo, plugin/marketplace catalog.
