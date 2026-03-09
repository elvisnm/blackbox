# Review Checklist

Use this checklist for both self-reviews (`/review-code`) and PR reviews (`/pr-review`).

## Code Style
- `.js` files use `snake_case` for variables, functions, properties
- `.tsx`/`.ts` files use `camelCase` for variables/functions, `PascalCase` for components/types
- No `var` -- only `const` or `let`
- No inline comments left from dev (only JSDoc allowed)
- Follows existing patterns in the codebase

## Code Quality
- No leftover `console.log` or debug code
- No TODOs or placeholder logic
- No unused imports or dead code
- Error handling is proper (no silent catches)
- No hardcoded values that should be configurable
- Functions are focused -- not doing too many things

## Security
- No exposed secrets, tokens, or credentials
- Input validation where needed
- No injection vulnerabilities (SQL, XSS, command injection)
- Proper authentication/authorization checks

## Performance
- No N+1 query patterns
- Proper async/await (no unnecessary awaits, no missing ones)
- No memory leaks (event listeners cleaned up, etc.)

## Tests
- New functionality has tests
- Tests use `snake_case` helpers in `.js` files
- Edge cases covered

## Docs (PR reviews only)
- JSDoc for public functions
- Complex logic has explanatory comments (sparingly)
