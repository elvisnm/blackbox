---
name: ticket-review
description: Validate an Asana ticket against quality gates before marking it ready. Use when user says "review ticket", "check ticket quality", or "is this ticket ready?".
---

Validate an Asana ticket against quality gates before marking it ready.

## Input

The user provides: $ARGUMENTS

This should be an Asana task URL (e.g., https://app.asana.com/0/PROJECT_ID/TASK_ID).

## Instructions

1. **Validate Asana access** — follow `references/asana-api-guide.md` Step 0 to verify the token is set. If missing, stop and tell the user.

2. **Extract the Asana task ID** by running `bash .claude/scripts/parse-asana-url.sh {url}`. This returns JSON with `task_id` and optionally `project_id`.

3. **Fetch the Asana task** using the Asana MCP tools:
   - Get the task details (name, notes, custom fields)

   If Asana MCP is not available, fall back to curl. For Asana API patterns (creating/reading/updating tasks, setting custom fields), see `references/asana-api-guide.md`.
   ```
   curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
     "https://app.asana.com/api/1.0/tasks/{task_id}?opt_fields=name,notes,custom_fields"
   ```

4. **Parse the ticket** and check each quality gate defined in `references/quality-gates.md` (Gates 1-6: Goal, Context, Requirements, Constraints, Open Questions, UI/UX).

5. **Present the review** to the Product Owner:

   For each gate, show:
   - PASS or FAIL
   - Specific issues found (if FAIL)
   - Suggestions for improvement

6. **Determine readiness**:

   **All gates pass** -> Tell the Product Owner the ticket is ready. Ask which transition:
   - "Ready for Design" (if UI/UX work is needed)
   - "Ready for Development" (if no design needed, and UI/UX is N/A or pre-filled)

   **Any gate fails** -> Tell the Product Owner: "This ticket isn't ready yet. The following need attention: [list issues]." Do NOT update the status.

7. **If approved, update the Asana ticket status** to the chosen transition.
   - Add a comment: "Ticket reviewed and approved — moved to [new status]"

## Rules

- NEVER write to the repo. Product Owner output goes to Asana only.
- Open Questions not empty = ALWAYS block. No exceptions.
- Be specific about what's wrong — not "requirements are vague" but "Requirement 3 says 'improve loading speed' — what's the target? Under 2 seconds? Under 500ms?"
- This is a helper, not a blocker. If the Product Owner disagrees with a flag, they can override — but log it.

## Examples

### Example 1: Ticket passes all gates
User says: `/review-ticket https://app.asana.com/0/1234567/8901234`
Result: All 6 gates pass. Asks PO: "Ready for Design or Ready for Development?"

### Example 2: Ticket fails gates
User says: `/review-ticket https://app.asana.com/0/1234567/5555555`
Result: Gate 3 FAIL (Requirement 2 says "better error handling" — not testable), Gate 5 FAIL (Open Questions not empty). Lists specific issues.

## Troubleshooting

### Invalid Asana URL
**Cause**: URL doesn't match expected format.
**Solution**: Ask the user for the correct URL. The task ID is the last numeric segment.

### Ticket doesn't follow the contract template
**Cause**: The ticket was created without structured sections.
**Solution**: Review what exists and map to gates as best as possible. Flag missing sections as FAIL with guidance on what to add.

### Asana MCP unavailable
**Cause**: MCP server not connected or credentials expired.
**Solution**: Falls back to curl with `$ASANA_TOKEN`. Ensure the env var is set: `export ASANA_TOKEN=your-token`
