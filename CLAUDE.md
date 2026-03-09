# Blackbox — Blueprint Management System

## What This Is

Blackbox is a system for managing blueprints — technical recipes that tell developers (and their Claude) exactly what to build, where to build it, and how to verify it works. Blueprints live inside each project's `.blackbox/blueprints/` folder.

The workflow is split in two:
- **Asana** is the workflow tracker. PO and DESIGN work here, using Claude with structured templates.
- **Blueprint** is the technical recipe. DEV generates it from Asana, enriches it with codebase research, and uses it as the source of truth during implementation.

See `docs/concept.md` for the vision and principles.

## Project Structure

```
blackbox/
  CLAUDE.md                       # This file
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
  .claude/
    commands/
      scaffold.md                 # /scaffold — generate blueprint from Asana ticket
      refresh.md                  # /refresh — update blueprint from Asana after send-back
      refine.md                   # /refine — research codebase, fill technical context
      start.md                    # /start — review blueprint, begin work
      implement.md                # /implement — execute plan with Beads
      review-code.md              # /review-code — self-review before committing
      wrap-up.md                  # /wrap-up — clean code, lint, create PR doc
      create-pr.md                # /create-pr — create GitHub PR from PR doc
      update-pr.md                # /update-pr — update existing GitHub PR
      pr-review.md                # /pr-review — review someone else's PR
      status.md                   # /status — list blueprints and progress
      send-back.md                # /send-back — return ticket to PO/DESIGN via Asana
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

## Skills

### Blueprint Lifecycle
- `/scaffold {asana-url}` — Generate blueprint from an Asana ticket (pulls structured content)
- `/refresh {type/name}` — Update blueprint from Asana after a send-back (overwrites Asana-owned sections, preserves DEV-owned sections)
- `/refine {type/name}` — Research codebase, fill Codebase Context and Implementation Plan
- `/send-back {type/name} {reason}` — Return ticket to PO/DESIGN via Asana status + comment

### Development Flow
- `/start {type/name}` — Review blueprint summary, begin work
- `/implement {type/name}` — Execute implementation plan with Beads task tracking
- `/review-code` — Self-review changed files against quality checklist
- `/wrap-up [type/name]` — Clean code, lint, create PR doc in `.blackbox/prs/`
- `/create-pr [type/name]` — Create GitHub PR from `.blackbox/prs/` doc
- `/update-pr [type/name]` — Update existing GitHub PR from `.blackbox/prs/` doc
- `/pr-review {branch|pr-number}` — Review someone else's PR

### Status
- `/status [type/name]` — List blueprints with progress counts

### CLI (`bbox`)
- `bbox init [path]` — Install Blackbox into a project
- `bbox add-repo owner/repo [--branch name]` — Add a repo to the dashboard config
- `bbox remove-repo owner/repo` — Remove a repo from the dashboard config
- `bbox list-repos` — List configured repos
- `bbox set <key> <value>` — Set a config value (token, role)

## Conventions

### Categories

Blueprints live in type folders inside `.blackbox/blueprints/`: `feat/`, `fix/`, `improve/`, `hotfix/`

### Naming

Blueprint files: `{short-description}.md` inside the appropriate type folder.
Example: `feat/dashboard.md`, `fix/payment-timeout.md`, `hotfix/auth-crash.md`

### Commits

Format: `[DEV] {type}/{blueprint-name}: summary`

Only DEV commits blueprints. PO and DESIGN work in Asana.

### Blueprint Has No Status

Blueprints are technical recipes — they don't track workflow status. Asana tracks the full workflow status (draft, refining, designing, in-progress, pr-review, testing, done).

## Git

Never add `Co-Authored-By` to commit messages.

## Environment

Requires `ASANA_TOKEN` env var for `/scaffold`, `/refresh`, and `/send-back` commands.
