---
name: blueprint-start
description: Review a blueprint summary and prepare for development. Use when user says "start work", "begin implementation", or "show blueprint summary".
---

Prepare a blueprint for development.

When user says "start" followed by a blueprint path.

## Input

The user provides: $ARGUMENTS (blueprint path, e.g., `feat/dashboard`)

## Instructions

1. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).
   - If the file doesn't exist, list available blueprints and ask the user to pick one.

2. **Check progress** by running `bash .claude/scripts/check-progress.sh {blueprint-path}` to get JSON counts for requirements, implementation, and validation.

3. **Show a summary**:

   ```
   Starting: {type}/{blueprint-name}
   Asana: {asana-url}

   Goal: {goal text from the blueprint}

   Requirements: X/Y checked
   Implementation Plan: X/Y tasks (Phase 1: a/b, Phase 2: c/d, ...)
   Validation: X/Y tests

   Commit convention:
     [DEV] {type}/{blueprint-name}: <summary>

   Next steps:
     /implement {type}/{blueprint-name}  -- start building
     /status {type}/{blueprint-name}     -- detailed view
   ```

   Use the JSON output from step 2 (`check-progress.sh`) for the progress counts.

4. **If the blueprint has no Implementation Plan**, suggest running `/refine {type}/{name}` first.

5. **Do NOT start implementing**. That is `/implement`'s job. `/start` only shows context and prepares the developer.

## Examples

### Example 1: Start a blueprint with implementation plan
User says: `/start feat/dashboard`
Result: Shows summary with goal, progress counts (Requirements: 0/5, Implementation: 0/8, Validation: 0/3), and suggests `/implement feat/dashboard`.

### Example 2: Start a blueprint without implementation plan
User says: `/start feat/new-feature`
Result: Shows summary with warning: "No Implementation Plan found. Run `/refine feat/new-feature` first."

## Troubleshooting

### Blueprint not found
**Cause**: Wrong path or blueprint doesn't exist yet.
**Solution**: Run `/status` to list available blueprints, or `/scaffold` to create one from an Asana ticket.

### Blueprint has no Implementation Plan
**Cause**: The blueprint was scaffolded but not refined yet.
**Solution**: Run `/refine {type}/{name}` to research the codebase and fill the Implementation Plan.
