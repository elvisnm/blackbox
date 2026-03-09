#!/usr/bin/env npx tsx

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { init } from './commands/init.js';
import { addRepo, removeRepo, listRepos, setConfigValue } from './commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BLACKBOX_ROOT = resolve(__dirname, '..');

const command = process.argv[2];
const args = process.argv.slice(3);

function parseFlag(argv: string[], flag: string): { value?: string; rest: string[] } {
  const idx = argv.indexOf(flag);
  if (idx !== -1 && argv[idx + 1]) {
    const value = argv[idx + 1];
    const rest = [...argv.slice(0, idx), ...argv.slice(idx + 2)];
    return { value, rest };
  }
  return { rest: argv };
}

const HELP = `Usage: bbox <command> [options]

Commands:
  init [path]                        Install Blackbox into a project
  add-repo owner/repo [--branch name]  Add a repo to the dashboard
  remove-repo owner/repo               Remove a repo from the dashboard
  list-repos                           List configured repos
  set <key> <value>                    Set a config value (token, role)
`;

switch (command) {
  case 'init': {
    await init(BLACKBOX_ROOT, args[0]);
    break;
  }

  case 'add-repo': {
    const { value: branch, rest } = parseFlag(args, '--branch');
    if (!rest[0]) {
      console.error('Usage: bbox add-repo owner/repo [--branch name]');
      process.exit(1);
    }
    addRepo(rest[0], branch);
    break;
  }

  case 'remove-repo':
    if (!args[0]) {
      console.error('Usage: bbox remove-repo owner/repo');
      process.exit(1);
    }
    removeRepo(args[0]);
    break;

  case 'list-repos':
    listRepos();
    break;

  case 'set':
    if (!args[0] || !args[1]) {
      console.error('Usage: bbox set <key> <value>\nKeys: token, role');
      process.exit(1);
    }
    setConfigValue(args[0], args[1]);
    break;

  case undefined:
    console.log(HELP);
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    console.log(HELP);
    process.exit(1);
}
