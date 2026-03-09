---
name: ticket-review
description: Validate an Asana ticket against quality gates before marking it ready. Use when user says "review ticket", "check ticket quality", or "is this ticket ready?".
---

Validate an Asana ticket against quality gates before marking it ready.

## Input

The user provides: $ARGUMENTS

This should be an Asana task URL (e.g., https://app.asana.com/0/PROJECT_ID/TASK_ID).

## Instructions

1. **Extract the Asana task ID** from the URL. The task ID is the last numeric segment.

2. **Fetch the Asana task** using the Asana MCP tools:
   - Get the task details (name, notes, custom fields)

   If Asana MCP is not available, fall back to curl:
   ```
   curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
     "https://app.asana.com/api/1.0/tasks/{task_id}?opt_fields=name,notes,custom_fields"
   ```

3. **Parse the ticket** and check each quality gate:

   ### Gate 1: Goal
   - [ ] Goal section exists and is not empty
   - [ ] Goal is one clear sentence (not a paragraph)
   - [ ] Goal describes both WHAT and WHY

   ### Gate 2: Context
   - [ ] Background section explains why this work matters
   - [ ] Current Behavior is specific (references pages, endpoints, error messages — not vague)
   - [ ] Desired Behavior is specific (same level of detail as Current Behavior)

   ### Gate 3: Requirements
   - [ ] Requirements section has at least one item
   - [ ] Each requirement is testable (someone can definitively say "yes" or "no")
   - [ ] No vague requirements ("improve performance", "better UX", "handle errors properly")

   ### Gate 4: Constraints
   - [ ] Constraints section exists (can be N/A if genuinely none)

   ### Gate 5: Open Questions
   - [ ] Open Questions section is empty (HARD GATE — blocks all transitions)

   ### Gate 6: UI/UX (if routing through design)
   - [ ] UI/UX section is either filled or explicitly marked N/A

4. **Present the review** to the Product Owner:

   For each gate, show:
   - PASS or FAIL
   - Specific issues found (if FAIL)
   - Suggestions for improvement

5. **Determine readiness**:

   **All gates pass** -> Tell the Product Owner the ticket is ready. Ask which transition:
   - "Ready for Design" (if UI/UX work is needed)
   - "Ready for Development" (if no design needed, and UI/UX is N/A or pre-filled)

   **Any gate fails** -> Tell the Product Owner: "This ticket isn't ready yet. The following need attention: [list issues]." Do NOT update the status.

6. **If approved, update the Asana ticket status** to the chosen transition.
   - Add a comment: "Ticket reviewed and approved — moved to [new status]"

## Rules

- NEVER write to the repo. Product Owner output goes to Asana only.
- Open Questions not empty = ALWAYS block. No exceptions.
- Be specific about what's wrong — not "requirements are vague" but "Requirement 3 says 'improve loading speed' — what's the target? Under 2 seconds? Under 500ms?"
- This is a helper, not a blocker. If the Product Owner disagrees with a flag, they can override — but log it.
