Refine a blueprint by researching the target project's codebase.

## Input

The user provides: $ARGUMENTS (blueprint path, e.g., `feat/dashboard`)

## Instructions

1. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).

2. **The project codebase is the current repo.** Since `.blackbox/blueprints/` lives inside the project, Claude already has access to the full codebase.

3. **Read the blueprint** to understand:
   - The Goal
   - The Context (background, current/desired behavior)
   - The Requirements
   - The Constraints
   - Any already-filled Codebase Context (from a previous refine)

4. **Research the codebase** — this is the core of refinement:

   a. **Identify the tech stack**: Check for package.json, Cargo.toml, go.mod, etc. Note language, framework, key libraries.

   b. **Find related files**: Search the codebase for files directly relevant to this blueprint. Use Glob and Grep to find:
      - Files matching keywords from the goal/requirements
      - Existing implementations of similar features
      - Configuration files that might need changes
      - Test files that follow patterns we should match

   c. **Map dependencies**: Identify internal modules and external packages this work will touch or depend on.

   d. **Understand existing patterns**: Look at how similar features are implemented. Note file organization, naming patterns, testing patterns, API patterns.

   e. **Identify edge cases**: Based on the codebase structure, flag edge cases the blueprint should address.

5. **Update the blueprint** with findings:

   - **Codebase Context > Related Files**: List each relevant file with a brief description of why it matters
   - **Codebase Context > Dependencies**: List internal modules and external packages
   - **Codebase Context > Existing Patterns**: How similar things are done in the codebase today
   - **Implementation Plan**: Draft phased steps based on the codebase structure. Mark each step as `[deterministic]` (exact action) or `[agentic]` (requires judgment).
   - **Validation**: Fill in tests to write, manual verification steps, and lint/type commands from the project

6. **Present the changes** to the user:
   - Summarize what you found in the codebase
   - Highlight the suggested approach and ask if it aligns with their vision
   - Flag any open questions or decisions needed
   - Ask if they want to adjust anything before committing

Do NOT commit automatically. Let the user review and commit when ready.
