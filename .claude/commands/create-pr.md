---
name: github-create-pr
description: Create a GitHub pull request from a PR document in .blackbox/prs/. Use when user says "create PR", "open pull request", or "push PR to GitHub".
---

Create a GitHub pull request from a PR document.

When user says "create pr" or "open pr".

## Input

The user provides: $ARGUMENTS (optional -- blueprint path like `feat/dashboard`)

## Instructions

### 1. Find the PR Document
- Look for the PR document in `.blackbox/prs/{type}/{name}.md`
- If a blueprint path is provided, use it directly
- If no argument, try to match from the current branch name
- If no document found, ask the user which file to use or suggest running `/wrap-up` first

### 2. Read the PR Document
Read the file from `.blackbox/prs/{type}/{name}.md`.

### 3. Parse the Document
Extract:
- **Title**: The text under the `# Title` heading (first H1). This becomes the `--title` for `gh pr create`. Do NOT include it in the body. Apply title prefix and body formatting rules from `references/pr-conventions.md`.
- **Body**: Everything from `## Type of change` onward. Apply heading icons and body rules from `references/pr-conventions.md`.

### 4. Ensure Branch is Pushed
- Check if the current branch has an upstream: `git rev-parse --abbrev-ref @{upstream}`
- If not pushed, push with: `git push -u origin HEAD`

### 5. Determine Base Branch and Reviewers
- Ask the user:
  - "What's the base branch?" (common: `main`, `canary`, `develop`)
  - "Who should review?" (GitHub usernames, comma-separated)
- Remember these for future use in the session

### 6. Create the PR
```bash
gh pr create \
  --base <base-branch> \
  --title "<title from doc>" \
  --body "<body from doc>" \
  --reviewer <reviewers> \
  --assignee @me
```

Use a HEREDOC for the body to preserve markdown formatting.

### 7. Update Blueprint PR Link
- Read the blueprint from `.blackbox/blueprints/{type}/{name}.md`
- Update the `> **PR:**` field from `_pending_` to the new PR URL

### 8. Confirm
- Show the PR URL to the user
- Confirm reviewers and assignee were set
- Confirm blueprint PR link was updated
