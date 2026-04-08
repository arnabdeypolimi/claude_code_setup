export const GROUPS = [
  {
    id: 'essential',
    label: 'Essential (always installed)',
    hint: 'Git workflow, core plugins — required',
    required: true,
    skills: ['git-operations'],
    plugins: [
      'superpowers@claude-plugins-official',
      'context7@claude-plugins-official',
      'claude-md-management@claude-plugins-official',
      'pr-review-toolkit@claude-plugins-official',
      'code-review@claude-plugins-official',
      'code-simplifier@claude-plugins-official',
    ],
    marketplaceSetup: [
      {
        command: 'claude plugin marketplace add thedotmack thedotmack/claude-plugins',
        install: 'claude plugin install claude-mem --marketplace thedotmack',
        marketplace: { id: 'thedotmack', source: 'thedotmack/claude-plugins' },
        pluginName: 'claude-mem',
        marketplaceFlag: 'thedotmack',
      },
    ],
    copyAgents: true,
    copyTemplates: true,
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    hint: 'MR workflows, glab CLI integration',
    required: false,
    skills: ['gitlab-integration'],
    plugins: ['gitlab@claude-plugins-official'],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    hint: 'PR workflows, gh CLI integration',
    required: false,
    skills: [],
    plugins: ['github@claude-plugins-official'],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'python',
    label: 'Python Development',
    hint: 'Type-first Python, Pydantic, PyTorch Lightning, refactoring',
    required: false,
    skills: [
      'python-best-practices',
      'python-docs',
      'pydantic',
      'pytorch-lightning',
      'code-refactor',
    ],
    plugins: [],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'frontend',
    label: 'Frontend / UI-UX Design',
    hint: '21 Impeccable design skills + Playwright + UI/UX Pro Max',
    required: false,
    skills: [
      'adapt', 'animate', 'arrange', 'audit', 'bolder', 'clarify',
      'colorize', 'critique', 'delight', 'distill', 'extract',
      'frontend-design', 'harden', 'normalize', 'onboard', 'optimize',
      'overdrive', 'polish', 'quieter', 'teach-impeccable', 'typeset',
    ],
    plugins: [
      'frontend-design@claude-plugins-official',
      'playwright@claude-plugins-official',
    ],
    marketplaceSetup: [
      {
        command: 'claude plugin marketplace add ui-ux-pro-max-skill nextlevelbuilder/ui-ux-pro-max-skill',
        install: 'claude plugin install ui-ux-pro-max --marketplace ui-ux-pro-max-skill',
        marketplace: { id: 'ui-ux-pro-max-skill', source: 'nextlevelbuilder/ui-ux-pro-max-skill' },
        pluginName: 'ui-ux-pro-max',
        marketplaceFlag: 'ui-ux-pro-max-skill',
      },
    ],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'research',
    label: 'Research & Academic Writing',
    hint: 'LaTeX, Typst, paper audit, industrial AI research',
    required: false,
    skills: [
      'industrial-ai-research',
      'latex-paper-en',
      'latex-thesis-zh',
      'paper-audit',
      'research-paper-writing',
      'typst-paper',
    ],
    plugins: [],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'ml',
    label: 'AI / Machine Learning',
    hint: 'Hugging Face datasets, training, Gradio, paper lookup',
    required: false,
    skills: [],
    plugins: ['huggingface-skills@claude-plugins-official'],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'diagrams',
    label: 'Diagrams & Docs',
    hint: 'Mermaid diagrams, skill creation guide',
    required: false,
    skills: ['mermaid-diagrams', 'skill-creator'],
    plugins: [],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'remotion',
    label: 'Video / React (Remotion)',
    hint: 'Remotion best practices for video in React',
    required: false,
    skills: ['remotion-best-practices'],
    plugins: [],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
  {
    id: 'security',
    label: 'Security',
    hint: 'Security guidance plugin',
    required: false,
    skills: [],
    plugins: ['security-guidance@claude-plugins-official'],
    marketplaceSetup: [],
    copyAgents: false,
    copyTemplates: false,
  },
];

export function getGroupById(id) {
  return GROUPS.find(g => g.id === id);
}

export function resolveInstallPlan(selectedGroupIds) {
  const skills = new Set();
  const plugins = new Set();
  const marketplaceSetup = [];
  let copyAgents = false;
  let copyTemplates = false;

  for (const id of selectedGroupIds) {
    const group = getGroupById(id);
    if (!group) continue;
    group.skills.forEach(s => skills.add(s));
    group.plugins.forEach(p => plugins.add(p));
    group.marketplaceSetup.forEach(m => {
      marketplaceSetup.push(m);
      // Also add the marketplace plugin key so it appears in settings.json / lock file
      if (m.pluginName && m.marketplaceFlag) {
        plugins.add(`${m.pluginName}@${m.marketplaceFlag}`);
      }
    });
    if (group.copyAgents) copyAgents = true;
    if (group.copyTemplates) copyTemplates = true;
  }

  return {
    skills: [...skills],
    plugins: [...plugins],
    marketplaceSetup,
    copyAgents,
    copyTemplates,
  };
}
