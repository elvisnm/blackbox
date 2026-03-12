---
name: setup-roles
description: Generate personalized CLAUDE.md files for PO and DESIGN roles. Use when user says "setup roles", "generate role configs", or "create PO/DESIGN CLAUDE.md".
---

Generate personalized CLAUDE.md files for the PO and DESIGN roles by researching the project codebase.

## Context

This skill is run by DEV after `bbox init`. It reads the project codebase and generates two role-specific CLAUDE.md files:
- `.blackbox/roles/CLAUDE_PO.md` — for Product Owners
- `.blackbox/roles/CLAUDE_DESIGN.md` — for Designers

These files are committed to the repo so every PO/DESIGN who clones gets the same configuration.

## Instructions

### Step 1: Verify Prerequisites

Check that:
1. `.blackbox/roles/` exists in the target project. If not, tell the user to run `bbox init` first.
2. `docs/claude-templates/CLAUDE_PO.md` and `docs/claude-templates/CLAUDE_DESIGN.md` exist in the blackbox repo. If not, tell the user the templates are missing.

If either check fails, stop and explain — do not launch agents.

### Step 2: Read the Templates

Read the base templates that define the structure for each role:
- `docs/claude-templates/CLAUDE_PO.md` — PO template skeleton
- `docs/claude-templates/CLAUDE_DESIGN.md` — DESIGN template skeleton

These templates have placeholder sections (e.g., `[PROJECT NAME]`, generic "Where to Find Things"). The agents will fill these with project-specific content.

### Step 3: Launch Two Research Agents in Parallel

Use the Agent tool to spawn two Explore agents simultaneously. Each agent researches the codebase from its role's perspective.

**IMPORTANT**: Use `subagent_type: "Explore"` for both agents. Set thoroughness to `"very thorough"`. Tell each agent it is doing research only — no code changes. Keep agent reports concise — bullet lists with file paths, not large code quotes.

#### Agent 1: PO Research

Prompt the agent with:
```
You are researching a codebase to help generate a Product Owner's CLAUDE.md configuration file. The PO needs to understand the product in business terms — what it does, how users interact with it, what features exist.

YOUR JOB:
1. Find the project name and description — check README.md, package.json, CLAUDE.md, or any top-level docs
2. Map the user-facing features — look at page components, route definitions, API endpoints. For each feature, write a 1-sentence business description (not technical)
3. Build a "Where to Find Things" map for the PO:
   - Pages/UI: where are page components? route files?
   - Backend: where are API routes? business logic?
   - Database: where are queries, migrations, schemas/types?
   - Shared code: any shared packages or utilities?
   - Auth: where is authentication handled (frontend context, backend middleware, routes)?
4. Identify the tech stack at a high level (framework, styling, database, key libraries)
5. Look for any existing documentation that describes features in business terms

OUTPUT FORMAT:
- **Project Name**: the name
- **Project Description**: 1-2 sentences, business language
- **Tech Stack Summary**: framework, styling, database (brief, not exhaustive)
- **Key Features**: list of features with business descriptions
- **Where to Find Things**: tables mapping areas to file paths (Pages/UI, Backend, Database, Shared, Auth)
- **Investigation Guide**: how should PO trace a question through the codebase (project-specific steps)
```

#### Agent 2: DESIGN Research

