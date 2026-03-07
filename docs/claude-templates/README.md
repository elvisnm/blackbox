# Claude Templates

Generic CLAUDE.md templates for non-DEV roles. These templates are starting points — customize them for your project.

## Templates

| Template | Role | Purpose |
|----------|------|---------|
| [CLAUDE_PO.md](CLAUDE_PO.md) | Product Owner | Read codebase, write structured Asana tickets |
| [CLAUDE_DESIGN.md](CLAUDE_DESIGN.md) | Designer | Read codebase UI patterns, enrich Asana tickets with UI/UX specs |

## How to Use

1. Copy the template to your project root as `CLAUDE.md`
2. Replace `[PROJECT NAME]` with your project name
3. Fill in the "Where to Find Things" section with your project's actual file paths
4. Add any project-specific context or conventions

## What These Templates Do

Both templates give Claude:
- **Read-only codebase access** — Claude reads the actual code to give informed answers and write specific requirements
- **Asana MCP integration** — Claude writes to Asana tickets instead of the repo
- **Strict output rules** — Claude never writes to repo files, only to Asana

### PO Template

PO's Claude enforces the [Asana ticket template](../asana-ticket-template.md) when creating tickets. It:
- Fills structured sections (Goal, Context, Requirements, Constraints)
- References actual code when describing current/desired behavior
- Blocks ticket transitions when required sections are missing
- Answers product questions in business language (not code jargon)

### DESIGN Template

DESIGN's Claude focuses on UI patterns. It:
- Researches existing components, layouts, and styling
- References components by name and file path
- Fills the UI/UX section of Asana tickets
- Lists mockup attachments

## Symlink Pattern

Instead of copying the template, you can symlink it so updates are picked up automatically:

```bash
# macOS/Linux
ln -s /path/to/blackbox/docs/claude-templates/CLAUDE_PO.md /path/to/project/CLAUDE.md

# Windows (run as Administrator)
mklink C:\path\to\project\CLAUDE.md C:\path\to\blackbox\docs\claude-templates\CLAUDE_PO.md
```

## Requirements

- Claude Code (Pro or Team plan)
- Asana MCP server configured with a personal access token
- Git repo cloned locally (for codebase access)
- (Optional) Worktree hook for session isolation (see [setup guide](../setup.md))
