# Design Validation Checks

Used by `/review-design` to validate UI/UX specs against the codebase.

## Check 1: Component Existence
- [ ] Every referenced component actually exists at the specified path
- [ ] Component names match exactly (case-sensitive)
- [ ] File paths are correct

## Check 2: Component Compatibility
- [ ] Referenced components support the described use case
- [ ] Props/inputs needed are available on the component
- [ ] Components work together (no conflicting patterns)

## Check 3: Pattern Consistency
- [ ] New components follow existing naming conventions
- [ ] Proposed interactions match how similar features work in the codebase
- [ ] Styling approach is consistent with the project's conventions

## Check 4: Completeness
- [ ] All screens in the flow are covered
- [ ] Error states are addressed
- [ ] Loading states are addressed
- [ ] Empty states are addressed (if applicable)
- [ ] Responsive behavior is specified (if applicable)

## Check 5: Handoff Readiness
- [ ] Developer can build this without ambiguity
- [ ] No references to components that don't exist without explaining what to build
- [ ] Mockups are attached (if referenced)
