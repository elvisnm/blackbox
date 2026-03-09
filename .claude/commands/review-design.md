Validate design specs against existing components and patterns in the codebase.

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

3. **Parse the UI/UX section** of the ticket. Extract:
   - Screens / Flows
   - Component Choices (reuse existing + new components)
   - Mockup references

4. **Validate each component reference** against the codebase:

   ### Check 1: Component Existence
   - [ ] Every referenced component actually exists at the specified path
   - [ ] Component names match exactly (case-sensitive)
   - [ ] File paths are correct

   ### Check 2: Component Compatibility
   - [ ] Referenced components support the described use case
   - [ ] Props/inputs needed are available on the component
   - [ ] Components work together (no conflicting patterns)

   ### Check 3: Pattern Consistency
   - [ ] New components follow existing naming conventions
   - [ ] Proposed interactions match how similar features work in the codebase
   - [ ] Styling approach is consistent with the project's conventions

   ### Check 4: Completeness
   - [ ] All screens in the flow are covered
   - [ ] Error states are addressed
   - [ ] Loading states are addressed
   - [ ] Empty states are addressed (if applicable)
   - [ ] Responsive behavior is specified (if applicable)

   ### Check 5: Handoff Readiness
   - [ ] Developer can build this without ambiguity
   - [ ] No references to components that don't exist without explaining what to build
   - [ ] Mockups are attached (if referenced)

5. **Present the review** to the Designer:

   For each check, show:
   - PASS or FAIL
   - Specific issues found (if FAIL)
   - Suggestions — e.g., "You referenced `Modal` but the project uses `Dialog` from `components/Dialog.tsx`"

6. **Determine readiness**:

   **All checks pass** -> Tell the Designer the spec is ready. Suggest moving to "Ready for Development."

   **Issues found** -> List them and let the Designer decide:
   - Fix the issues and re-review
   - Send back to Product Owner if requirements are the problem
   - Override and proceed (log the decision in a comment)

7. **If approved, update the Asana ticket**:
   - Set status to "Ready for Development"
   - Add a comment: "Design reviewed and approved — ready for development"

## Rules

- NEVER write to the repo. Designer output goes to Asana only.
- Be specific about mismatches — not "component doesn't exist" but "`UserCard` was referenced at `components/UserCard.tsx` but the actual path is `components/users/ProfileCard.tsx`."
- Missing error/loading/empty states is a warning, not a blocker — but always flag it.
- If Open Questions section is not empty, BLOCK the transition to "Ready for Development."
