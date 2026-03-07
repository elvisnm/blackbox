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

### Code Style
- `.js` files use `snake_case` for variables, functions, properties
- `.tsx`/`.ts` files use `camelCase` for variables/functions, `PascalCase` for components/types
- No `var` -- only `const` or `let`
- No inline comments left from dev (only JSDoc allowed)
- Follows existing patterns in the codebase

### Code Quality
- No leftover `console.log` or debug code
- No TODOs or placeholder logic
- No unused imports or dead code
- Error handling is proper (no silent catches)
- No hardcoded values that should be configurable
- Functions are focused -- not doing too many things

### Security
- No exposed secrets, tokens, or credentials
- Input validation where needed
- No injection vulnerabilities (SQL, XSS, command injection)

### Performance
- No N+1 query patterns
- Proper async/await (no unnecessary awaits, no missing ones)
- No memory leaks (event listeners cleaned up, etc.)

### Tests
- New functionality has tests
- Tests use `snake_case` helpers in `.js` files
- Edge cases covered

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
