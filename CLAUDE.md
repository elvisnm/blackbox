# Blackbox — Blueprint Management System

## Critical Rules

- **Never** add `Co-Authored-By` to commit messages.
- **Never** auto-commit. Always wait for the user to approve.
- **Never** write to the repo when acting as PO or DESIGN role — all output goes to Asana.
- **Never** modify Asana-owned blueprint sections (Goal, Context, Requirements, UI/UX, Constraints) during `/implement`. Use `/refresh` to pull Asana changes.
- **Commit format**: `[DEV] {type}/{blueprint-name}: summary`
- **Environment**: `ASANA_TOKEN` env var required for `/scaffold`, `/refresh`, `/send-back`, and all ticket management skills.

## What This Is

Blackbox is a system for managing blueprints — technical recipes that tell developers (and their Claude) exactly what to build, where to build it, and how to verify it works. Blueprints live inside each project's `.blackbox/blueprints/` folder.

The workflow is split in two:
- **Asana** is the workflow tracker. PO and DESIGN work here, using Claude with structured templates.
- **Blueprint** is the technical recipe. DEV generates it from Asana, enriches it with codebase research, and uses it as the source of truth during implementation.

See `docs/concept.md` for the vision and principles. See `docs/project-structure.md` for the full directory tree.

## Skills

### Blueprint Lifecycle
- `/scaffold {asana-url}` — Generate blueprint from an Asana ticket (pulls structured content)
- `/refresh {type/name}` — Update blueprint from Asana after a send-back (overwrites Asana-owned sections, preserves DEV-owned sections)
- `/refine {asana-url | type/name}` — Agent-powered deep codebase research. Accepts an Asana URL (refines the ticket) or a blueprint path (refines the blueprint). Spawns parallel research agents, then drives a guided Q&A conversation before writing.
- `/send-back {type/name} {reason}` — Return ticket to PO/DESIGN via Asana status + comment

### Development Flow
- `/start {type/name}` — Review blueprint summary, begin work
- `/implement {type/name}` — Execute implementation plan with Beads task tracking
- `/review-code` — Self-review changed files against quality checklist
- `/wrap-up [type/name]` — Clean code, lint, create PR doc in `.blackbox/prs/`
- `/create-pr [type/name]` — Create GitHub PR from `.blackbox/prs/` doc
- `/update-pr [type/name]` — Update existing GitHub PR from `.blackbox/prs/` doc
- `/pr-review {branch|pr-number}` — Review someone else's PR

### Ticket Management
- `/draft {idea}` — Create a new Asana ticket from an idea, grounded in codebase research
- `/review-ticket {asana-url}` — Validate ticket against quality gates before marking ready
- `/design {asana-url}` — Fill UI/UX section of an Asana ticket with component references
- `/review-design {asana-url}` — Validate design specs against codebase components and patterns

### Project Setup
- `/setup-roles` — Generate personalized CLAUDE.md files for PO and DESIGN roles in `.blackbox/roles/`

### Status
- `/status [type/name]` — List blueprints with progress counts

### CLI (`bbox`)
- `bbox init [path]` — Install Blackbox into a project (detects private repos, prompts for GitHub token)
- `bbox check` — Verify setup (tokens, repo access, GitHub visibility)
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

## Validation Scripts

Skills use deterministic bash scripts in `.claude/scripts/` instead of relying on LLM interpretation:

- `validate-blueprint.sh <path>` — Check required sections exist in a blueprint (JSON output)
- `validate-pr-doc.sh <path>` — Check PR doc structure and title prefix (JSON output)
- `check-progress.sh <path>` — Count `[x]` vs `[ ]` checkboxes per section (JSON output)
- `parse-asana-url.sh <url>` — Extract `task_id` and `project_id` from Asana URLs (JSON output)
