# Setup

How to set up Blackbox for each role.

## DEV Setup

### 1. Install Blackbox into your project

```bash
bbox init /path/to/your-project
```

This creates:
- `.blackbox/blueprints/` folder structure with template
- `.claude/commands/` with all skills (or globally at `~/.claude/commands/`)

### 2. Set your Asana token

Required for `/scaffold`, `/refresh`, and `/send-back` commands.

```bash
export ASANA_TOKEN="your-asana-personal-access-token"
```

To get a token: Asana > My Settings > Apps > Developer Apps > Create New Token

### 3. Add your repo to the dashboard (optional)

```bash
bbox add-repo owner/repo --branch main
```

This is done automatically during `bbox init` if the project has a git remote.



## PO Setup

PO uses Claude Code with read-only access to the project codebase and Asana MCP for writing tickets.

### 1. Clone the project repo

```bash
git clone <project-repo-url> project-name
cd project-name
git checkout main  # or the integration branch
```

### 2. Set up the CLAUDE.md

Copy the PO template and customize it for your project:

```bash
cp /path/to/blackbox/docs/claude-templates/CLAUDE_PO.md ./CLAUDE.md
```

Edit the template:
- Replace `[PROJECT NAME]` with your project name
- Fill in the "Where to Find Things" section with your project's file structure
- Add any project-specific context

### 3. Configure Asana MCP

PO's Claude needs the Asana MCP to create and update tickets. Follow the Asana MCP setup for Claude Code:
- Install the Asana MCP server
- Configure with your Asana personal access token

### 4. (Optional) Set up worktree isolation

For automatic session isolation from the integration branch, create `.claude/settings.json`:

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); git worktree add \".claude/worktrees/$NAME\" -b \"claude/$NAME\" main >&2 && echo \"$(pwd)/.claude/worktrees/$NAME\"'"
          }
        ]
      }
    ]
  }
}
```

Replace `main` with your integration branch (e.g., `canary`, `develop`).

## DESIGN Setup

Same as PO setup, but use the DESIGN template:

```bash
cp /path/to/blackbox/docs/claude-templates/CLAUDE_DESIGN.md ./CLAUDE.md
```

Edit the template:
- Replace `[PROJECT NAME]` with your project name
- Fill in the "Where to Find Things" section focusing on UI components, styles, and pages
- Add any project-specific design conventions

## QA Setup

No Claude setup needed. QA works directly in Asana, testing against the acceptance criteria in the ticket.

## Dashboard Setup

### 1. Install dependencies

```bash
cd /path/to/blackbox/dashboard
npm install
```

### 2. Configure repos

Add repos to track:

```bash
bbox add-repo owner/repo --branch main
```

Or create `~/.blackbox/config.json` manually:

```json
{
  "repos": [
    { "owner": "your-org", "repo": "your-project", "branch": "main" }
  ]
}
```

### 3. (Optional) Add GitHub token for higher API limits

```bash
bbox set token ghp_your-github-token
```

Without a token, the dashboard uses unauthenticated GitHub API calls (60 requests/hour). With a token, it's 5,000 requests/hour.

### 4. Run the dashboard

```bash
cd /path/to/blackbox/dashboard
npm run dev
```

Opens at http://localhost:5173/
