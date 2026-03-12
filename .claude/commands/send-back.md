---
name: ticket-send-back
description: Return an Asana ticket to PO or DESIGN when blocked. Use when user says "send back", "escalate to PO", "needs redesign", or "ticket needs work".
---

Send a ticket back to PO or DESIGN via Asana.

## Input

The user provides: $ARGUMENTS

Expected format: `{type/name} {reason}`

Examples:
- `feat/auth-sso OAuth library deprecated, need new approach`
- `feat/dashboard mobile layout unclear, need DESIGN input`

## Instructions

1. **Validate Asana access** — follow `references/asana-api-guide.md` Step 0 to verify the token is set. If missing, stop and tell the user.

2. **Parse arguments**: Extract the blueprint path and the reason text.

3. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).

4. **Extract the Asana URL** from the blueprint header (`> **Asana:**`).
   - If no Asana link, ask the user for the ticket URL.

5. **Ask who to send back to** (if not obvious from the reason):
   - **PO** — requirements need refinement, missing context, wrong assumptions
   - **DESIGN** — UI/UX spec doesn't work, need redesign, missing mockups

6. **Update the Asana ticket**:

   Using the Asana MCP tools (or curl fallback). For Asana API patterns (creating/reading/updating tasks, setting custom fields), see `references/asana-api-guide.md`.

   ### Sending to PO
   - Update the ticket status/section to "Needs Refinement" (or the equivalent custom field)
   - Add a comment: "Sent back for refinement by DEV: {reason}"

   ### Sending to DESIGN
   - Update the ticket status/section to "Needs Redesign" (or the equivalent custom field)
   - Add a comment: "Sent back for redesign by DEV: {reason}"

7. **Confirm to the user**:
   - Show what was updated in Asana
   - Remind: "When the ticket comes back as 'Ready for Development', run `/refresh {type}/{name}` to pull the updates into the blueprint."

Do NOT modify the blueprint itself. The blueprint stays as-is until `/refresh` is run after the ticket returns.

## Examples

### Example 1: Send back to PO
User says: `/send-back feat/auth-sso OAuth library deprecated, need new approach`
Result: Updates Asana ticket status to "Needs Refinement", adds comment with the reason. Reminds: "Run `/refresh feat/auth-sso` when it comes back."

### Example 2: Send back to Design
User says: `/send-back feat/dashboard mobile layout unclear, need DESIGN input`
Result: Updates Asana ticket status to "Needs Redesign", adds comment. Blueprint stays unchanged.

## Troubleshooting

### Blueprint has no Asana URL
**Cause**: The `> **Asana:**` field is empty or missing in the blueprint header.
**Solution**: Ask the user for the Asana ticket URL.

### Asana status update fails
**Cause**: The status/section name doesn't match the project's custom fields, or permissions are insufficient.
**Solution**: Try updating via comment only. Ask the user to manually change the status in Asana and confirm.

### Asana MCP unavailable
**Cause**: MCP server not connected or credentials expired.
**Solution**: Falls back to curl with `$ASANA_TOKEN`. Ensure the env var is set: `export ASANA_TOKEN=your-token`
