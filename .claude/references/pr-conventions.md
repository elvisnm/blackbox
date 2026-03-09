# PR Conventions

## Title Prefixes

The PR title MUST start with one of these prefixes:

| Type | Prefix |
|------|--------|
| Bugfix | `Fix: <title>` |
| New feature | `Feat: <title>` |
| Enhancement | `Enhance: <title>` |
| Refactoring | `Refactor: <title>` |
| Hotfix | `HOTFIX: <title>` |
| Updating dependencies | `Deps: <title>` |

## Body Heading Icons

When building the PR body for GitHub, add icons to section headings:

| Original | With Icon |
|----------|-----------|
| `## Type of change` | `## :loudspeaker: Type of change` |
| `## Description` | `## :scroll: Description` |
| `## Context` | `## :bulb: Context` |
| `## Testing` | `## :green_heart: Testing` |

## Body Rules

- Do NOT include the `# Title` heading in the body
- Do NOT include the `> **Blueprint:**` line in the body
- Do NOT include HTML comments in the body
- Use a HEREDOC for the body to preserve markdown formatting
