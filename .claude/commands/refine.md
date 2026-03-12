---
name: refine
description: Deep codebase research agent that refines Asana tickets or blueprints. Use when user says "refine", "research codebase", "refine ticket", "improve ticket", or "strengthen requirements".
---

Refine an Asana ticket or blueprint through deep, agent-powered codebase research followed by a guided conversation.

## Input

The user provides: $ARGUMENTS

This can be either:
- An **Asana URL** (e.g., `https://app.asana.com/0/PROJECT_ID/TASK_ID`) — refines the ticket in Asana
- A **blueprint path** (e.g., `feat/dashboard`) — refines the blueprint in the repo

### Input Validation
- If the input looks like a URL but doesn't match `https://app.asana.com/...`, tell the user it must be an Asana URL.
- If the input looks like a path but the file doesn't exist, run `/status` to list available blueprints and ask the user to pick one.
- If the input is ambiguous (e.g., just "dashboard"), ask: "Is this a blueprint path? If so, which type — `feat/dashboard`, `fix/dashboard`, etc.?"

## Phase 1: Detect Input & Load Content

0. **Validate Asana access** — follow `references/asana-api-guide.md` Step 0 to verify the token is set. If missing, stop and tell the user.

### If Asana URL:
1. Extract the task ID by running `bash .claude/scripts/parse-asana-url.sh {url}`
2. Fetch the task using Asana MCP tools (or curl fallback with `$ASANA_TOKEN`). For Asana API patterns (creating/reading/updating tasks, setting custom fields), see `references/asana-api-guide.md`.
   ```
   curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
     "https://app.asana.com/api/1.0/tasks/{task_id}?opt_fields=name,notes,custom_fields,tags.name"
   ```
3. Parse the ticket expecting the contract template sections (see `references/contract-template-guide.md`): Goal, Context, Requirements, UI/UX, Constraints, Open Questions
4. Set mode: **TICKET MODE** — all final output goes to Asana, NEVER to the repo

### If Blueprint Path:
1. Read the blueprint from `.blackbox/blueprints/{type}/{name}.md` (add `.md` if missing)
2. Validate structure by running `bash .claude/scripts/validate-blueprint.sh {blueprint-path}`
3. Parse the blueprint sections: Goal, Context, Requirements, Constraints, and any existing Codebase Context
4. Set mode: **BLUEPRINT MODE** — all final output goes to the blueprint file, NEVER to Asana

### Extract the Research Brief
From whichever source, extract:
- The **Goal** — what are we building and why
- The **Context** — background, current behavior, desired behavior
- The **Requirements** — acceptance criteria
- The **Constraints** — non-negotiable rules
- Any **Open Questions** already flagged (if the section exists; skip if absent)

This is the research brief that drives the agents.

## Phase 2: Deep Codebase Research

### Complexity Gate

Before spawning agents, assess the scope:

- **Simple scope** (fewer than ~5 files affected, straightforward change): Skip agents. Do a quick manual research pass using Glob and Grep, then go directly to Phase 3 with your findings.
- **Medium to large scope** (multiple files, unknowns, cross-cutting concerns): Spawn the three research agents below in parallel.

When in doubt, spawn the agents — deeper research is better than shallow.

### Parallel Research Agents

Launch **three research agents in parallel** using the Agent tool. Each agent gets the research brief and explores the codebase from a different angle. Keep agent reports concise — bullet lists with file paths, not large code quotes.

**IMPORTANT**: Use `subagent_type: "Explore"` for all three agents. Set thoroughness to `"very thorough"`. Tell each agent it is doing research only — no code changes.

### Agent 1: Area Mapper

Focus: **Structure and dependencies** — what files exist, how they connect, what's in scope.

Prompt the agent with:
```
You are researching a codebase to map the area affected by this work. Focus on structure and file relationships only — don't analyze patterns or risks (other agents handle that).

RESEARCH BRIEF:
{paste goal, context, requirements, constraints}

YOUR JOB:
1. Identify entry points — which files/components/endpoints are directly mentioned or implied by the requirements
2. Follow import chains from those entry points — map what they depend on and what depends on them
3. Build a file map of everything in scope: for each file, note its role and why it's relevant
4. Identify the boundaries — what's adjacent but OUT of scope
5. Check for configuration files, env vars, or infrastructure that this work might touch

OUTPUT FORMAT (keep concise — bullet lists, not prose):
- **Entry Points**: files that are the starting point for this work
- **Dependency Map**: what each entry point imports/uses
- **Reverse Dependencies**: what depends on the files we'll change
- **Configuration & Infrastructure**: config files, env vars, CI/CD touched
- **Scope Boundary**: files that are adjacent but should NOT be modified
```

