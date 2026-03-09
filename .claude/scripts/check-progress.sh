#!/bin/bash
# Count [x] vs [ ] checkboxes in a blueprint, output JSON.
# Usage: bash .claude/scripts/check-progress.sh <blueprint-path>
# Output: JSON with counts per section and totals

FILE="$1"

if [ -z "$FILE" ]; then
  echo '{"error": "No file path provided"}'
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "{\"error\": \"File not found: $FILE\"}"
  exit 1
fi

count_section() {
  local section_start="$1"
  local section_end="$2"
  local content

  if [ -n "$section_end" ]; then
    content=$(sed -n "/^${section_start}/,/^${section_end}/p" "$FILE" | head -n -1)
  else
    content=$(sed -n "/^${section_start}/,\$p" "$FILE")
  fi

  local done=$(echo "$content" | grep -c "\- \[x\]")
  local pending=$(echo "$content" | grep -c "\- \[ \]")
  local total=$((done + pending))
  echo "${done} ${pending} ${total}"
}

# Requirements section
read REQ_DONE REQ_PENDING REQ_TOTAL <<< $(count_section "## Requirements" "## ")

# Implementation Plan section (phases)
read IMPL_DONE IMPL_PENDING IMPL_TOTAL <<< $(count_section "## Implementation Plan" "## Technical Decisions")

# Validation > Tests section
read VAL_DONE VAL_PENDING VAL_TOTAL <<< $(count_section "### Tests" "### Manual Verification")

# Totals
TOTAL_DONE=$((REQ_DONE + IMPL_DONE + VAL_DONE))
TOTAL_PENDING=$((REQ_PENDING + IMPL_PENDING + VAL_PENDING))
TOTAL=$((TOTAL_DONE + TOTAL_PENDING))

cat <<EOF
{
  "requirements": {"done": ${REQ_DONE}, "pending": ${REQ_PENDING}, "total": ${REQ_TOTAL}},
  "implementation": {"done": ${IMPL_DONE}, "pending": ${IMPL_PENDING}, "total": ${IMPL_TOTAL}},
  "validation": {"done": ${VAL_DONE}, "pending": ${VAL_PENDING}, "total": ${VAL_TOTAL}},
  "total": {"done": ${TOTAL_DONE}, "pending": ${TOTAL_PENDING}, "total": ${TOTAL}}
}
EOF
