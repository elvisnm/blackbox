import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TEST_DIR = join(import.meta.dirname!, '../../.test-tmp/config-test');
const FAKE_HOME = join(TEST_DIR, 'home');
const FAKE_CONFIG_DIR = join(FAKE_HOME, '.blackbox');
const FAKE_CONFIG_PATH = join(FAKE_CONFIG_DIR, 'config.json');

vi.mock('node:os', () => ({
  homedir: () => FAKE_HOME,
}));

let configModule: typeof import('./config.js');

beforeEach(async () => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(FAKE_HOME, { recursive: true });
  vi.resetModules();
  configModule = await import('./config.js');
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('getConfigPath', () => {
  it('returns path under home directory', () => {
    expect(configModule.getConfigPath()).toBe(FAKE_CONFIG_PATH);
  });
});

describe('readConfig', () => {
  it('returns defaults when config file does not exist', () => {
    const config = configModule.readConfig();
    expect(config).toEqual({ repos: [] });
  });

  it('reads a valid config file', () => {
    mkdirSync(FAKE_CONFIG_DIR, { recursive: true });
    writeFileSync(FAKE_CONFIG_PATH, JSON.stringify({
      token: 'ghp_test',
      role: 'dev',
      repos: [{ owner: 'org', repo: 'project', branch: 'main' }],
    }));

    const config = configModule.readConfig();
    expect(config.token).toBe('ghp_test');
    expect(config.role).toBe('dev');
    expect(config.repos).toHaveLength(1);
    expect(config.repos[0]).toEqual({ owner: 'org', repo: 'project', branch: 'main' });
  });

  it('reads config with role field', () => {
    mkdirSync(FAKE_CONFIG_DIR, { recursive: true });
    writeFileSync(FAKE_CONFIG_PATH, JSON.stringify({
      role: 'qa',
      repos: [],
    }));

    const config = configModule.readConfig();
    expect(config.role).toBe('qa');
  });

  it('returns undefined role when not set', () => {
    mkdirSync(FAKE_CONFIG_DIR, { recursive: true });
    writeFileSync(FAKE_CONFIG_PATH, JSON.stringify({
      repos: [],
    }));

    const config = configModule.readConfig();
    expect(config.role).toBeUndefined();
  });

  it('returns defaults for invalid JSON', () => {
    mkdirSync(FAKE_CONFIG_DIR, { recursive: true });
    writeFileSync(FAKE_CONFIG_PATH, '{ invalid json }');

    const config = configModule.readConfig();
    expect(config).toEqual({ repos: [] });
  });

  it('handles missing repos array gracefully', () => {
    mkdirSync(FAKE_CONFIG_DIR, { recursive: true });
    writeFileSync(FAKE_CONFIG_PATH, JSON.stringify({ token: 'test' }));

    const config = configModule.readConfig();
    expect(config.token).toBe('test');
    expect(config.repos).toEqual([]);
  });
});

describe('writeConfig', () => {
  it('creates ~/.blackbox/ directory if it does not exist', () => {
    expect(existsSync(FAKE_CONFIG_DIR)).toBe(false);

    configModule.writeConfig({ repos: [] });

    expect(existsSync(FAKE_CONFIG_DIR)).toBe(true);
    expect(existsSync(FAKE_CONFIG_PATH)).toBe(true);
  });

  it('writes valid JSON to the config file', () => {
    const config = {
      token: 'ghp_abc',
      repos: [{ owner: 'org', repo: 'repo', branch: 'main' }],
    };

    configModule.writeConfig(config);

    const raw = readFileSync(FAKE_CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed).toEqual(config);
  });

  it('overwrites existing config', () => {
    configModule.writeConfig({ repos: [{ owner: 'a', repo: 'b', branch: 'main' }] });
    configModule.writeConfig({ token: 'new', repos: [] });

    const config = configModule.readConfig();
    expect(config.token).toBe('new');
    expect(config.repos).toEqual([]);
  });
});