Prompt the agent with:
```
You are researching a codebase to help generate a Designer's CLAUDE.md configuration file. The Designer needs to understand the UI layer — what components exist, how styling works, what patterns are used.

YOUR JOB:
1. Find the project name and description — check README.md, package.json, CLAUDE.md
2. Map the UI component library:
   - Base/shared components (buttons, inputs, modals, cards, etc.) with file paths
   - Page-specific components
   - Layout components (sidebars, headers, navigation)
3. Identify the styling approach:
   - CSS framework (Tailwind, Bootstrap, CSS modules, etc.)
   - Design tokens / theme variables (colors, spacing, typography)
   - Dark/light mode support
   - Responsive breakpoints
4. Document interaction patterns:
   - How forms work (validation, submission)
   - How tables/lists work (filtering, sorting, pagination)
   - How navigation works between pages
   - How modals/dialogs are triggered
   - Loading states, error states, empty states
5. Find the design system documentation if it exists

OUTPUT FORMAT:
- **Project Name**: the name
- **Design System**: colors, typography, spacing conventions
- **UI Components**: tables mapping component types to file paths
- **Styling Approach**: framework, variables location, theme support
- **Interaction Patterns**: how forms, tables, modals, navigation work
- **Where to Find Things**: tables mapping UI areas to file paths (Components, Styles, Pages, Layouts, Assets)
```

### Step 4: Generate the CLAUDE.md Files

After both agents return their findings, generate two files using the templates as skeletons and the research as content.

#### For `.blackbox/roles/CLAUDE_PO.md`:

Use the PO template structure from `docs/claude-templates/CLAUDE_PO.md` but replace all placeholder content:
- Replace `[PROJECT NAME]` with the actual project name
- Fill "Where to Find Things" with the actual paths from the PO agent's research
- Add a "Key Features to Know" section with business descriptions
- Customize "How to Investigate a Question" with project-specific steps
- Keep all the rules sections unchanged (Tool Usage Rules, Ticket Template, Transition Gates, Confidence Rule)

#### For `.blackbox/roles/CLAUDE_DESIGN.md`:

Use the DESIGN template structure from `docs/claude-templates/CLAUDE_DESIGN.md` but replace all placeholder content:
- Replace `[PROJECT NAME]` with the actual project name
- Fill "Where to Find Things" with actual UI component paths
- Add a "Design System" section with actual colors, typography, tokens
- Add a "Component Library" section listing existing components with paths
- Customize "What to Look For" with project-specific interaction patterns
- Keep all the rules sections unchanged (Tool Usage Rules, Asana Integration, Response Format)

### Step 5: Write and Present

1. Write both files to `.blackbox/roles/`
2. Present a summary to the user:
   - What was found in the codebase
   - What each CLAUDE.md covers
   - Suggest the user reviews both files before committing

**Do NOT commit automatically.** Let the user review and decide when to commit.

## Rules

- ALWAYS ground content in actual code — never guess about project structure
- Keep PO content in business language — no technical jargon
- Keep DESIGN content focused on UI — components, styles, patterns
- Preserve all template rules sections unchanged (Tool Usage, Ticket Template, etc.)
- If the project doesn't have a clear design system, note what exists and flag what's missing

## Examples

### Example 1: Standard project
```
User: /setup-roles
-> Reads codebase, spawns 2 research agents
-> Generates CLAUDE_PO.md with 8 features, full path mapping
-> Generates CLAUDE_DESIGN.md with 15 components, design system docs
-> Writes both to .blackbox/roles/
-> "Review these files, then commit when ready"
```

### Example 2: Minimal project
```
User: /setup-roles
-> Reads codebase, spawns 2 research agents
-> Agents find limited UI (only 3 pages, basic components)
-> Generates both files with what exists
-> Flags: "Design system is minimal — consider documenting colors and typography"
```

## Troubleshooting

### .blackbox/roles/ doesn't exist
**Cause**: `bbox init` wasn't run or is an older version.
**Solution**: Create the directory manually: `mkdir -p .blackbox/roles/` or re-run `bbox init`.

### Templates not found
**Cause**: Running from outside the blackbox repo, or templates were moved.
**Solution**: The skill needs access to `docs/claude-templates/CLAUDE_PO.md` and `docs/claude-templates/CLAUDE_DESIGN.md`. Ensure these files exist.

### Project has no UI
**Cause**: Backend-only project or API-only service.
**Solution**: The DESIGN CLAUDE.md will be minimal. Consider skipping it if the project has no frontend.
