# Blackbox

A blueprint management system for AI-assisted software development.

Designed and created by [Elvis Moreira](https://github.com/elvisnm) on March 7, 2026.

## The Idea

Everyone on a team uses AI (Claude) in their workflow — PO, Designer, Developer. Blackbox creates a path where all of them work toward the same goal, connected through structured artifacts.

**Asana is the workflow.** PO and DESIGN use Claude to create and enrich structured tickets in Asana. The Asana ticket template is the contract — it guarantees every ticket has the information a developer needs.

**Blueprints are the recipe.** When a ticket reaches "Ready for Development", the developer's Claude generates a blueprint — a technical spec enriched with codebase research. The blueprint lives in `.blackbox/blueprints/` inside the project repo, right next to the code.

## How It Works

1. PO talks to Claude, Claude creates a structured Asana ticket (Goal, Context, Requirements)
2. DESIGN (if needed) enriches the ticket with UI/UX specs and mockups
3. Ticket reaches "Ready for Development" in Asana
4. DEV runs `/scaffold {asana-url}` — Claude generates a blueprint from the ticket
5. DEV runs `/refine` — Claude researches the codebase, fills technical context and implementation plan
6. DEV runs `/implement` — Claude executes the plan step by step
7. DEV runs `/wrap-up` and `/create-pr` — code is cleaned, PR is created
8. If something needs refinement, DEV runs `/send-back` — Asana ticket is updated, PO/DESIGN refine, DEV runs `/refresh` to update the blueprint

## What Blackbox Provides

1. **A Blueprint Template** — the structure for technical recipes in any project
2. **CLI Skills** — portable Claude Code commands for the full development lifecycle
3. **A CLI (`bbox`)** — install Blackbox into any project with `bbox init`
4. **A Dashboard** — a web app that aggregates blueprints across projects

## Project Structure

```
blackbox/
  README.md                 # This file
  bin/                      # CLI entry point (bbox)
  dashboard/                # Dashboard web app (Vite + React + TypeScript + shadcn/ui)
  .claude/commands/         # Portable CLI skills (12 commands)
  .blackbox/                # Blackbox's own .blackbox/ (dogfooding)
    blueprints/
```

## Key Concepts

- **Asana = workflow tracker** — status, assignments, notifications. PO, DESIGN, QA, DEV all live here.
- **Blueprint = technical recipe** — what to build, where in the code, how to verify. DEV-only artifact.
- **The Asana ticket template is the contract** — PO's Claude fills it, DEV's Claude consumes it.
- **Blueprints have no status** — Asana tracks workflow. Blueprints track the recipe.
- **Claude is the quality gate on every side** — enforces structure through role-specific CLAUDE.md instructions.

## Documentation

- [Concept & Vision](docs/concept.md) — why this exists, core principles, key decisions
- [Specification](docs/spec.md) — what `.blackbox/` looks like in any project
- [Workflow](docs/workflow.md) — end-to-end flow from Asana to shipped code
- [Roles](docs/roles.md) — PO, DESIGN, DEV, QA roles and responsibilities
- [Setup](docs/setup.md) — installation for each role
- [Asana Ticket Template](docs/asana-ticket-template.md) — the contract between roles
- [Claude Templates](docs/claude-templates/) — CLAUDE.md templates for PO and DESIGN
