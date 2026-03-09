---
name: blueprint-scaffold
description: Generate a blueprint from an Asana ticket URL. Use when user says "scaffold", "create blueprint from Asana", or pastes an Asana task URL to start a new blueprint.
---

Generate a blueprint from an Asana ticket.

## Input

The user provides: $ARGUMENTS

This should be an Asana task URL (e.g., https://app.asana.com/0/PROJECT_ID/TASK_ID).

## Instructions

1. **Extract the Asana task ID** by running `bash .claude/scripts/parse-asana-url.sh {url}`. This returns JSON with `task_id` and optionally `project_id`.

2. **Fetch the Asana task** using the Asana MCP tools:
   - Get the task details (name, notes, custom fields, assignee, tags, memberships)
   - Get the task comments/stories for additional context

   If Asana MCP is not available, fall back to curl:
   ```
   curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
     "https://app.asana.com/api/1.0/tasks/{task_id}?opt_fields=name,notes,assignee.name,created_at,custom_fields,tags.name,memberships.section.name,memberships.project.name"
   ```

3. **Parse the Asana ticket** expecting a structured template with these sections:
   - `## Goal` — what and why
   - `## Context` > `### Background`, `### Current Behavior`, `### Desired Behavior`
   - `## Requirements` — checkboxed acceptance criteria
   - `## UI/UX` (optional) — screens, flows, component choices, mockup references
   - `## Constraints` — non-negotiable rules

   If the ticket doesn't follow the template, extract what you can and map it to the right sections. Flag sections that are empty or vague.

4. **Determine the blueprint type** from the task content:
   - New functionality -> `feat`
   - Something broken -> `fix`
   - Enhancement to existing behavior -> `improve`
   - Urgent production issue -> `hotfix`

5. **Generate the filename**: `{short-description}.md`
   - Lowercase, kebab-case, 2-4 words
   - Placed in `.blackbox/blueprints/{type}/`

6. **Read the template** from `.blackbox/blueprints/_template.md`

7. **Create the blueprint** by filling the template:
   - **Header Asana link**: the original URL
   - **Header PR**: `_pending_`
   - **Goal**: from Asana `## Goal`
   - **Context**: from Asana `## Context` (Background, Current Behavior, Desired Behavior)
   - **Requirements**: from Asana `## Requirements`
   - **UI/UX**: from Asana `## UI/UX` (if present), reference Asana attachment URLs for mockups
   - **Constraints**: from Asana `## Constraints`
   - **Codebase Context**: leave empty (filled during `/refine`)
   - **Implementation Plan**: leave empty (filled during `/refine`)
   - **Technical Decisions**: leave empty (filled during implementation)
   - **Validation**: leave empty (filled during `/refine`)

8. **Save the blueprint** to `.blackbox/blueprints/{type}/{filename}.md`

9. **Show the user** the created blueprint:
   - Highlight any sections that are empty or weak
   - Ask if the type is correct
   - Suggest next step: `/refine {type}/{name}` to research the codebase

Do NOT commit automatically. Let the user decide when to commit.

## Examples

### Example 1: Scaffold from Asana URL
User says: `/scaffold https://app.asana.com/0/1234567/8901234`
Result: Blueprint created at `.blackbox/blueprints/feat/user-auth.md` with Goal, Context, and Requirements pulled from the Asana ticket.

### Example 2: Ticket without structured template
User says: `/scaffold https://app.asana.com/0/1234567/5555555`
Result: Blueprint created with best-effort section mapping. Empty or vague sections are flagged for the user to review.

## Troubleshooting

### Invalid Asana URL
**Cause**: URL doesn't match expected format `https://app.asana.com/0/PROJECT_ID/TASK_ID`.
**Solution**: Ask the user for the correct URL. The task ID is the last numeric segment.

### Asana task has no description
**Cause**: The ticket was created without structured content.
**Solution**: Extract what you can from the task name and comments. Flag all empty sections and suggest the user fills them in Asana first, or proceed with a minimal blueprint.

### Asana MCP unavailable
**Cause**: MCP server not connected or credentials expired.
**Solution**: Falls back to curl with `$ASANA_TOKEN`. Ensure the env var is set: `export ASANA_TOKEN=your-token`

### ASANA_TOKEN not set
**Cause**: Environment variable missing and MCP is also unavailable.
**Solution**: Tell the user to set it: `export ASANA_TOKEN=your-token`. The token can be created at https://app.asana.com/0/my-apps.

### Blueprint template not found
**Cause**: `.blackbox/blueprints/_template.md` doesn't exist.
**Solution**: Run `bbox init` to set up the Blackbox structure, or ask the user to create the template manually.
