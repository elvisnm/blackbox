Fill the UI/UX section of an Asana ticket with component references from the codebase.

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

3. **Read the ticket** — understand the Goal, Context, Requirements, and Constraints before starting design work.

4. **Set the ticket status** to "Designing" in Asana.

5. **Research existing UI patterns** in the codebase (read-only):

   - **Components**: What UI components already exist? Search for shared components, form elements, modals, tables, buttons.
   - **Patterns**: How are similar features currently built? Find pages that do similar things.
   - **Styling**: What CSS framework or component library is used? What are the conventions?
   - **Interactions**: How do forms submit? How do lists handle filtering/sorting? How are modals triggered?

   Use `Glob` and `Grep` to find components by name, `Read` to understand their props and usage.

6. **Fill the UI/UX section** of the ticket:

```markdown
## UI/UX

### Screens / Flows

Step-by-step user journey:
1. User navigates to [page]
2. User sees [elements]
3. User clicks [button]
4. System shows [result]

### Component Choices

Reuse existing:
- `ComponentName` (from `path/to/component`) — for [purpose]
- `AnotherComponent` (from `path/to/component`) — for [purpose]

New components needed:
- `NewComponent` — [description and why existing ones don't fit]

### Mockups

Files attached to this ticket:
- mockup-main-view.png
- mockup-error-state.png
```

7. **Present the UI/UX spec** to the Designer:
   - Show what existing components you found and recommend reusing
   - Show what needs to be built new
   - Describe the user flow step by step
   - Ask if the Designer wants to attach mockups

8. **Update the Asana ticket** after Designer approval:
   - Update the description with the filled UI/UX section (preserve all other sections)
   - Add a comment: "UI/UX section filled — [summary of component choices]"
   - If requirements seem unclear, add questions to Open Questions and suggest sending back to Product Owner

9. **When design is complete**, ask the Designer if the ticket is ready:
   - If yes, set status to "Ready for Development"
   - If questions remain, keep status as "Designing" or send back

## Rules

- NEVER write to the repo. Designer output goes to Asana only.
- ALWAYS reference components by their actual name and file path from the codebase — not "use a modal" but "use `Dialog` from `frontend/components/Dialog.tsx`."
- Preserve all existing ticket sections when updating — only fill/modify the UI/UX section.
- If the ticket's Goal or Requirements are unclear, send back to Product Owner rather than guessing.
