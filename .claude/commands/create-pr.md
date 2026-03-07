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
- **Title**: The text under the `# Title` heading (first H1). This becomes the `--title` for `gh pr create`. Do NOT include it in the body. The title MUST start with a prefix:
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
