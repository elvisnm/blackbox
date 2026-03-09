#!/bin/bash
# Validates a PR document has required sections and title prefix.
# Usage: bash .claude/scripts/validate-pr-doc.sh <pr-doc-path>
# Exit code = number of issues (0 = valid)
# Output: JSON with pass/fail per check

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

# Check required sections
check_section "Title" "^# "
check_section "Type of change" "^## Type of change"
check_section "Description" "^## Description"
check_section "Context" "^## Context"
check_section "Testing" "^## Testing"

# Check title has a valid prefix
TITLE=$(grep -m1 "^# " "$FILE" | sed 's/^# //')
if echo "$TITLE" | grep -qE "^(Fix|Feat|Enhance|Refactor|HOTFIX|Deps): "; then
  RESULTS="${RESULTS}\"title_prefix\": \"pass\", "
else
  RESULTS="${RESULTS}\"title_prefix\": \"MISSING — must start with Fix:|Feat:|Enhance:|Refactor:|HOTFIX:|Deps:\", "
  ERRORS=$((ERRORS + 1))
fi

# Check at least one type-of-change box is checked
if grep -q "\- \[x\]" "$FILE"; then
  RESULTS="${RESULTS}\"type_checked\": \"pass\", "
else
  RESULTS="${RESULTS}\"type_checked\": \"MISSING — no checkbox checked in Type of change\", "
  ERRORS=$((ERRORS + 1))
fi

# Remove trailing comma+space
RESULTS="${RESULTS%, }"

echo "{${RESULTS}, \"errors\": ${ERRORS}}"
exit $ERRORS
