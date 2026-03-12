---
name: blueprint-refresh
description: Update a blueprint from its linked Asana ticket after a send-back. Use when user says "refresh blueprint", "sync from Asana", or "pull latest from Asana".
---

Update a blueprint from its linked Asana ticket after a send-back.

## Input

The user provides: $ARGUMENTS (blueprint path, e.g., `feat/dashboard`)

## Instructions

1. **Validate Asana access** — follow `references/asana-api-guide.md` Step 0 to verify the token is set. If missing, stop and tell the user.

2. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).

3. **Extract the Asana URL** from the blueprint header (`> **Asana:**`).
   - If no Asana link exists, ask the user for the ticket URL.

4. **Fetch the Asana task** using the Asana MCP tools (or curl fallback with `$ASANA_TOKEN`). For Asana API patterns (creating/reading/updating tasks, setting custom fields), see `references/asana-api-guide.md`.
   - Get the task details (name, notes, custom fields)
   - Get recent comments for context on what changed

5. **Parse the Asana ticket** sections (same structure as `/scaffold`):
   - `## Goal`
   - `## Context` > `### Background`, `### Current Behavior`, `### Desired Behavior`
   - `## Requirements`
   - `## UI/UX` (optional)
   - `## Constraints`

6. **Diff and report** what changed:
   - Compare each Asana-owned section in the blueprint with the latest from Asana
   - Show a summary: "Here's what changed in the Asana ticket:"
     - Requirements added / removed / modified
     - Context updated
     - New constraints
     - UI/UX changes

7. **Overwrite Asana-owned sections** in the blueprint:
   - Goal -> overwrite
   - Context (Background, Current Behavior, Desired Behavior) -> overwrite
   - Requirements -> overwrite
   - UI/UX -> overwrite
   - Constraints -> overwrite

8. **Preserve DEV-owned sections** (do NOT touch):
   - Codebase Context
   - Implementation Plan
   - Technical Decisions
   - Validation

9. **Flag potential conflicts**: If the changes might invalidate the Implementation Plan or Codebase Context, warn the DEV:
   - "Requirements changed significantly. Review your Implementation Plan — it may need updating."
   - "New constraints added. Check if your approach still works."
   The decision is always DEV's.

10. **Save the blueprint**.

11. **Show the user**:
    - The diff summary
    - Any conflict warnings
    - Suggest: "Review the Implementation Plan and Codebase Context — run `/refine {type}/{name}` if they need updating."

Do NOT commit automatically.

## Examples

### Example 1: Refresh after PO updated requirements
User says: `/refresh feat/dashboard`
Result: Requirements and Context sections are overwritten with latest from Asana. Implementation Plan is preserved. Warning shown: "Requirements changed significantly — review your Implementation Plan."

## Troubleshooting

### Blueprint has no Asana URL
**Cause**: The `> **Asana:**` field is empty or missing in the blueprint header.
**Solution**: Ask the user for the Asana ticket URL and proceed with it.

### Asana task deleted or inaccessible
**Cause**: The task was deleted, or the token doesn't have access to the project.
**Solution**: Verify the URL is correct. If the task was deleted, the blueprint can't be refreshed — inform the user.

### Asana MCP unavailable
**Cause**: MCP server not connected or credentials expired.
**Solution**: Falls back to curl with `$ASANA_TOKEN`. Ensure the env var is set: `export ASANA_TOKEN=your-token`

### Changes may invalidate Implementation Plan
**Cause**: Requirements or constraints changed significantly in Asana.
**Solution**: This is expected. The skill already warns about this — suggest running `/refine {type}/{name}` to update DEV-owned sections.
