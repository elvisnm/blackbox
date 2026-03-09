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

2. **Show a summary**:

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

   To compute progress counts:
   - **Requirements**: Count `- [x]` and `- [ ]` lines in the `## Requirements` section
   - **Implementation Plan**: Count `- [x]` and `- [ ]` lines in `## Implementation Plan`, grouped by `### Phase` subsections
   - **Validation**: Count `- [x]` and `- [ ]` lines in the `### Tests` subsection of `## Validation`

3. **If the blueprint has no Implementation Plan**, suggest running `/refine {type}/{name}` first.

4. **Do NOT start implementing**. That is `/implement`'s job. `/start` only shows context and prepares the developer.
