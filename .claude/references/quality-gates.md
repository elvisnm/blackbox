# Quality Gates

Used by `/review-ticket` to validate Asana tickets before marking them ready.

## Gate 1: Goal
- [ ] Goal section exists and is not empty
- [ ] Goal is one clear sentence (not a paragraph)
- [ ] Goal describes both WHAT and WHY

## Gate 2: Context
- [ ] Background section explains why this work matters
- [ ] Current Behavior is specific (references pages, endpoints, error messages — not vague)
- [ ] Desired Behavior is specific (same level of detail as Current Behavior)

## Gate 3: Requirements
- [ ] Requirements section has at least one item
- [ ] Each requirement is testable (someone can definitively say "yes" or "no")
- [ ] No vague requirements ("improve performance", "better UX", "handle errors properly")

## Gate 4: Constraints
- [ ] Constraints section exists (can be N/A if genuinely none)

## Gate 5: Open Questions
- [ ] Open Questions section is empty (HARD GATE — blocks all transitions)

## Gate 6: UI/UX (if routing through design)
- [ ] UI/UX section is either filled or explicitly marked N/A
