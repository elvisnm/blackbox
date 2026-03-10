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

Required for `/scaffold`, `/refresh`, `/send-back`, and all ticket management skills.

1. In Asana, go to **My Settings** → **Apps** → **Developer Apps**
2. Under **Personal Access Tokens**, click **Create New Token**
3. Give it a name (e.g., "Blackbox") and copy the generated token

```bash
export ASANA_TOKEN="your-token-here"
```

To persist across sessions, add the export to your shell profile:

```bash
# For zsh (default on macOS)
echo 'export ASANA_TOKEN="your-token-here"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export ASANA_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Verify your setup

Run the health check to confirm everything is configured correctly:

```bash
bbox check
```

This verifies:
- Asana token is set
- GitHub token is configured (required for private repos)
- Each configured repo is accessible on GitHub
- `.blackbox/` is committed and pushed

### 4. Add your repo to the dashboard (optional)

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

The dashboard reads blueprint data from GitHub (not your local filesystem). Your repos must be pushed to GitHub with the `.blackbox/` directory committed for the dashboard to display them.

### 1. Install dependencies

```bash
cd /path/to/blackbox/dashboard
npm install
```

### 2. Make sure your project is on GitHub

The dashboard fetches blueprints via the GitHub API, so your project must:

1. Be pushed to GitHub with the `.blackbox/` directory committed
2. Be a **public** repo — or you must add a GitHub token (see step 4)

```bash
# In your project directory, verify .blackbox is committed and pushed
cd /path/to/your-project
git add .blackbox/
git commit -m "add blackbox blueprints"
git push
```

### 3. Configure repos

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

### 4. Add a GitHub token

**Required** for private repos. Optional for public repos (increases rate limit).

```bash
bbox set token ghp_your-github-token
```

To get a token:

1. Go to **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Name it (e.g., "Blackbox Dashboard") and select the **`repo`** scope for private repos (no scopes needed for public-only)
4. Click **Generate token** and copy it (starts with `ghp_`)

Without a token, the dashboard uses unauthenticated GitHub API calls (60 requests/hour). With a token, it's 5,000 requests/hour.

### 5. Run the dashboard

```bash
cd /path/to/blackbox/dashboard
npm run dev
```

Opens at http://localhost:5173/

### 6. Verify everything

```bash
bbox check
```

If everything is green, your dashboard is ready.
