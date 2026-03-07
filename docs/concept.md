# Concept & Vision

## The Problem

Modern AI coding tools (Claude Code, Cursor, Copilot) are powerful at the unit level — write a function, fix a bug, refactor a file. But teams using AI across multiple roles (PO, Designer, Developer) face a harder problem: **how do you keep everyone's AI conversations pointed at the same goal?**

Today, each role operates in isolation. The PO talks to Claude about requirements. The Designer talks to Claude about UI. The Developer talks to Claude about code. There's no shared artifact connecting these conversations.

The result:
- **Functionality flickering** — the same prompt produces inconsistent results because intent was never captured explicitly
- **Lost mental models** — after three months, nobody remembers why things were built a certain way
- **Context window limits** — AI agents can't hold an entire system in memory, so they need scoped, relevant context delivered to them

## The Thesis

**Separate the workflow from the recipe.**

- **Asana** is the workflow. It tracks who's doing what, what status things are in, who's blocked, and what's next. PO, DESIGN, QA, and DEV all live here. This is the shared space.
- **Blueprint** is the recipe. It's a technical artifact that tells the developer (and their Claude) exactly what to build, where to build it, and how to verify it works. It lives in the project repo.

They link to each other. They don't duplicate each other's job.

## Core Principles

### 1. Claude is the Quality Gate on Every Side

No one writes raw Asana descriptions or raw blueprints. Claude enforces structure through role-specific CLAUDE.md instructions. PO's Claude follows a strict Asana ticket template. DEV's Claude generates blueprints from that structured content. The template is the contract between both sides.

### 2. Blueprints Live With the Code

Blueprints belong in the project they describe — in `.blackbox/blueprints/` alongside `src/`. The developer has both the spec and the code in the same repo, the same editor, the same Claude Code session. No context switching.

### 3. Blueprints Are Recipes, Not Workflow Trackers

A blueprint has no status field. It doesn't track who's doing what or what phase things are in. That's Asana's job. A blueprint is purely technical: what to build, where in the code, how to verify it works.

### 4. Specificity Over Vibes

Unspecified details create ambiguity. Ambiguity creates inconsistency. The Asana ticket template forces explicit decisions — current behavior, desired behavior, testable requirements. The more specific the ticket, the better the blueprint, the better the code.

### 5. Progressive Enrichment

A ticket starts as a PO draft and gets richer as it moves through phases. The PO adds goals and requirements. The Designer adds UI specs. The developer's Claude generates the blueprint and fills technical context from codebase research. Each phase adds information.

### 6. Git as the Database

No separate database for blueprint state. Git provides versioning, history, diffs, blame, and collaboration out of the box. The dashboard is a view layer on top of git, not a replacement for it.

### 7. Deterministic + Agentic

Implementation steps in blueprints are explicitly marked as either deterministic (exact action, no judgment) or agentic (requires reading code, making decisions). This gives structure without removing flexibility.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Workflow tracker | Asana | PO and DESIGN already work here. Natural fit for status, assignments, notifications. |
| Technical spec | Blueprint in `.blackbox/` | Lives next to the code. Developer has both in the same session. |
| The contract | Asana ticket template | Structured format that PO's Claude fills, DEV's Claude consumes. Quality gate. |
| Blueprint status | None | Asana tracks workflow. Blueprint is purely technical. |
| PO/DESIGN repo access | Read-only | They read code for context but never write to the repo. All output goes to Asana. |
| Send-backs | Via Asana | DEV updates Asana ticket status + comment. PO/DESIGN refine in Asana. DEV refreshes blueprint. |
| Dashboard data source | GitHub API only | Reads blueprint presence, PR status, repo data. No Asana integration needed. |
| Mockup storage | Asana attachments | Referenced by URL in blueprint. Not downloaded into repo. |
| Multi-repo features | Deferred | Single repo per blueprint for now. |
| QA role | Asana only | Tests against acceptance criteria in the ticket. No Claude needed for v2. |

## References

- [Minions: Stripe's one-shot end-to-end coding agents (Part 1)](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Minions: Stripe's one-shot end-to-end coding agents (Part 2)](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)
- [The Uncomfortable Truth About Vibe Coding](https://developers.redhat.com/articles/2026/02/17/uncomfortable-truth-about-vibe-coding)
