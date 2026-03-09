---
name: blueprint-scaffold
description: Generate a blueprint from an Asana ticket URL. Use when user says "scaffold", "create blueprint from Asana", or pastes an Asana task URL to start a new blueprint.
---

Generate a blueprint from an Asana ticket.

## Input

The user provides: $ARGUMENTS

This should be an Asana task URL (e.g., https://app.asana.com/0/PROJECT_ID/TASK_ID).

## Instructions

1. **Extract the Asana task ID** from the URL. The task ID is the last numeric segment.

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
