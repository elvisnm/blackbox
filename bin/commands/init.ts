import * as p from '@clack/prompts';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { readConfig, writeConfig } from '../lib/config.js';
import { checkRepoVisibility } from '../lib/github.js';

export const BLUEPRINT_CATEGORIES = ['feat', 'fix', 'improve', 'hotfix'];

export const FOLDER_STRUCTURE = [
  '.blackbox/blueprints',
  ...BLUEPRINT_CATEGORIES.map(c => `.blackbox/blueprints/${c}`),
  ...BLUEPRINT_CATEGORIES.map(c => `.blackbox/blueprints/assets/${c}`),
  '.blackbox/roles',
];

export function createFolderStructure(projectPath: string): string[] {
  const created: string[] = [];
  for (const folder of FOLDER_STRUCTURE) {
    const fullPath = join(projectPath, folder);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      created.push(folder + '/');
    }
  }
  return created;
}

export function copyTemplate(blackboxRoot: string, projectPath: string): void {
  const templateSrc = join(blackboxRoot, '.blackbox/blueprints/_template.md');
  const templateDest = join(projectPath, '.blackbox/blueprints/_template.md');
  copyFileSync(templateSrc, templateDest);
}

export function copySkills(blackboxRoot: string, destDir: string): string[] {
  const skillFiles = getSkillFiles(blackboxRoot);
  const skillsSourceDir = join(blackboxRoot, '.claude/commands');
  const copied: string[] = [];

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  for (const file of skillFiles) {
    copyFileSync(join(skillsSourceDir, file), join(destDir, file));
    copied.push(file);
  }

  return copied;
}

function isGitRepo(path: string): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: path, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getSkillFiles(blackboxRoot: string): string[] {
  const skillsDir = join(blackboxRoot, '.claude/commands');
  if (!existsSync(skillsDir)) return [];
  return readdirSync(skillsDir).filter(f => f.endsWith('.md'));
}

