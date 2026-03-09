---
name: pr-review
description: Review someone else's pull request with structured feedback. Use when user says "review PR", "review this branch", or provides a PR URL/number for review.
---

Review someone else's pull request.

When user says "new review" or "review pr".

## Input

The user provides: $ARGUMENTS (branch name, PR URL, or PR number)

## Instructions

### 1. Get Branch Context
- If a branch name is provided, use it
- If a PR URL or number is provided, extract the branch: `gh pr view <number> --json headRefName`
- If nothing provided, ask the user for the branch name or PR number

### 2. Fetch and Diff
```bash
git fetch origin <branch>
git diff --name-only origin/main...origin/<branch>
git diff origin/main...origin/<branch>
```
Adjust `main` to the project's base branch if different.

### 3. Read Changed Files
Read each changed file in FULL (not just the diff). You need the complete file context to give good reviews. Line numbers in your comments must match the file, NOT the diff.

### 4. Review Against Checklist

- **Style**: `.js` uses `snake_case`, `.tsx/.ts` uses `camelCase`/`PascalCase`, no unnecessary camelCase (except external API requirements), follows codebase patterns
- **Quality**: no bugs, proper error handling, no dead code, no hardcoded values, no unused imports
- **Security**: no exposed secrets, input validation, no injection vulnerabilities, proper authentication/authorization checks
- **Performance**: no N+1 queries, proper async/await, no memory leaks
- **Tests**: added for new functionality, `snake_case` helpers in `.js`, edge cases covered
- **Docs**: JSDoc for public functions, complex logic has explanatory comments (sparingly)

### 5. Write Comments

**Tone**: Senior dev -- polite but direct. Suggest, never impose.

Good examples:
- "Maybe extract this to a helper? Would make it easier to test."
- "Might want to add a null check here -- could blow up if the API returns empty."
- "This works, but a `Map` might be faster for lookups if the list grows."

**Always show code examples** when suggesting changes.

**Format per file:**
```markdown
### `path/to/file.js`

**Line 42**
> code snippet
Comment + suggested fix

**Line 58-62**
> multi-line code snippet
Comment
```

**Severity** (for summary stats, not in individual comments):
- **blocker**: Must be fixed before merge
- **issue**: Should be fixed, but could be a follow-up
- **suggestion**: Nice to have, optional improvement
- **question**: Clarification needed

### 6. Create Review Document
- **Create file**: `.blackbox/prs/reviews/review-<branch-name>.md`
- **Fill in all sections**:

```markdown
# PR Review: <branch-name>

## Metadata
- **Branch**: `<branch-name>`
- **PR Link**: <PR URL or N/A>
- **Reviewed**: <today's date>
- **Base Branch**: <base branch>

## Summary of Changes
Brief description of what this PR does.

## Files Changed
| File | Changes |
|------|---------|
| `path/to/file.js` | Brief description |

## Review Comments

### `path/to/file.js`

**Line XX**
> code snippet
Comment

---

## Review Stats
- **Files Reviewed**: X
- **Blockers**: X
- **Issues**: X
- **Suggestions**: X
- **Questions**: X

## Verdict
- [ ] Approve
- [ ] Request Changes
- [ ] Comment Only

## Additional Notes
Any other observations or context.
```

### 7. Present Summary
- Total files reviewed
- Count of comments by severity
- Overall verdict recommendation
- Path to the review document