### Agent 2: Pattern Scout

Focus: **Conventions and how-to** — how this codebase builds things like this, not what files exist.

Prompt the agent with:
```
You are researching a codebase to find patterns and conventions relevant to this work. Focus on HOW things are built (architectural approach, naming, testing style) — not WHAT files exist (another agent handles that).

RESEARCH BRIEF:
{paste goal, context, requirements, constraints}

YOUR JOB:
1. Find how similar features are built in this codebase — look for analogous implementations and note the architectural approach
2. Document the file organization pattern (where do new files of this type go?)
3. Document the naming conventions (files, functions, variables, CSS classes, test names)
4. Document the testing pattern (what framework, what style, where do tests live, how are they structured)
5. Document API patterns if relevant (routing, middleware, error handling, response format)
6. Document component patterns if relevant (state management, styling approach, prop patterns)
7. Note any linting/formatting rules from config files

OUTPUT FORMAT (keep concise — bullet lists, not prose):
- **Similar Implementations**: existing features that are analogous, with file paths
- **File Organization**: where new files should go and why
- **Naming Conventions**: patterns to follow
- **Testing Patterns**: framework, style, location, example test
- **API/Component Patterns**: relevant architectural patterns
- **Linting & Formatting**: rules that apply
```

### Agent 3: Gap Detector

Focus: **What the requirements missed** — gaps visible in the codebase, not speculation.

Prompt the agent with:
```
You are researching a codebase to find gaps and risks that the requirements may have missed. Focus on what the code TELLS you directly — error handling patterns, test coverage, TODOs, existing edge case handling. Don't speculate; surface ambiguities as questions.

RESEARCH BRIEF:
{paste goal, context, requirements, constraints}

YOUR JOB:
1. For each requirement, check if the codebase reveals hidden complexity (e.g., the file it needs to change has complex state, the API has rate limits, the component has accessibility requirements)
2. Look for edge cases the codebase already handles that the requirements don't mention — error states, empty states, loading states, permission checks
3. Check for TODOs, FIXMEs, or known workarounds in the affected area
4. Check if the requirements could break existing tests or functionality
5. Note any security patterns in the affected area (auth checks, input validation) that the new code must follow

OUTPUT FORMAT (keep concise — bullet lists, not prose):
- **Requirement Feasibility**: for each requirement, note if straightforward or has hidden complexity
- **Missing Edge Cases**: scenarios the requirements don't cover but the codebase suggests matter
- **Technical Debt**: TODOs, workarounds, fragile code in the affected area
- **Breaking Change Risks**: existing tests or functionality that could break
- **Security & Validation Patterns**: auth/validation patterns the new code must follow
```

## Phase 3: Synthesize & Guided Conversation

After research completes (whether from agents or manual research):

1. **Synthesize** findings into a list of **topics** — each topic is a finding, gap, decision point, or ambiguity that needs the user's input. **Cap at 8 topics max.** Group minor findings into a "nice-to-know" summary rather than making each one a topic.

2. **Prioritize topics** by impact:
   - Blockers first (things that make requirements impossible or ambiguous)
   - Then gaps (missing edge cases, security patterns to follow)
   - Then decisions (pattern choices, approach options)
   - Then nice-to-knows (grouped as a single summary topic)

3. **If agents reported contradictory findings** about the same file or concern, surface it as a single topic: "The research found conflicting signals about X — here's what each perspective says."

4. **Present the research summary to the user** — a brief overview of what was found (5-10 lines max). Give the user a sense of the landscape before diving into questions.

5. **Walk through each topic one at a time**:
   - Present the finding with specific evidence (file paths, code references)
   - Ask a clear, specific question
   - Wait for the user's answer before moving to the next topic
   - Use their answer to inform subsequent questions if relevant

   **Handling user responses:**
   - If the user **skips** a topic ("skip", "next", "doesn't matter"): note it and move on. After all topics, ask if they want to revisit any skipped ones.
   - If the user **disagrees** with a finding: ask for their perspective, adjust your understanding, and move on.
   - If the user **asks for clarification**: explain further with code references before re-asking the question.
   - If the user says **"just write it"**: skip remaining topics and proceed to Phase 4 with answers collected so far.

   Example:
   ```
   TOPIC 1/5: Auth middleware pattern

   I found that the codebase uses a chain-of-responsibility pattern for auth
   middleware (see `src/middleware/auth.ts:23-45`). The ticket says "update auth"
   but doesn't specify the approach.

   Should we extend the existing middleware chain, or replace the current
   auth handler with a new implementation?
   ```

