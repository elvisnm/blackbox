# Workflow

This document shows how work flows from an Asana ticket to shipped code. It covers the roles involved, the handoff between Asana and blueprints, and how work can flow backward.

![Blueprint Workflow](blueprint-workflow.png)

## The Big Picture

```
    ASANA WORLD                              REPO WORLD
    (PO, DESIGN, QA)                         (DEV)

    +------------------+                     +------------------+
    | PO creates       |                     |                  |
    | structured       |                     |                  |
    | Asana ticket     |                     |                  |
    +--------+---------+                     |                  |
             |                               |                  |
             v                               |                  |
    +------------------+                     |                  |
    | DESIGN adds      |                     |                  |
    | UI/UX specs      |  (optional)         |                  |
    | and mockups      |                     |                  |
    +--------+---------+                     |                  |
             |                               |                  |
             | Ready for Development         |                  |
             +------------------------------>|  /scaffold       |
             |                               |  Generate        |
             |                               |  blueprint       |
             |                               +--------+---------+
             |                                        |
             |                               +--------+---------+
             |                               |  /refine         |
             |                               |  Research        |
             |                               |  codebase        |
             |                               +--------+---------+
             |                                        |
             |                               +--------+---------+
             |                               |  /implement      |
             |                               |  Build it        |
             |                               +--------+---------+
             |                                        |
             |                               +--------+---------+
             |                               |  /wrap-up        |
             |                               |  /create-pr      |
             |                               +--------+---------+
             |                                        |
             |  Ready to Test    <--------------------+
             |
    +--------+---------+
    | QA tests         |
    | against Asana    |
    | acceptance       |
    | criteria         |
    +--------+---------+
             |
             v
          Done
```

## Asana Status Flow

Asana owns the full workflow status. This is what everyone sees.

```
Draft -> Refining -> Ready for Design -> Designing -> Ready for Development -> In Progress -> PR Review -> Ready to Test -> Testing -> Done
 [PO]     [PO]           [PO]            [DESIGN]        [PO/DESIGN]            [DEV]          [DEV]         [DEV]         [QA/PO]   [QA/PO]
```

### Shortcuts

Not every ticket needs every phase:

```
With design:  Draft -> Refining -> Ready for Design -> Designing -> Ready for Development -> In Progress -> ...
No design:    Draft -> Refining -> Ready for Development -> In Progress -> ...
Hotfix:       Draft -> In Progress -> PR Review -> Ready to Test -> Done
```

## Send-backs (Backward Flow)

Work can flow backward when requirements change or issues are discovered.

| Direction | Trigger | Asana Status | Action |
|-----------|---------|-------------|--------|
| DEV -> PO | Requirements wrong | "Needs Refinement" | DEV runs `/send-back`, adds comment. PO refines in Asana. |
| DEV -> DESIGN | UI spec doesn't work | "Needs Redesign" | DEV runs `/send-back`, adds comment. DESIGN reworks in Asana. |
| DESIGN -> PO | Requirements unclear | "Needs Refinement" | DESIGN sends back in Asana. PO refines. |
| QA -> DEV | Issues found in testing | "PR Changes" | QA sends back in Asana. DEV fixes. |

After a send-back is resolved and the ticket returns to "Ready for Development", DEV runs `/refresh` to pull the updated Asana content into the existing blueprint.

## DEV Skill Flow

```
/scaffold {asana-url}     Generate blueprint from Asana ticket
       |
       v
/refine {type/name}       Research codebase, fill technical context
       |
       v
/start {type/name}        Review blueprint, begin work
       |
       v
/implement {type/name}    Execute plan step by step
       |
       v
/review-code               Self-review changed files
       |
       v
/wrap-up {type/name}      Clean code, lint, create PR doc
       |
       v
/create-pr {type/name}    Create GitHub PR from PR doc
```

Additional skills:
- `/refresh {type/name}` — Update blueprint from Asana after a send-back
- `/send-back {type/name} {reason}` — Return ticket to PO/DESIGN via Asana
- `/status` — List blueprints with progress counts
- `/update-pr` — Update existing GitHub PR
- `/pr-review` — Review someone else's PR

## Git History

Every phase of development is a commit. A typical blueprint's history looks like:

```
[DEV] feat/auth-sso: scaffold from Asana
[DEV] feat/auth-sso: refined with codebase context
[DEV] feat/auth-sso: phase 1 complete — auth provider setup
[DEV] feat/auth-sso: phase 2 complete — login flow
[DEV] feat/auth-sso: wrap-up, PR doc created
```

With a send-back, it might include:

```
[DEV] feat/auth-sso: scaffold from Asana
[DEV] feat/auth-sso: refined with codebase context
[DEV] feat/auth-sso: phase 1 complete
[DEV] feat/auth-sso: refreshed from Asana — requirements updated
[DEV] feat/auth-sso: phase 2 complete (adjusted for new requirements)
[DEV] feat/auth-sso: wrap-up, PR doc created
```
