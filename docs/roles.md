# Roles

Blackbox supports four roles across the workflow. Each role works in their natural environment, connected through Asana tickets and blueprints.

## Role Overview

| | PO | DESIGN | DEV | QA |
|---|---|---|---|---|
| **Works in** | Asana (via Claude) | Asana (via Claude) | Project repo + Asana | Asana |
| **Writes to** | Asana tickets | Asana tickets | Full repo + Asana | Asana tickets |
| **Reads** | Full codebase (read-only) | Full codebase (read-only) | Full codebase | Asana tickets |
| **Claude setup** | CLAUDE_PO.md + Asana MCP | CLAUDE_DESIGN.md + Asana MCP | Project CLAUDE.md + skills | None (v2) |
| **Commit prefix** | N/A (no repo commits) | N/A (no repo commits) | `[DEV]` | N/A |

## PO (Product Owner)

**Works in:** Asana via Claude Code with Asana MCP
**Never touches:** The project repo (writes only to Asana)

PO talks to Claude. Claude writes structured Asana tickets following the [ticket template](asana-ticket-template.md). PO's Claude can read the project codebase (read-only context) to make better decisions about requirements, but all output goes to Asana.

### Responsibilities

- Create tickets from ideas, bugs, stakeholder requests
- Fill the Asana ticket template (Goal, Context, Requirements, Constraints)
- Refine tickets when sent back by DEV or DESIGN
- Route tickets: "Ready for Design" or "Ready for Development"
- Act as QA when no dedicated QA role exists

### Transition Gates

PO's Claude blocks moving a ticket to "Ready for Design" or "Ready for Development" if:
- Open Questions section is not empty
- Goal is missing
- Requirements section is empty
- Current Behavior or Desired Behavior is vague or missing

### Setup

See [CLAUDE_PO.md template](claude-templates/CLAUDE_PO.md) and [setup guide](setup.md).

## DESIGN (Designer)

**Works in:** Asana via Claude Code with Asana MCP
**Never touches:** The project repo (writes only to Asana)

DESIGN picks up tickets marked "Ready for Design". Claude reads the ticket, researches the project's existing UI patterns and components (read-only), and adds UI/UX specifications to the Asana ticket. Mockups and wireframes are attached to the ticket.

### Responsibilities

- Add UI/UX section to Asana tickets (screens, flows, component choices)
- Attach mockups, wireframes, screenshots to tickets
- Reference existing UI patterns and components from the codebase by name
- Set ticket to "Ready for Development" when design is complete
- Send back to PO if requirements are unclear

### Setup

See [CLAUDE_DESIGN.md template](claude-templates/CLAUDE_DESIGN.md) and [setup guide](setup.md).

## DEV (Developer)

**Works in:** Project repo + Asana via Claude Code
**Owns:** The blueprint in `.blackbox/blueprints/`

DEV picks up tickets marked "Ready for Development". Claude reads the Asana ticket and generates a blueprint — the technical recipe. From this point, the blueprint is the developer's source of truth.

### Responsibilities

- Generate blueprints from Asana tickets (`/scaffold`)
- Refresh blueprints when tickets are updated after send-backs (`/refresh`)
- Research codebase and fill technical context (`/refine`)
- Implement the plan (`/implement`)
- Self-review (`/review-code`), wrap up (`/wrap-up`), create PR (`/create-pr`)
- Send back to PO/DESIGN via Asana when needed (`/send-back`)

### Skills

| Skill | What it does |
|-------|-------------|
| `/scaffold {asana-url}` | Generate blueprint from Asana ticket |
| `/refresh {type/name}` | Update blueprint from Asana after send-back |
| `/refine {type/name}` | Research codebase, fill technical context |
| `/start {type/name}` | Review blueprint, begin work |
| `/implement {type/name}` | Execute plan step by step |
| `/review-code` | Self-review changed files |
| `/wrap-up [type/name]` | Clean code, lint, create PR doc |
| `/create-pr [type/name]` | Create GitHub PR from PR doc |
| `/update-pr [type/name]` | Update existing GitHub PR |
| `/pr-review {branch\|pr-number}` | Review someone else's PR |
| `/send-back {type/name} {reason}` | Return ticket to PO/DESIGN via Asana |
| `/status` | List blueprints with progress |
| `/draft {idea}` | Create new Asana ticket from idea |
| `/refine-ticket {asana-url}` | Improve Asana ticket with codebase research |
| `/review-ticket {asana-url}` | Validate ticket against quality gates |
| `/design {asana-url}` | Fill UI/UX section of Asana ticket |
| `/review-design {asana-url}` | Validate design specs against codebase |

### Setup

Run `bbox init` in the project. See [setup guide](setup.md).

## QA (Quality Assurance)

**Works in:** Asana
**Never touches:** The project repo

QA picks up tickets marked "Ready to Test". Tests the feature against the acceptance criteria in the Asana ticket. Marks "Done" or sends back with issues.

### Responsibilities

- Test against acceptance criteria in the Asana ticket
- Set ticket to "Done" if tests pass
- Send back to DEV ("PR Changes") with issues found

### Setup

No Claude setup needed for v2. QA works directly in Asana.
