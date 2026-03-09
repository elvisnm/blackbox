---
name: ticket-refine
description: Improve an existing Asana ticket by adding code-grounded details. Use when user says "refine ticket", "improve ticket", or "strengthen requirements".
---

Improve an existing Asana ticket based on codebase research.

## Input

The user provides: $ARGUMENTS

This should be an Asana task URL (e.g., https://app.asana.com/0/PROJECT_ID/TASK_ID).

## Instructions

1. **Extract the Asana task ID** by running `bash .claude/scripts/parse-asana-url.sh {url}`. This returns JSON with `task_id` and optionally `project_id`.

2. **Fetch the Asana task** using the Asana MCP tools:
   - Get the task details (name, notes, custom fields)
   - Get the task comments/stories for additional context

   If Asana MCP is not available, fall back to curl:
   ```
   curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
     "https://app.asana.com/api/1.0/tasks/{task_id}?opt_fields=name,notes,custom_fields,tags.name"
   ```

3. **Parse the ticket** expecting the contract template sections defined in `references/contract-template-guide.md` (Goal, Context, Requirements, UI/UX, Constraints, Open Questions).

4. **Research the codebase** (read-only) to improve each section:

   ### Current Behavior
   - Trace the actual code flow for the feature described
   - Reference specific files, functions, API endpoints, database models
   - Replace vague descriptions with specific, code-grounded ones

   ### Desired Behavior
   - Based on the goal, describe what needs to change in specific terms
   - Reference the actual files/components that will be affected

   ### Requirements
   - Make each requirement testable and specific
   - Add requirements that are implied but missing
   - Reference actual UI elements, API responses, error codes

   ### Constraints
   - Identify technical constraints from the codebase (dependencies, patterns, limitations)
   - Add performance or compatibility constraints if relevant

5. **Present the improvements** to the Product Owner:
   - Show a before/after comparison for each section you improved
   - Highlight what you found in the codebase that informed the changes
   - Flag any new Open Questions discovered during research

6. **Update the Asana ticket** after Product Owner approval:
   - Update the description with the refined content
   - Add a comment: "Ticket refined with codebase research — [summary of changes]"
   - If the ticket was in "Draft", suggest moving to "Refining"

## Rules

- NEVER write to the repo. Product Owner output goes to Asana only.
- ALWAYS ground improvements in actual code — never speculate about how the system works.
- If you find something unexpected in the codebase, add it to Open Questions rather than assuming.
- Show changes to the Product Owner before updating the ticket.

## Troubleshooting

### Invalid Asana URL
**Cause**: URL doesn't match expected format.
**Solution**: Ask the user for the correct URL. The task ID is the last numeric segment.

### Ticket doesn't follow the contract template
**Cause**: The ticket was created without the structured template.
**Solution**: Map existing content to the closest template sections. Flag what's missing and suggest the user fills it in Asana first.

### Asana MCP unavailable
**Cause**: MCP server not connected or credentials expired.
**Solution**: Falls back to curl with `$ASANA_TOKEN`. Ensure the env var is set: `export ASANA_TOKEN=your-token`
