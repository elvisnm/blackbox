# Blackbox

Everyone on a team uses AI (Claude) in their workflow — Product Owner, Designer, Developer. Blackbox creates a path where all of them work toward the same goal, connected through structured artifacts.

**Asana is the workflow.** Product Owner and Designer use Claude to create and enrich structured tickets in Asana. The Asana ticket template is the contract — it guarantees every ticket has the information a developer needs.

**Blueprints are the recipe.** When a ticket reaches "Ready for Development", the developer's Claude generates a blueprint — a technical spec enriched with codebase research. The blueprint lives in `.blackbox/blueprints/` inside the project repo, right next to the code.

## How It Works

1. Product Owner talks to Claude, Claude creates a structured Asana ticket (Goal, Context, Requirements)
2. Designer (if needed) enriches the ticket with UI/UX specs and mockups
3. Ticket reaches "Ready for Development" in Asana
4. Developer runs `/scaffold {asana-url}` — Claude generates a blueprint from the ticket
5. Developer runs `/refine` — Claude researches the codebase, fills technical context and implementation plan
6. Developer runs `/implement` — Claude executes the plan step by step
7. Developer runs `/wrap-up` and `/create-pr` — code is cleaned, PR is created
8. If something needs refinement, Developer runs `/send-back` — Asana ticket is updated, Product Owner/Designer refine, Developer runs `/refresh` to update the blueprint

## What Blackbox Provides

1. **A Blueprint Template** — the structure for technical recipes in any project
2. **Skills** — portable Claude Code commands for the full development lifecycle
3. **`bbox`** — install Blackbox into any project with `bbox init`
4. **A Dashboard** — a web app that aggregates blueprints across projects

## Project Structure

```
blackbox/
  README.md                 # This file
  bin/                      # CLI entry point (bbox)
  dashboard/                # Dashboard web app (Vite + React + TypeScript + shadcn/ui)
  .claude/commands/         # Portable skills
  .blackbox/                # Blackbox's own .blackbox/ (dogfooding)
    blueprints/
```

## Key Concepts

- **Asana = workflow tracker** — status, assignments, notifications. Product Owner, Designer, QA, Developer all live here.
- **Blueprint = technical recipe** — what to build, where in the code, how to verify. Developer-only artifact.
- **The Asana ticket template is the contract** — Product Owner fills it, Developer consumes it.
- **Blueprints have no status** — Asana tracks workflow. Blueprints track the recipe.
- **Claude is the quality gate on every side** — enforces structure through role-specific CLAUDE.md instructions.

## Documentation

- [Concept & Vision](docs/concept.md) — why this exists, core principles, key decisions
- [Specification](docs/spec.md) — what `.blackbox/` looks like in any project
- [Workflow](docs/workflow.md) — end-to-end flow from Asana to shipped code
- [Roles](docs/roles.md) — Product Owner, Designer, Developer, QA roles and responsibilities
- [Setup](docs/setup.md) — installation for each role
- [Asana Ticket Template](docs/asana-ticket-template.md) — the contract between roles
- [Claude Templates](docs/claude-templates/) — CLAUDE.md templates for Product Owner and Designer
