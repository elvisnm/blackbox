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

1. **Parse arguments**: Extract the blueprint path and the reason text.

2. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).

3. **Extract the Asana URL** from the blueprint header (`> **Asana:**`).
   - If no Asana link, ask the user for the ticket URL.

4. **Ask who to send back to** (if not obvious from the reason):
   - **PO** — requirements need refinement, missing context, wrong assumptions
   - **DESIGN** — UI/UX spec doesn't work, need redesign, missing mockups

5. **Update the Asana ticket**:

   Using the Asana MCP tools (or curl fallback):

   ### Sending to PO
   - Update the ticket status/section to "Needs Refinement" (or the equivalent custom field)
   - Add a comment: "Sent back for refinement by DEV: {reason}"

   ### Sending to DESIGN
   - Update the ticket status/section to "Needs Redesign" (or the equivalent custom field)
   - Add a comment: "Sent back for redesign by DEV: {reason}"

6. **Confirm to the user**:
   - Show what was updated in Asana
   - Remind: "When the ticket comes back as 'Ready for Development', run `/refresh {type}/{name}` to pull the updates into the blueprint."

Do NOT modify the blueprint itself. The blueprint stays as-is until `/refresh` is run after the ticket returns.
