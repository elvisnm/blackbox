import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface RepoEntry {
  owner: string;
  repo: string;
  branch: string;
}

export interface BlackboxConfig {
  token?: string;
  role?: string;
  repos: RepoEntry[];
}

const DEFAULT_CONFIG: BlackboxConfig = {
  repos: [],
};

export function getConfigDir(): string {
  return join(homedir(), '.blackbox');
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

export function readConfig(): BlackboxConfig {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      token: parsed.token,
      role: parsed.role,
      repos: Array.isArray(parsed.repos) ? parsed.repos : [],
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function writeConfig(config: BlackboxConfig): void {
  mkdirSync(getConfigDir(), { recursive: true });
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2) + '\n', 'utf8');
}
