# Blackbox Dashboard

A read-only dashboard for browsing blueprints across configured repos. Built with Vite + React + TypeScript + Tailwind CSS + shadcn/ui.

## What It Does

- Lists all blueprints from configured GitHub repos (reads `.blackbox/blueprints/` via GitHub API)
- Shows blueprint details with rendered markdown
- Displays diff/history views for blueprint changes
- Groups blueprints by type (feat, fix, improve, hotfix)

## Setup

```bash
npm install
```

### Configure Repos

Add repos to track:

```bash
bbox add-repo owner/repo --branch main
```

Or edit `~/.blackbox/config.json` directly:

```json
{
  "repos": [
    { "owner": "your-org", "repo": "your-project", "branch": "main" }
  ]
}
```

### (Optional) GitHub Token

For higher API rate limits (5,000/hr vs 60/hr unauthenticated):

```bash
bbox set token ghp_your-github-token
```

## Development

```bash
npm run dev       # Start dev server at http://localhost:5173/
npm run build     # Type-check and build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Tech Stack

- **Vite** — build tool
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives)
- **react-router-dom** — client-side routing
- **react-markdown** + remark/rehype plugins — blueprint rendering
- **diff2html** — blueprint diff visualization
- **lucide-react** — icons

## Troubleshooting

If the dashboard shows no blueprints or is missing a repo:

1. Run `bbox check` to verify your setup
2. Make sure `.blackbox/` is committed and pushed to GitHub
3. For private repos, add a GitHub token: `bbox set token ghp_your-token`
4. Restart the dashboard after config changes: `npm run dev`
