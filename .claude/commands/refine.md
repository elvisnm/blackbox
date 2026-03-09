---
name: blueprint-refine
description: Research the target project's codebase and fill technical context into a blueprint. Use when user says "refine", "research codebase", or "fill implementation plan".
---

Refine a blueprint by researching the target project's codebase.

## Input

The user provides: $ARGUMENTS (blueprint path, e.g., `feat/dashboard`)

## Instructions

1. **Read the blueprint** from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing).

2. **Validate the blueprint structure** by running `bash .claude/scripts/validate-blueprint.sh {blueprint-path}`. If sections are missing, fix them before proceeding.

3. **The project codebase is the current repo.** Since `.blackbox/blueprints/` lives inside the project, Claude already has access to the full codebase.

4. **Read the blueprint** to understand:
   - The Goal
   - The Context (background, current/desired behavior)
   - The Requirements
   - The Constraints
   - Any already-filled Codebase Context (from a previous refine)

5. **Research the codebase** — this is the core of refinement:

   a. **Identify the tech stack**: Check for package.json, Cargo.toml, go.mod, etc. Note language, framework, key libraries.

   b. **Find related files**: Search the codebase for files directly relevant to this blueprint. Use Glob and Grep to find:
      - Files matching keywords from the goal/requirements
      - Existing implementations of similar features
      - Configuration files that might need changes
      - Test files that follow patterns we should match

   c. **Map dependencies**: Identify internal modules and external packages this work will touch or depend on.

   d. **Understand existing patterns**: Look at how similar features are implemented. Note file organization, naming patterns, testing patterns, API patterns.

   e. **Identify edge cases**: Based on the codebase structure, flag edge cases the blueprint should address.

6. **Update the blueprint** with findings:

   - **Codebase Context > Related Files**: List each relevant file with a brief description of why it matters
   - **Codebase Context > Dependencies**: List internal modules and external packages
   - **Codebase Context > Existing Patterns**: How similar things are done in the codebase today
   - **Implementation Plan**: Draft phased steps based on the codebase structure. Mark each step as `[deterministic]` (exact action) or `[agentic]` (requires judgment).
   - **Validation**: Fill in tests to write, manual verification steps, and lint/type commands from the project

7. **Present the changes** to the user:
   - Summarize what you found in the codebase
   - Highlight the suggested approach and ask if it aligns with their vision
   - Flag any open questions or decisions needed
   - Ask if they want to adjust anything before committing

Do NOT commit automatically. Let the user review and commit when ready.

## Examples

### Example 1: Refine a feature blueprint
User says: `/refine feat/dashboard`
Result: Codebase Context filled with related files, dependencies, and patterns. Implementation Plan drafted with phased tasks marked `[deterministic]` or `[agentic]`.

### Example 2: Re-refine after requirements changed
User says: `/refine feat/dashboard` (after a `/refresh`)
Result: Existing Codebase Context and Implementation Plan are updated based on new requirements. Previously filled sections are revised, not wiped.

## Troubleshooting

### Blueprint not found
**Cause**: Wrong path or blueprint doesn't exist yet.
**Solution**: Run `/status` to list available blueprints, or `/scaffold` to create one from an Asana ticket.

### No package.json / Cargo.toml / go.mod found
**Cause**: The project root doesn't have a recognizable manifest file.
**Solution**: Look deeper — check subdirectories for the tech stack. Ask the user which language/framework is used if unclear.

### No related files found in codebase
**Cause**: Search terms from the blueprint don't match any code.
**Solution**: Try broader search terms. Read the Goal and Requirements again for alternative keywords. Ask the user to point to relevant files or directories.