6. **After all topics are resolved**, confirm with the user:
   "I have everything I need. Ready to write the refined [ticket/blueprint]?"

## Phase 4: Write Output

### TICKET MODE (Asana URL input)
- **NEVER write to the repo**
- Update the Asana ticket description with refined content:
  - Preserve the user's original phrasing for Goal and Context where possible — refinements should ADD specificity, not replace voice
  - Fill Current Behavior and Desired Behavior with code-grounded specifics
  - Make Requirements testable and specific (reference actual files, endpoints, components)
  - Add discovered Constraints from codebase research
  - Move resolved questions out of Open Questions; add newly discovered ones
- Add an Asana comment: "Refined with codebase research — [summary of key findings and decisions]"
- If the ticket was in "Draft", suggest moving to "Refining"

### BLUEPRINT MODE (blueprint path input)
- **NEVER write to Asana**
- Update the blueprint file:
  - **Codebase Context > Related Files**: from Area Mapper findings
  - **Codebase Context > Dependencies**: from Area Mapper findings
  - **Codebase Context > Existing Patterns**: from Pattern Scout findings
  - **Implementation Plan**: draft phased steps informed by all three agents + Q&A answers. Mark each step as `[deterministic]` or `[agentic]`
  - **Validation**: tests to write, manual verification steps, lint/type commands
- Present the changes to the user for review

**Do NOT commit automatically.** Let the user review and decide when to commit.

## Rules

- ALWAYS ground findings in actual code — never speculate about how the system works
- If an agent finds something unexpected, surface it as a Q&A topic rather than assuming
- If the codebase is too large for agents to cover fully, have them focus on the areas most relevant to the research brief
- Preserve any existing Codebase Context or Implementation Plan content — update it, don't wipe it
- The guided conversation is mandatory — don't skip it even if the agents found no gaps. At minimum, confirm the approach with the user.

## Examples

### Example 1: Refine an Asana ticket
```
User: /refine https://app.asana.com/0/1234567/8901234
-> Fetches ticket, spawns 3 research agents, synthesizes findings
-> Walks through 4 topics one at a time with the user
-> Updates the Asana ticket with refined, code-grounded content
```

### Example 2: Refine a blueprint
```
User: /refine feat/dashboard
-> Reads blueprint, spawns 3 research agents, synthesizes findings
-> Walks through 3 topics one at a time with the user
-> Fills Codebase Context + Implementation Plan in the blueprint file
```

### Example 3: Simple scope (no agents needed)
```
User: /refine fix/typo-in-header
-> Reads blueprint, assesses scope as simple (<5 files)
-> Does quick manual research, finds the affected file
-> Confirms approach with user in 1 topic
-> Updates the blueprint
```

### Example 4: Re-refine after a send-back
```
User: /refine feat/dashboard  (after running /refresh)
-> Reads updated blueprint, notices new requirements from PO
-> Agents focus on what changed since last refinement
-> Q&A covers only the new/changed areas
-> Updates Codebase Context and Implementation Plan accordingly
```

## Troubleshooting

### Blueprint not found
**Cause**: Wrong path or blueprint doesn't exist yet.
**Solution**: Run `/status` to list available blueprints, or `/scaffold` to create one from an Asana ticket.

### Invalid Asana URL
**Cause**: URL doesn't match expected format.
**Solution**: Ask the user for the correct URL. The task ID is the last numeric segment.

### Agents return thin results
**Cause**: Small codebase or very narrow feature scope.
**Solution**: This is fine — fewer topics in the Q&A. The conversation ensures nothing is missed even if the codebase doesn't have much to find.

### Asana MCP unavailable
**Cause**: MCP server not connected or credentials expired.
**Solution**: Falls back to curl with `$ASANA_TOKEN`. Ensure the env var is set: `export ASANA_TOKEN=your-token`

### Ticket doesn't follow the contract template
**Cause**: The ticket was created without the structured template.
**Solution**: Map existing content to the closest template sections. Flag what's missing and suggest the user fills it in Asana first.
