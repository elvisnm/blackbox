import * as p from '@clack/prompts';
import { readConfig } from '../lib/config.js';
import { checkRepoVisibility } from '../lib/github.js';

export async function check(): Promise<void> {
  p.intro('Blackbox Health Check');

  const config = readConfig();
  let hasIssues = false;

  // 1. Check Asana token
  if (config.token) {
    p.log.success(`GitHub token: ${config.token.slice(0, 8)}...`);
  }

  if (process.env.ASANA_TOKEN) {
    p.log.success('Asana token: set via ASANA_TOKEN env var');
  } else {
    p.log.warn('Asana token: not set. Required for /scaffold, /refresh, /send-back, and ticket skills.');
    p.log.info('  → Get one from Asana > My Settings > Apps > Developer Apps > Personal Access Tokens');
    p.log.info('  → Then run: export ASANA_TOKEN="your-token"');
    hasIssues = true;
  }

  // 2. Check repos
  if (config.repos.length === 0) {
    p.log.warn('No repos configured. Run `bbox add-repo owner/repo` to add one.');
    hasIssues = true;
  } else {
    p.log.step(`Checking ${config.repos.length} repo(s)...`);

    for (const repo of config.repos) {
      const repoSlug = `${repo.owner}/${repo.repo}`;
      const result = await checkRepoVisibility(repoSlug, config.token);

      if (result.status === 'public') {
        p.log.success(`${repoSlug}: public — dashboard will work without a token`);
      } else if (result.status === 'private' || result.status === 'not-found') {
        if (config.token) {
          p.log.success(`${repoSlug}: private — accessible with your GitHub token`);
        } else {
          p.log.error(`${repoSlug}: not accessible — repo is private or doesn't exist on GitHub`);
          p.log.info('  → If private, add a GitHub token: bbox set token ghp_your-token');
          p.log.info('  → If not pushed yet, push it: git push -u origin main');
          hasIssues = true;
        }
      } else if (result.status === 'error') {
        p.log.error(`${repoSlug}: could not reach GitHub API — ${result.message}`);
        hasIssues = true;
      }

      // Check if .blackbox/blueprints/ exists and has content
      if (result.status === 'public' || (result.status !== 'error' && config.token)) {
        const bbResult = await checkRepoVisibility(repoSlug, config.token, '.blackbox/blueprints');
        if (bbResult.status === 'not-found') {
          p.log.warn(`${repoSlug}: .blackbox/ not found on GitHub — commit and push it first`);
          p.log.info('  → git add .blackbox/ && git commit -m "add blackbox" && git push');
          hasIssues = true;
        } else {
          // Check each blueprint type folder for actual files
          const types = ['feat', 'fix', 'improve', 'hotfix'];
          let hasBlueprints = false;
          for (const type of types) {
            const typeResult = await checkRepoVisibility(repoSlug, config.token, `.blackbox/blueprints/${type}`);
            if (typeResult.status === 'public') {
              hasBlueprints = true;
              break;
            }
          }
          if (!hasBlueprints) {
            p.log.info(`${repoSlug}: .blackbox/ exists but no blueprints yet — use /scaffold to create one`);
          }
        }
      }
    }
  }

  // 3. GitHub token check
  if (!config.token) {
    p.log.warn('GitHub token: not set. Required for private repos, increases API rate limit.');
    p.log.info('  → bbox set token ghp_your-token');
    hasIssues = true;
  }

  // Summary
  if (hasIssues) {
    p.outro('Some issues found — see warnings above.');
  } else {
    p.outro('Everything looks good!');
  }
}
