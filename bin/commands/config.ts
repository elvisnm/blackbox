import * as p from '@clack/prompts';
import { readConfig, writeConfig, type RepoEntry } from '../lib/config.js';

function parseOwnerRepo(input: string): { owner: string; repo: string } | null {
  const parts = input.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }
  return { owner: parts[0], repo: parts[1] };
}

export function addRepo(ownerRepo: string, branch: string = 'main'): void {
  const parsed = parseOwnerRepo(ownerRepo);
  if (!parsed) {
    p.log.error(`Invalid format: "${ownerRepo}". Expected owner/repo (e.g., elvisnm/blackbox)`);
    process.exit(1);
  }

  const config = readConfig();
  const exists = config.repos.some(
    (r) => r.owner === parsed.owner && r.repo === parsed.repo
  );

  if (exists) {
    p.log.warn(`${ownerRepo} is already in your config. Skipping.`);
    return;
  }

  const entry: RepoEntry = { owner: parsed.owner, repo: parsed.repo, branch };
  config.repos.push(entry);
  writeConfig(config);

  p.log.success(`Added ${parsed.owner}/${parsed.repo} (branch: ${branch})`);
}

export function removeRepo(ownerRepo: string): void {
  const parsed = parseOwnerRepo(ownerRepo);
  if (!parsed) {
    p.log.error(`Invalid format: "${ownerRepo}". Expected owner/repo (e.g., elvisnm/blackbox)`);
    process.exit(1);
  }

  const config = readConfig();
  const index = config.repos.findIndex(
    (r) => r.owner === parsed.owner && r.repo === parsed.repo
  );

  if (index === -1) {
    p.log.warn(`${ownerRepo} is not in your config.`);
    return;
  }

  config.repos.splice(index, 1);
  writeConfig(config);

  p.log.success(`Removed ${parsed.owner}/${parsed.repo}`);
}

export function listRepos(): void {
  const config = readConfig();

  if (config.repos.length === 0) {
    p.log.info('No repos configured. Run `bbox add-repo owner/repo` to add one.');
    return;
  }

  const lines = config.repos.map(
    (r) => `  ${r.owner}/${r.repo} (branch: ${r.branch})`
  );

  p.note(lines.join('\n'), `${config.repos.length} repo(s)`);
}

export function setConfigValue(key: string, value: string): void {
  if (key !== 'token' && key !== 'role') {
    p.log.error(`Unknown config key: "${key}". Supported keys: token, role`);
    process.exit(1);
  }

  if (key === 'role' && !['po', 'design', 'dev', 'qa'].includes(value)) {
    p.log.error(`Invalid role: "${value}". Must be one of: po, design, dev, qa`);
    process.exit(1);
  }

  const config = readConfig();
  config[key] = value;
  writeConfig(config);

  const display = key === 'token' ? `${value.slice(0, 8)}...` : value;
  p.log.success(`Set ${key} = ${display}`);
}
