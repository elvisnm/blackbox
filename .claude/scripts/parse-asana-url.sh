#!/bin/bash
# Extract Asana task ID from various URL formats.
# Usage: bash .claude/scripts/parse-asana-url.sh <url>
# Output: JSON with task_id and project_id (if available)

URL="$1"

if [ -z "$URL" ]; then
  echo '{"error": "No URL provided"}'
  exit 1
fi

# Supported formats:
#   https://app.asana.com/0/PROJECT_ID/TASK_ID
#   https://app.asana.com/0/PROJECT_ID/TASK_ID/f
#   https://app.asana.com/0/search/SEARCH_ID/TASK_ID
#   Plain task ID (numeric)

# Try to extract task ID (last numeric segment in path)
TASK_ID=$(echo "$URL" | grep -oE '[0-9]+' | tail -1)

# Try to extract project ID (first numeric segment after /0/)
PROJECT_ID=$(echo "$URL" | sed -n 's|.*/0/\([0-9]*\)/.*|\1|p')

if [ -z "$TASK_ID" ]; then
  echo '{"error": "Could not extract task ID from URL"}'
  exit 1
fi

# Don't report project_id if it's the same as task_id (plain ID case)
if [ "$PROJECT_ID" = "$TASK_ID" ]; then
  PROJECT_ID=""
fi

if [ -n "$PROJECT_ID" ]; then
  echo "{\"task_id\": \"${TASK_ID}\", \"project_id\": \"${PROJECT_ID}\"}"
else
  echo "{\"task_id\": \"${TASK_ID}\"}"
fi
