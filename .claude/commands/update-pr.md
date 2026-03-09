---
name: github-update-pr
description: Update an existing GitHub PR title and body from the PR document. Use when user says "update PR", "sync PR", or "refresh pull request".
---

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

### 3. Validate and Parse the Document
Run `bash .claude/scripts/validate-pr-doc.sh {pr-doc-path}` to check required sections and title prefix. Fix any issues before proceeding.
Read the file from `.blackbox/prs/{type}/{name}.md`.

Extract:
- **Title**: The text under the `# Title` heading (first H1). This becomes the new PR title. Do NOT include it in the body. Apply title prefix and body formatting rules from `references/pr-conventions.md`.
- **Body**: Everything from `## Type of change` onward. Apply heading icons and body rules from `references/pr-conventions.md`.

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

## Troubleshooting

### No open PR for current branch
**Cause**: A PR hasn't been created yet for this branch.
**Solution**: Run `/create-pr` instead to create a new PR.

### `gh` CLI not authenticated
**Cause**: GitHub CLI not logged in or token expired.
**Solution**: Run `gh auth login` to authenticate.

### PR document not found
**Cause**: No PR doc exists in `.blackbox/prs/{type}/{name}.md`.
**Solution**: Run `/wrap-up` first to generate the PR document.
