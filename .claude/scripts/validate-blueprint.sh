#!/bin/bash
# Validates a blueprint has all required sections.
# Usage: bash .claude/scripts/validate-blueprint.sh <blueprint-path>
# Exit code = number of missing sections (0 = valid)
# Output: JSON with pass/fail per section

FILE="$1"

if [ -z "$FILE" ]; then
  echo '{"error": "No file path provided"}'
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "{\"error\": \"File not found: $FILE\"}"
  exit 1
fi

ERRORS=0
RESULTS=""

check_section() {
  local label="$1"
  local pattern="$2"
  if grep -q "$pattern" "$FILE"; then
    RESULTS="${RESULTS}\"${label}\": \"pass\", "
  else
    RESULTS="${RESULTS}\"${label}\": \"MISSING\", "
    ERRORS=$((ERRORS + 1))
  fi
}

check_section "Goal" "^## Goal"
check_section "Context" "^## Context"
check_section "Background" "^### Background"
check_section "Current Behavior" "^### Current Behavior"
check_section "Desired Behavior" "^### Desired Behavior"
check_section "Requirements" "^## Requirements"
check_section "Constraints" "^## Constraints"
check_section "Codebase Context" "^## Codebase Context"
check_section "Implementation Plan" "^## Implementation Plan"
check_section "Validation" "^## Validation"

# Remove trailing comma+space
RESULTS="${RESULTS%, }"

echo "{${RESULTS}, \"errors\": ${ERRORS}}"
exit $ERRORS
