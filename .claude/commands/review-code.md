---
name: code-review-self
description: Self-review changed files against quality checklist before committing. Use when user says "review code", "check my changes", or "self-review".
---

Self-review of your own work before committing.

## Input

The user provides: $ARGUMENTS (optional -- can be empty)

## Instructions

1. **Get changed files**: Run `git diff --name-only` (unstaged) and `git diff --name-only --cached` (staged). Combine both lists, removing duplicates.

2. **Exclude non-code files** -- skip:
   - `build/`, `dist/`, `node_modules/`, `.next/`, `.cache/`
   - `*.min.js`, `*.map`, `*.lock`, `package-lock.json`
   - Any generated or compiled files
   - Markdown files in `.blackbox/` (blueprints and PR docs are not code)

3. **Read each changed file** in full (not just the diff -- you need full context to review properly).

4. **Review against the checklist** below. Check every item for every file.

5. **Report findings** grouped by severity.

6. **Ask**: "Want me to fix the blockers?"

## Checklist

Consult `references/review-checklist.md` for the full checklist (Code Style, Code Quality, Security, Performance, Tests).

## Output Format

```
## Review Summary

**Files reviewed:** X
**Issues found:** X blockers, X suggestions

### Blockers (must fix)
- `path/to/file.js` L42: console.log left in production code
- `path/to/file.ts` L18: missing error handling on API call

### Suggestions (nice to have)
- `path/to/file.js` L55: could extract to helper for reusability

### All Good
- Code style
- Security
- Tests
```

After presenting findings, ask: "Want me to fix the blockers?"

## Phase 2: Simplify

After the checklist review is complete and any blockers are addressed, run `/simplify` to do a deeper code reuse, quality, and efficiency review of the same changes.
