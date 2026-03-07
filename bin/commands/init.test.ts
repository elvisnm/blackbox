import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createFolderStructure, copyTemplate, copySkills, FOLDER_STRUCTURE } from './init.js';

const TEST_DIR = join(import.meta.dirname!, '../../.test-tmp/init-test');
const FAKE_BLACKBOX = join(TEST_DIR, 'fake-blackbox');
const FAKE_PROJECT = join(TEST_DIR, 'fake-project');

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });

  // Set up a fake blackbox repo with template and skills
  mkdirSync(join(FAKE_BLACKBOX, '.blackbox/blueprints'), { recursive: true });
  writeFileSync(join(FAKE_BLACKBOX, '.blackbox/blueprints/_template.md'), '# Template\nContent here');

  mkdirSync(join(FAKE_BLACKBOX, '.claude/commands'), { recursive: true });
  writeFileSync(join(FAKE_BLACKBOX, '.claude/commands/scaffold.md'), 'scaffold content');
  writeFileSync(join(FAKE_BLACKBOX, '.claude/commands/refine.md'), 'refine content');
  writeFileSync(join(FAKE_BLACKBOX, '.claude/commands/status.md'), 'status content');
  writeFileSync(join(FAKE_BLACKBOX, '.claude/commands/send-back.md'), 'send-back content');

  // Set up a fake target project
  mkdirSync(FAKE_PROJECT, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('createFolderStructure', () => {
  it('creates all blueprint category and asset folders', () => {
    const created = createFolderStructure(FAKE_PROJECT);

    for (const folder of FOLDER_STRUCTURE) {
      expect(existsSync(join(FAKE_PROJECT, folder))).toBe(true);
    }

    expect(created).toContain('.blackbox/blueprints/');
    expect(created).toContain('.blackbox/blueprints/feat/');
    expect(created).toContain('.blackbox/blueprints/fix/');
    expect(created).toContain('.blackbox/blueprints/improve/');
    expect(created).toContain('.blackbox/blueprints/hotfix/');
    expect(created).toContain('.blackbox/blueprints/assets/feat/');
    expect(created).toContain('.blackbox/blueprints/assets/fix/');
    expect(created).toContain('.blackbox/blueprints/assets/improve/');
    expect(created).toContain('.blackbox/blueprints/assets/hotfix/');
  });

  it('skips already-existing folders', () => {
    createFolderStructure(FAKE_PROJECT);
    const second = createFolderStructure(FAKE_PROJECT);

    expect(second).toHaveLength(0);
  });
});

describe('copyTemplate', () => {
  it('copies _template.md to the target project', () => {
    mkdirSync(join(FAKE_PROJECT, '.blackbox/blueprints'), { recursive: true });
    copyTemplate(FAKE_BLACKBOX, FAKE_PROJECT);

    const dest = join(FAKE_PROJECT, '.blackbox/blueprints/_template.md');
    expect(existsSync(dest)).toBe(true);
    expect(readFileSync(dest, 'utf8')).toBe('# Template\nContent here');
  });
});

describe('copySkills', () => {
  it('copies all skill files to the destination', () => {
    const destDir = join(FAKE_PROJECT, '.claude/commands');
    const copied = copySkills(FAKE_BLACKBOX, destDir);

    expect(copied).toContain('scaffold.md');
    expect(copied).toContain('refine.md');
    expect(copied).toContain('status.md');
    expect(copied).toContain('send-back.md');

    expect(readFileSync(join(destDir, 'scaffold.md'), 'utf8')).toBe('scaffold content');
    expect(readFileSync(join(destDir, 'refine.md'), 'utf8')).toBe('refine content');
  });

  it('creates the destination directory if it does not exist', () => {
    const destDir = join(FAKE_PROJECT, '.claude/commands');
    expect(existsSync(destDir)).toBe(false);

    copySkills(FAKE_BLACKBOX, destDir);

    expect(existsSync(destDir)).toBe(true);
  });
});
