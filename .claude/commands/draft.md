---
name: ticket-draft
description: Create a new Asana ticket using the contract template, grounded in codebase reality. Use when user says "draft ticket", "new ticket", "create Asana task", or "write requirements".
---

Create a new Asana ticket using the contract template.

## Input

The user provides: $ARGUMENTS

This should be a brief description of what they want to build or fix (e.g., "add dark mode toggle to settings page").

## Instructions

1. **Validate Asana access** before anything else. Follow `references/asana-api-guide.md` Step 0 (token check) and Step 1 (resolve workspace/project from config). If the token is missing, stop immediately — don't start the discussion without it.

2. **Discuss the idea** with the Product Owner. Ask clarifying questions to understand:
   - What are we building and why?
   - What triggered this work?
   - What does the system do today?
   - What should it do after this change?
   - Are there any non-negotiable constraints?

3. **Research the codebase** (read-only) to ground the ticket in reality:
   - Use `Read`, `Glob`, `Grep` to find relevant code
   - Reference actual pages, buttons, API endpoints, data models
   - Describe current behavior based on what the code actually does
   - Identify existing components or patterns that relate to this work

4. **Fill the ticket template** using the structure defined in `references/contract-template-guide.md`. Include all required sections (Goal, Context, Requirements, UI/UX, Constraints, Open Questions).

5. **Determine the ticket type** from the content using the type mapping in `references/contract-template-guide.md`.

6. **Warn about weak sections** before creating the ticket. Flag:
   - Vague requirements ("improve performance" instead of measurable criteria)
   - Missing current/desired behavior
   - Empty sections that should be filled
   - Goal that is more than one sentence (scope may be too big — suggest splitting)

7. **Create the ticket in Asana** following `references/asana-api-guide.md`:
   - Use the workspace and project IDs resolved in step 1
   - Always use `notes` (plain text), NEVER `html_notes`
   - Set custom fields: Type, Priority
   - Move to "Draft" section (if it exists; otherwise use the first section and note it)
   - If the scope is large enough for an epic with sub-tickets, create them with dependencies

8. **Show the result** to the Product Owner:
   - Display the created ticket with a link
   - Highlight any flagged sections
   - Suggest next step: refine weak sections or move to "Refining" when ready

## Rules

- NEVER write to the repo. Product Owner output goes to Asana only.
- ALWAYS use codebase research to make the ticket specific and grounded.
- Requirements MUST be testable — not "better error handling" but "show user-friendly error message when API returns 429."
- Goal MUST be one sentence. If it takes more, the scope is too big.

## Examples

### Example 1: Draft a feature ticket
User says: `/draft add dark mode toggle to settings page`
Result: Discusses with PO, researches codebase for settings page and theme system, creates Asana ticket with Goal, Context (referencing actual `SettingsPage.tsx`), and testable Requirements.

### Example 2: Draft a bug fix ticket
User says: `/draft payment form crashes on empty email`
Result: Traces the bug in code, creates `fix` type ticket with Current Behavior (actual error), Desired Behavior, and specific requirements.

## Troubleshooting

### ASANA_TOKEN not set
**Cause**: Token not in environment. Common when shell profile hasn't been sourced.
**Solution**: Run `source ~/.zshrc` then retry. If still missing, set it: `export ASANA_TOKEN=your-token`. Token can be created at Asana → My Settings → Apps → Developer Apps → Personal Access Tokens.

### Asana API returns 401/403
**Cause**: Token expired, or calling `/projects` without a workspace filter.
**Solution**: Always pass `?workspace=WORKSPACE_GID` when listing projects. If token is expired, generate a new one in Asana.

### Asana project/workspace ID unknown
**Cause**: Not stored in `~/.blackbox/config.json` yet.
**Solution**: Follow the discovery steps in `references/asana-api-guide.md` Step 1. The skill will auto-save them to config for next time.

### html_notes parsing error
**Cause**: Used `html_notes` instead of `notes`. Asana's `html_notes` requires strict XML.
**Solution**: Always use `notes` (plain text). See `references/asana-api-guide.md` Common Mistakes.

### Codebase too large to research effectively
**Cause**: The repo has many files and it's unclear where to focus.
**Solution**: Ask the user which directories or modules are relevant. Focus research on those areas.
