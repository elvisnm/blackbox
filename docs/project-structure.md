# Project Structure

```
blackbox/
  CLAUDE.md                       # Project instructions for Claude
  README.md                       # Project overview
  .github/
    workflows/
      deploy-docs.yml             # GitHub Actions: build & deploy site to Pages
  bin/                            # CLI entry point (bbox)
    bbox                          # Shell wrapper
    bbox.ts                       # Subcommand router
    commands/
      init.ts                     # bbox init logic
      config.ts                   # bbox config commands (add-repo, remove-repo, etc.)
      check.ts                    # bbox check command (health check)
    lib/
      config.ts                   # ~/.blackbox/config.json reader/writer
      github.ts                   # GitHub API helpers (repo visibility check)
  dashboard/                      # Dashboard web app (Vite + React + TypeScript + shadcn/ui)
  site/                           # Documentation site (Astro + Tailwind CSS 4)
    astro.config.mjs              # Astro config (GitHub Pages base path)
    src/
      layouts/BaseLayout.astro    # Shared layout (head, nav, footer, animations)
      components/                 # Reusable components (Nav, Footer, BackgroundAccents)
      pages/                      # Site pages (index, workflow, contract, skills, getting-started)
      styles/global.css           # Tailwind + custom styles
    public/                       # Static assets (images)
  docs/                           # Documentation (markdown)
    concept.md                    # Vision and principles
    roles.md                      # Role definitions (PO, DESIGN, DEV, QA)
    setup.md                      # Setup guide
    workflow.md                   # Workflow documentation
    spec.md                       # System specification
    project-structure.md          # This file
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
