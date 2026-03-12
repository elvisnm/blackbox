# Contract Template

Asana tickets follow this structured template. Used by `/draft`, `/refine`, and `/review-ticket`.

## Required Sections

```markdown
## Goal

What are we building and why? One clear sentence.

## Context

### Background

Why does this matter? What triggered this work? Who reported it?

### Current Behavior

How does the system work today? Be specific — reference pages, buttons, API endpoints, error messages.

### Desired Behavior

How should it work after this change? Same level of specificity.

## Requirements

Testable acceptance criteria. Each one verifiable.

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## UI/UX

> Filled by Designer. Leave empty or N/A if routing directly to development.

## Constraints

Non-negotiable rules. Performance budgets, browser support, backwards compatibility.

## Open Questions

Anything unresolved. MUST be empty before "Ready for Development."
```

## Ticket Types

Determined from content:

| Content | Type |
|---------|------|
| New functionality | `feat` |
| Something broken | `fix` |
| Enhancement to existing behavior | `improve` |
| Urgent production issue | `hotfix` |

## Quality Rules

- Goal MUST be one sentence. If it takes more, the scope is too big.
- Requirements MUST be testable — not "better error handling" but "show user-friendly error message when API returns 429."
- Open Questions MUST be empty before any transition to "Ready for Development."
