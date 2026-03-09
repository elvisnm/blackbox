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
    concept.md                    # Vision and principles
    roles.md                      # Role definitions (PO, DESIGN, DEV, QA)
    setup.md                      # Setup guide
    workflow.md                   # Workflow documentation
    spec.md                       # System specification
    asana-ticket-template.md      # Asana ticket contract template
    claude-templates/             # Role-specific CLAUDE.md templates
      CLAUDE_PO.md                # Product Owner Claude config
      CLAUDE_DESIGN.md            # Designer Claude config
  .claude/
    commands/                     # Skill definitions (17 skills)
    references/                   # Shared docs loaded on demand by skills
    scripts/                      # Deterministic validation scripts
  .blackbox/                      # Blackbox's own .blackbox/ (dogfooding)
    blueprints/
      _template.md                # Blueprint template
      assets/                     # Shared blueprint assets
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
