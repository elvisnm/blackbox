---
name: ticket-draft
description: Create a new Asana ticket using the contract template, grounded in codebase reality. Use when user says "draft ticket", "new ticket", "create Asana task", or "write requirements".
---

Create a new Asana ticket using the contract template.

## Input

The user provides: $ARGUMENTS

This should be a brief description of what they want to build or fix (e.g., "add dark mode toggle to settings page").

## Instructions

1. **Discuss the idea** with the Product Owner. Ask clarifying questions to understand:
   - What are we building and why?
   - What triggered this work?
   - What does the system do today?
   - What should it do after this change?
   - Are there any non-negotiable constraints?

2. **Research the codebase** (read-only) to ground the ticket in reality:
   - Use `Read`, `Glob`, `Grep` to find relevant code
   - Reference actual pages, buttons, API endpoints, data models
   - Describe current behavior based on what the code actually does
   - Identify existing components or patterns that relate to this work

3. **Fill the ticket template** using the structure defined in `references/contract-template-guide.md`. Include all required sections (Goal, Context, Requirements, UI/UX, Constraints, Open Questions).

4. **Determine the ticket type** from the content using the type mapping in `references/contract-template-guide.md`.

5. **Create the ticket in Asana** using the Asana MCP tools:
   - Set the description following the template above
   - Set custom fields: Type, Priority
   - Set status to "Draft"

   If Asana MCP is not available, fall back to curl:
   ```
   curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
     -X POST "https://app.asana.com/api/1.0/tasks" \
     -H "Content-Type: application/json" \
     -d '{"data": {"name": "TICKET_NAME", "notes": "TICKET_BODY", "projects": ["PROJECT_ID"]}}'
   ```

6. **Warn about weak sections** but still create the ticket. Flag:
   - Vague requirements ("improve performance" instead of measurable criteria)
   - Missing current/desired behavior
   - Empty sections that should be filled
   - Goal that is more than one sentence (scope may be too big — suggest splitting)

7. **Show the result** to the Product Owner:
   - Display the created ticket with a link
   - Highlight any flagged sections
   - Suggest next step: refine weak sections or move to "Refining" when ready

## Rules

- NEVER write to the repo. Product Owner output goes to Asana only.
- ALWAYS use codebase research to make the ticket specific and grounded.
- Requirements MUST be testable — not "better error handling" but "show user-friendly error message when API returns 429."
- Goal MUST be one sentence. If it takes more, the scope is too big.
