Update a blueprint from its linked Asana ticket after a send-back.

## Input

The user provides: $ARGUMENTS (blueprint path, e.g., `feat/dashboard`)

## Instructions

1. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).

2. **Extract the Asana URL** from the blueprint header (`> **Asana:**`).
   - If no Asana link exists, ask the user for the ticket URL.

3. **Fetch the Asana task** using the Asana MCP tools (or curl fallback with `$ASANA_TOKEN`):
   - Get the task details (name, notes, custom fields)
   - Get recent comments for context on what changed

4. **Parse the Asana ticket** sections (same structure as `/scaffold`):
   - `## Goal`
   - `## Context` > `### Background`, `### Current Behavior`, `### Desired Behavior`
   - `## Requirements`
   - `## UI/UX` (optional)
   - `## Constraints`

5. **Diff and report** what changed:
   - Compare each Asana-owned section in the blueprint with the latest from Asana
   - Show a summary: "Here's what changed in the Asana ticket:"
     - Requirements added / removed / modified
     - Context updated
     - New constraints
     - UI/UX changes

6. **Overwrite Asana-owned sections** in the blueprint:
   - Goal -> overwrite
   - Context (Background, Current Behavior, Desired Behavior) -> overwrite
   - Requirements -> overwrite
   - UI/UX -> overwrite
   - Constraints -> overwrite

7. **Preserve DEV-owned sections** (do NOT touch):
   - Codebase Context
   - Implementation Plan
   - Technical Decisions
   - Validation

8. **Flag potential conflicts**: If the changes might invalidate the Implementation Plan or Codebase Context, warn the DEV:
   - "Requirements changed significantly. Review your Implementation Plan — it may need updating."
   - "New constraints added. Check if your approach still works."
   The decision is always DEV's.

9. **Save the blueprint**.

10. **Show the user**:
    - The diff summary
    - Any conflict warnings
    - Suggest: "Review the Implementation Plan and Codebase Context — run `/refine {type}/{name}` if they need updating."

Do NOT commit automatically.
