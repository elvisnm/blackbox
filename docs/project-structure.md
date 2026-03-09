# Project Structure

```
blackbox/
  CLAUDE.md                       # Project instructions for Claude
  README.md                       # Project overview
  bin/                            # CLI entry point (bbox)
    bbox                          # Shell wrapper
    bbox.ts                       # Subcommand router
    commands/
      init.ts                     # bbox init logic
      config.ts                   # bbox config commands (add-repo, remove-repo, etc.)
    lib/
      config.ts                   # ~/.blackbox/config.json reader/writer
  dashboard/                      # Dashboard web app (Vite + React + TypeScript + shadcn/ui)
  docs/                           # Documentation
  .claude/
    commands/                     # Skill definitions (17 skills)
    references/                   # Shared docs loaded on demand by skills
    scripts/                      # Deterministic validation scripts
  .blackbox/                      # Blackbox's own .blackbox/ (dogfooding)
    blueprints/
      _template.md                # Blueprint template
      feat/                       # Feature blueprints
      fix/                        # Bug fix blueprints
      improve/                    # Improvement/refactor blueprints
      hotfix/                     # Urgent production fix blueprints
    prs/
      _template.md                # PR document template
      feat/                       # PR docs for feature blueprints
      fix/                        # PR docs for bug fix blueprints
      improve/                    # PR docs for improvement blueprints
      hotfix/                     # PR docs for hotfix blueprints
      reviews/                    # PR review artifacts
```
