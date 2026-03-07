import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_DIR = join(import.meta.dirname!, '../../.test-tmp/config-cmd-test');
const FAKE_HOME = join(TEST_DIR, 'home');
const FAKE_CONFIG_DIR = join(FAKE_HOME, '.blackbox');
const FAKE_CONFIG_PATH = join(FAKE_CONFIG_DIR, 'config.json');

vi.mock('node:os', () => ({
  homedir: () => FAKE_HOME,
}));

vi.mock('@clack/prompts', () => ({
  log: {
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  note: vi.fn(),
}));

let configCommands: typeof import('./config.js');
let configLib: typeof import('../lib/config.js');
let prompts: typeof import('@clack/prompts');

beforeEach(async () => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(FAKE_HOME, { recursive: true });
  vi.resetModules();
  configCommands = await import('./config.js');
  configLib = await import('../lib/config.js');
  prompts = await import('@clack/prompts');
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('addRepo', () => {
  it('adds a repo to an empty config', () => {
    configCommands.addRepo('org/repo');

    const config = configLib.readConfig();
    expect(config.repos).toHaveLength(1);
    expect(config.repos[0]).toEqual({ owner: 'org', repo: 'repo', branch: 'main' });
  });

  it('uses custom branch when provided', () => {
    configCommands.addRepo('org/repo', 'canary');

    const config = configLib.readConfig();
    expect(config.repos[0].branch).toBe('canary');
  });

  it('warns and skips on duplicate', () => {
    configCommands.addRepo('org/repo');
    configCommands.addRepo('org/repo');

    const config = configLib.readConfig();
    expect(config.repos).toHaveLength(1);
    expect(prompts.log.warn).toHaveBeenCalledWith(expect.stringContaining('already in your config'));
  });

  it('preserves existing repos when adding', () => {
    configCommands.addRepo('org/first');
    configCommands.addRepo('org/second');

    const config = configLib.readConfig();
    expect(config.repos).toHaveLength(2);
  });
});

describe('removeRepo', () => {
  it('removes an existing repo', () => {
    configCommands.addRepo('org/repo');
    configCommands.removeRepo('org/repo');

    const config = configLib.readConfig();
    expect(config.repos).toHaveLength(0);
  });

  it('warns when repo not found', () => {
    configCommands.removeRepo('org/nonexistent');

    expect(prompts.log.warn).toHaveBeenCalledWith(expect.stringContaining('not in your config'));
  });

  it('only removes the matching repo', () => {
    configCommands.addRepo('org/first');
    configCommands.addRepo('org/second');
    configCommands.removeRepo('org/first');

    const config = configLib.readConfig();
    expect(config.repos).toHaveLength(1);
    expect(config.repos[0].repo).toBe('second');
  });
});

describe('listRepos', () => {
  it('shows info message when no repos configured', () => {
    configCommands.listRepos();

    expect(prompts.log.info).toHaveBeenCalledWith(expect.stringContaining('No repos configured'));
  });

  it('shows repos when configured', () => {
    configCommands.addRepo('org/repo');
    configCommands.listRepos();

    expect(prompts.note).toHaveBeenCalled();
  });
});

describe('setConfigValue', () => {
  it('sets the author', () => {
    configCommands.setConfigValue('author', 'testuser');

    const config = configLib.readConfig();
    expect(config.author).toBe('testuser');
  });

  it('sets the token', () => {
    configCommands.setConfigValue('token', 'ghp_abc123');

    const config = configLib.readConfig();
    expect(config.token).toBe('ghp_abc123');
  });

  it('preserves existing config when setting a value', () => {
    configCommands.addRepo('org/repo');
    configCommands.setConfigValue('author', 'testuser');

    const config = configLib.readConfig();
    expect(config.author).toBe('testuser');
    expect(config.repos).toHaveLength(1);
  });

  it('sets the role', () => {
    configCommands.setConfigValue('role', 'qa');

    const config = configLib.readConfig();
    expect(config.role).toBe('qa');
  });

  it('accepts all valid roles', () => {
    for (const role of ['po', 'design', 'dev', 'qa']) {
      configCommands.setConfigValue('role', role);
      const config = configLib.readConfig();
      expect(config.role).toBe(role);
    }
  });
});
