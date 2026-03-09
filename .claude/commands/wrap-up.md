---
name: dev-wrap-up
description: Clean code, run linting, generate commit message, and create PR document. Use when user says "wrap up", "finish", "prepare for PR", or "clean up code".
---

Wrap up work, clean code, and prepare for PR.

When user says "wrap up", "finish", or "wrap it up".

## Input

The user provides: $ARGUMENTS (optional -- blueprint path like `feat/dashboard`)

If no argument given, try to detect the blueprint from the current branch name or recent work context.

## Sequence (CRITICAL: Follow this exact sequence. Do NOT skip steps.)

### 1. Remove Inline Comments
- Scan all modified files (from `git diff --name-only`)
- Remove inline comments added during dev (keep JSDoc, keep pre-existing comments)
- Exception: inline comments in test files are OK

### 2. Simplify & Review Code Quality
- Run `/simplify` on the changed code
- This reviews all modified files for reuse opportunities, code quality, and efficiency
- Apply any fixes it identifies (redundant code, missed abstractions, performance issues)
- If `/simplify` suggests changes, apply them before moving to the next step

### 3. Run ESLint
Run linting on changed files. The exact command depends on the project setup:
- Check if the project has a lint script in `package.json`
- If `docker-compose.worktree.yml` exists, run via Docker: `docker exec <container> npx eslint <files>`
- Otherwise try: `npx eslint <changed-files>` or the project's lint command
- Fix any issues found before proceeding

### 4. Generate Commit Message
- Run `git status` and `git diff` on modified files
- Summarize ONLY changes in the diff (not intermediate steps from the conversation)
- Present a commit message following the convention: `[DEV] {type}/{blueprint-name}: summary`
- **DO NOT commit** -- wait for user approval

### 5. Create PR Document (MANDATORY)
- **Read the PR template**: `.blackbox/prs/_template.md`
- **Determine the blueprint path**: from the argument, branch name, or ask the user
- **Read the blueprint** to pull context (Goal, Asana link)
- **Create the PR doc**: `.blackbox/prs/{type}/{blueprint-name}.md`
- **Fill in all sections**:
  - `# Title`: Must start with a prefix based on the type of change:
    - Bugfix -> `Fix: <title>`
    - New feature -> `Feat: <title>`
    - Enhancement -> `Enhance: <title>`
    - Refactoring -> `Refactor: <title>`
    - Hotfix -> `HOTFIX: <title>`
    - Updating dependencies -> `Deps: <title>`
  - `> **Blueprint:**`: Set to `{type}/{blueprint-name}`
  - `## Type of change`: Check the applicable box
  - `## Description`: Summarize what changed in the code
  - `## Context`: Why the change was needed. Pull context from the blueprint's Goal section. Add the Asana link on its own line if available.
  - `## Testing`: Checklist of what to test (happy path + edge cases + regressions)

### 6. Summary
- Confirm all steps completed
- Show what was created/modified
- Remind user to review and commit when ready

## Individual Commands

These can be triggered separately:

| Command | Action |
|---------|--------|
| `commit message` | Just step 4 (git diff -> suggest message) |
| `branch name` | Suggest a branch name based on the work |
| `simplify` | Just step 2 (review & fix code quality) |

## Examples

### Example 1: Full wrap-up with blueprint
User says: `/wrap-up feat/dashboard`
Result: Removes inline comments, runs `/simplify`, runs ESLint, suggests commit message `[DEV] feat/dashboard: implement dashboard layout`, creates PR doc at `.blackbox/prs/feat/dashboard.md`.

### Example 2: Just a commit message
User says: `commit message`
Result: Runs git diff, summarizes changes, suggests: `[DEV] feat/dashboard: add sidebar navigation component`.

## Troubleshooting

### ESLint fails with errors
**Cause**: Code has lint violations.
**Solution**: Fix the issues before proceeding. If they're in files you didn't change, note them but don't block the wrap-up.

### Docker container not running
**Cause**: `docker-compose.worktree.yml` exists but the container isn't up.
**Solution**: Fall back to running eslint locally with `npx eslint`. If that also fails, skip linting and note it in the PR doc.

### PR template not found
**Cause**: `.blackbox/prs/_template.md` doesn't exist.
**Solution**: Run `bbox init` to set up the structure. Or create the PR doc manually without the template.

### Can't determine blueprint path
**Cause**: No argument given and branch name doesn't match a blueprint.
**Solution**: Ask the user for the blueprint path (e.g., `feat/dashboard`).
