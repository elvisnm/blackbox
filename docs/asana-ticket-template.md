# Asana Ticket Template

This is the contract between PO/DESIGN and DEV. PO's Claude enforces this structure when creating and updating Asana tickets. DEV's Claude (`/scaffold`) consumes it to generate blueprints.

## The Template

The Asana ticket description must follow this exact structure:

```markdown
## Goal

What are we building and why? One clear sentence.

## Context

### Background

Why does this matter? What triggered this work? Who reported it?

### Current Behavior

How does the system work today? Be specific — reference pages, buttons, API endpoints, error messages. Not "it's slow" but "the orders page takes 8 seconds to load when filtering by date range with more than 10,000 orders."

### Desired Behavior

How should it work after this change? Same level of specificity. Not "make it faster" but "the orders page should load in under 2 seconds regardless of filter or order count."

## Requirements

Testable acceptance criteria. Each one must be verifiable — someone should be able to look at the requirement and definitively say "yes, this works" or "no, it doesn't."

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## UI/UX

> This section is filled by DESIGN when the ticket goes through the design phase. If the ticket is routed directly to development (no design needed), this section can be left empty or marked N/A.

### Screens / Flows

What screens are involved? What's the user journey? Step by step.

### Component Choices

Which existing components should be reused? Any new ones needed? Reference specific component names from the codebase.

### Mockups

List of files attached to this Asana ticket:
- login-flow-mockup.png
- component-hierarchy.png

## Constraints

Non-negotiable rules. Performance budgets, browser support, backwards compatibility, security requirements, etc.

- Constraint 1
- Constraint 2

## Open Questions

Anything unresolved. This section MUST be empty before the ticket can move to "Ready for Development."

- Question 1
- Question 2
```

## Custom Fields

In addition to the description, the ticket should use Asana custom fields for machine-readable metadata:

| Field | Values | Purpose |
|-------|--------|---------|
| Type | `feat`, `fix`, `improve`, `hotfix` | Blueprint category |
| Priority | `P0` (critical), `P1` (high), `P2` (medium), `P3` (low), `P4` (backlog) | Prioritization |
| Status | See status flow below | Workflow tracking |

## Asana Status Flow

These are the Asana ticket statuses (sections or custom field):

```
Draft -> Refining -> Ready for Design -> Designing -> Ready for Development -> In Progress -> PR Review -> Ready to Test -> Testing -> Done
```

Shortcuts:
- No design needed: Draft -> Refining -> Ready for Development -> ...
- Hotfix: Draft -> In Progress -> PR Review -> Ready to Test -> Done

Send-backs:
- Needs Refinement (back to PO)
- Needs Redesign (back to DESIGN)
- PR Changes (back to DEV)

## Rules

### For PO's Claude

1. **Always use this template** when creating a new ticket. Every section must be present, even if marked N/A or TBD.

2. **Goal must be one sentence.** If you can't say it in one sentence, the scope is too big — split the ticket.

3. **Current Behavior and Desired Behavior must be specific.** Reference actual pages, buttons, API endpoints, error messages. PO's Claude has read-only codebase access — use it to be precise.

4. **Requirements must be testable.** Not "improve performance" but "page loads in under 2 seconds on 3G." Not "better error handling" but "show user-friendly error message when API returns 429."

5. **Open Questions must be empty** before moving to "Ready for Design" or "Ready for Development." This is the hard gate. If there are unresolved questions, the ticket isn't ready.

6. **Warn at creation, block at transition.** When creating a ticket, Claude warns about missing or weak sections but still creates it. When moving to "Ready for Design" or "Ready for Development", Claude blocks if:
   - Open Questions section is not empty
   - Goal is missing
   - Requirements section is empty
   - Current Behavior or Desired Behavior is vague or missing

### For DESIGN's Claude

1. **Fill the UI/UX section** — Screens/Flows, Component Choices, Mockups.

2. **Reference existing components** from the codebase by name. DESIGN's Claude has read-only codebase access — use it to find what's already built.

3. **Attach mockups** to the Asana ticket and list filenames in the Mockups subsection.

4. **Open Questions must be empty** before moving to "Ready for Development." If DESIGN has questions for PO, add them to Open Questions and send back.

### For DEV's Claude (`/scaffold`)

1. **Parse this template** to generate the blueprint. Map sections:
   - Asana Goal -> Blueprint Goal
   - Asana Context -> Blueprint Context
   - Asana Requirements -> Blueprint Requirements
   - Asana UI/UX -> Blueprint UI/UX
   - Asana Constraints -> Blueprint Constraints

2. **Flag weak sections** — if Current Behavior is vague or Requirements aren't testable, warn the developer. They can proceed or `/send-back` for refinement.

3. **Custom fields** (Type, Priority) inform the blueprint category and folder placement.
