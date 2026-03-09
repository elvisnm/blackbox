---
name: blueprint-status
description: List blueprints with progress counts and completion status. Use when user says "status", "show blueprints", "what's in progress", or "blueprint progress".
---

Show the status of blueprints.

## Input

The user provides: $ARGUMENTS

This can be:
- Empty -- show all blueprints
- A blueprint path (e.g., `feat/dashboard`) -- show details for that blueprint
- A type filter -- e.g., `feat`, `fix`, `hotfix`

## Instructions

1. **List all blueprint files** in `.blackbox/blueprints/feat/`, `.blackbox/blueprints/fix/`, `.blackbox/blueprints/improve/`, and `.blackbox/blueprints/hotfix/` directories (exclude `_template.md` and `.gitkeep`).

2. **Parse each blueprint's header** to extract:
   - Title (from `# {type}/{name}`)
   - Asana link (from `> **Asana:**`)
   - PR link (from `> **PR:**`)

3. **Parse progress counts** for each blueprint:

   ### Requirements
   Count lines matching `- [x]` and `- [ ]` inside the `## Requirements` section (stop at the next `##` heading).

   ### Implementation Plan
   For each `### Phase N: {name}` subsection inside `## Implementation Plan`:
   - Count `- [x]` (done) and `- [ ]` (pending) lines
   - Track per-phase: `Phase N ({name}): done/total`
   - Sum across all phases for the total

   ### Validation > Tests
   Count `- [x]` and `- [ ]` inside the `### Tests` subsection of `## Validation`.

4. **Display based on input**:

   ### No arguments (show all)
   Display as a table:
   ```
   | Blueprint | Type | Progress | Asana | PR |
   |-----------|------|----------|-------|-----|
   | feat/auth-sso | feat | 3/10 tasks | link | _pending_ |
   | fix/payment-timeout | fix | 0/5 tasks | link | #142 |
   ```

   The "Progress" column shows total checked/total tasks across Requirements + Implementation Plan + Validation Tests.

   ### Specific blueprint path
   Show full details:
   ```
   ## feat/auth-sso

   Asana: {link}
   PR: {link or _pending_}

   ### Requirements: 8/10
   ### Implementation Plan: 12/15
   - Phase 1 (Project Setup): 5/5
   - Phase 2 (Core Logic): 4/5
   - Phase 3 (Interactive UI): 3/5
   ### Validation Tests: 1/3

   ### What's left:
   - [ ] Phase 2: Implement optional git commit
   - [ ] Phase 3: Handle edge cases
   - [ ] Requirement: Some unchecked requirement
   - [ ] Test: Some unchecked test
   ```

   ### Type filter
   Show only blueprints from that category folder, in the same table format.

5. **Show summary** at the end:
   ```
   Total: X blueprints
   ```

## Troubleshooting

### No blueprints found
**Cause**: `.blackbox/blueprints/` directories are empty or don't exist.
**Solution**: Run `bbox init` to set up the structure, or `/scaffold` to create the first blueprint.

### Blueprint has no Implementation Plan
**Cause**: The blueprint was scaffolded but not refined.
**Solution**: Progress will show 0/0 for implementation tasks. Suggest running `/refine {type}/{name}` to fill it.
