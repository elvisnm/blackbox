Update an existing GitHub pull request from a PR document.

When user says "update pr" or "update the pr".

## Input

The user provides: $ARGUMENTS (optional -- blueprint path like `feat/dashboard`)

## Instructions

### 1. Find the PR Document
- Look for the PR document in `.blackbox/prs/{type}/{name}.md`
- If a blueprint path is provided, use it directly
- If no argument, try to match from the current branch name
- If no document found, ask the user which file to use

### 2. Find the Current PR
- Get the PR for the current branch: `gh pr view --json number,title,url`
- If no PR exists, tell the user and suggest running `/create-pr` instead

### 3. Read and Parse the Document
Read the file from `.blackbox/prs/{type}/{name}.md`.

Extract:
- **Title**: The text under the `# Title` heading (first H1). This becomes the new PR title. Do NOT include it in the body. The title MUST start with a prefix:
  - Bugfix -> `Fix: <title>`
  - New feature -> `Feat: <title>`
  - Enhancement -> `Enhance: <title>`
  - Refactoring -> `Refactor: <title>`
  - Hotfix -> `HOTFIX: <title>`
  - Updating dependencies -> `Deps: <title>`
- **Body**: Everything from `## Type of change` onward. Do NOT include the `# Title` heading, the `> **Blueprint:**` line, or any HTML comments in the body.
- **Add icons to headings** when building the body for GitHub:
  - `## Type of change` -> `## :loudspeaker: Type of change`
  - `## Description` -> `## :scroll: Description`
  - `## Context` -> `## :bulb: Context`
  - `## Testing` -> `## :green_heart: Testing`

### 4. Update the PR
```bash
gh pr edit <number> \
  --title "<title from doc>" \
  --body "<body from doc>"
```

Use a HEREDOC for the body to preserve markdown formatting.
Only update title and body -- do NOT change reviewers, assignee, base branch, or labels.

### 5. Confirm
- Show the PR URL to the user
- Confirm the PR was updated with the latest content from the PR document