export async function init(blackboxRoot: string, pathArg?: string) {
  p.intro('Blackbox Installer');

  const templatePath = join(blackboxRoot, '.blackbox/blueprints/_template.md');
  if (!existsSync(templatePath)) {
    p.cancel('Could not find .blackbox/blueprints/_template.md. Are you running from the blackbox repo?');
    process.exit(1);
  }

  let projectPath = pathArg;

  if (!projectPath) {
    const input = await p.text({
      message: 'Project path:',
      placeholder: process.cwd(),
      defaultValue: process.cwd(),
    });

    if (p.isCancel(input)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    projectPath = input;
  }

  projectPath = resolve(projectPath);

  if (!existsSync(projectPath)) {
    p.cancel(`Path does not exist: ${projectPath}`);
    process.exit(1);
  }

  const isGit = isGitRepo(projectPath);
  if (isGit) {
    p.log.success('Valid git repository');
  } else {
    p.log.warn('Not a git repository. Blueprints will work, but you won\'t have version history.');
  }

  // Check if .blackbox/ already exists
  const blackboxDir = join(projectPath, '.blackbox');
  if (existsSync(blackboxDir)) {
    const overwrite = await p.confirm({
      message: '.blackbox/ already exists. Overwrite?',
      initialValue: false,
    });

    if (p.isCancel(overwrite) || overwrite === false) {
      p.cancel('Cancelled. Existing .blackbox/ was not modified.');
      process.exit(0);
    }
  }

  // Ask about skills location
  const skillFiles = getSkillFiles(blackboxRoot);
  let skillsLocation: 'project' | 'global' | 'skip' = 'skip';

  if (skillFiles.length > 0) {
    const skillChoice = await p.select({
      message: 'Install Claude Code skills:',
      options: [
        { value: 'project', label: 'Per project (.claude/commands/)' },
        { value: 'global', label: 'Globally (~/.claude/commands/)' },
        { value: 'skip', label: 'Skip' },
      ],
    });

    if (p.isCancel(skillChoice)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    skillsLocation = skillChoice as 'project' | 'global' | 'skip';
  }

  // Ask about committing
  let shouldCommit = false;
  if (isGit) {
    const commitChoice = await p.confirm({
      message: 'Commit changes to the project?',
      initialValue: true,
    });

    if (p.isCancel(commitChoice)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    shouldCommit = commitChoice === true;
  }

  // Create folder structure
  const s = p.spinner();
  s.start('Creating .blackbox/ structure');

  const created: string[] = createFolderStructure(projectPath);

  copyTemplate(blackboxRoot, projectPath);
  created.push('.blackbox/blueprints/_template.md');

  s.stop('Created .blackbox/ structure');

  // Copy skills
  if (skillsLocation !== 'skip' && skillFiles.length > 0) {
    s.start('Installing Claude Code skills');

    const skillsSourceDir = join(blackboxRoot, '.claude/commands');
    const skillsDestDir = skillsLocation === 'global'
      ? join(process.env.HOME || '~', '.claude/commands')
      : join(projectPath, '.claude/commands');

    if (!existsSync(skillsDestDir)) {
      mkdirSync(skillsDestDir, { recursive: true });
    }

    const existingSkills = skillFiles.filter(f => existsSync(join(skillsDestDir, f)));

    let overwriteSkills = true;
    if (existingSkills.length > 0) {
      s.stop('Found existing skills');
      const choice = await p.confirm({
        message: `${existingSkills.length} skill(s) already exist. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(choice)) {
        p.cancel('Cancelled.');
        process.exit(0);
      }

      overwriteSkills = choice === true;
      s.start('Installing Claude Code skills');
    }

    for (const file of skillFiles) {
      const destPath = join(skillsDestDir, file);
      if (!existsSync(destPath) || overwriteSkills) {
        copyFileSync(join(skillsSourceDir, file), destPath);
        const prefix = skillsLocation === 'global' ? '~/.claude/commands/' : '.claude/commands/';
        created.push(prefix + file);
      }
    }

    s.stop('Installed Claude Code skills');
  }

  p.note(created.map(f => `  ${f}`).join('\n'), 'Created');

  // Commit
  if (shouldCommit) {
    s.start('Committing changes');
    try {
      execSync('git add .blackbox/ .claude/', { cwd: projectPath, stdio: 'ignore' });
      execSync('git commit -m "Install Blackbox blueprint management"', { cwd: projectPath, stdio: 'ignore' });
      s.stop('Committed changes');
    } catch {
      s.stop('Could not commit (maybe nothing to commit or git error)');
    }
  }

  // Save to global config and auto-add repo
  {
    const config = readConfig();

    if (isGit) {
      try {
        const remote = execSync('git remote get-url origin', { cwd: projectPath, encoding: 'utf8' }).trim();
        const match = remote.match(/[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
        if (match) {
          const [, owner, repo] = match;
          const branch = execSync('git branch --show-current', { cwd: projectPath, encoding: 'utf8' }).trim() || 'main';
          const exists = config.repos.some((r) => r.owner === owner && r.repo === repo);
          if (!exists) {
            config.repos.push({ owner, repo, branch });
            p.log.success(`Added ${owner}/${repo} to ~/.blackbox/config.json`);
          }
        }
      } catch {
        // No remote or config write failed — not critical
      }
    }

    // Check if repo is accessible on GitHub (for dashboard)
    if (config.repos.length > 0) {
      const lastRepo = config.repos[config.repos.length - 1];
      const repoSlug = `${lastRepo.owner}/${lastRepo.repo}`;

      if (!config.token) {
        const result = await checkRepoVisibility(repoSlug);

        if (result.status === 'not-found') {
          p.log.warn(`${repoSlug} is not publicly accessible on GitHub.`);
          p.log.info('The dashboard needs a GitHub token to access private repos.');

          const tokenInput = await p.text({
            message: 'GitHub token (or press Enter to skip):',
            placeholder: 'ghp_...',
            defaultValue: '',
          });

          if (!p.isCancel(tokenInput) && tokenInput) {
            config.token = tokenInput;
            p.log.success(`GitHub token saved: ${tokenInput.slice(0, 8)}...`);
          } else {
            p.log.info('Skipped. You can add it later with: bbox set token ghp_your-token');
          }
        } else if (result.status === 'public') {
          p.log.success(`${repoSlug} is public — dashboard will work without a token`);
        }
      }
    }

    writeConfig(config);
  }

  p.outro('Blackbox installed successfully!');
}
