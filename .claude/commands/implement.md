---
name: blueprint-implement
description: Execute a blueprint's implementation plan task-by-task with Beads tracking. Use when user says "implement", "start coding", or "execute the plan".
---

Execute a blueprint's implementation plan using Beads for task tracking.

## Input

The user provides: $ARGUMENTS (blueprint path, e.g., `feat/dashboard`)

## Instructions

### 1. Read the Blueprint

Read `.blackbox/blueprints/{type}/{name}.md`. If the file doesn't exist, list available blueprints and ask the user to pick one.

Validate the blueprint structure by running `bash .claude/scripts/validate-blueprint.sh {blueprint-path}`. If critical sections (Implementation Plan) are missing, suggest running `/refine` first.

### 2. Find the Next Phase

Parse the `## Implementation Plan` section. For each `### Phase N: {name}` subsection:
- Count `- [x]` (done) and `- [ ]` (pending) lines
- Find the **first phase that has unchecked tasks**
- Skip phases where all tasks are `[x]`

If ALL phases are complete:
- Show: "All implementation phases complete!"
- Suggest: `/review-code` to self-review, then `/wrap-up {type}/{name}` to prepare for PR
- Stop here.

### 3. Load Context

- Read the **Codebase Context > Related Files** section from the blueprint
- Read each listed file to load context before implementing
- Read the **Codebase Context > Dependencies** section to understand what's available

### 4. Create Beads Tasks

For each unchecked `- [ ]` task in the current phase, create a Beads task:
```bash
bd create --type=task "{task description}" --labels="blueprint:{type}/{name},phase:{N}"
```

Strip the `[deterministic]` or `[agentic]` markers from the task description — those are for execution guidance, not task titles.

### 5. Show Phase Summary

```
Blueprint: {title}
Phase {N}: {phase-name} (0/{total} tasks)

Beads tasks created:
  blackbox-xxx: {task 1}
  blackbox-yyy: {task 2}

Next task [{deterministic|agentic}]:
  "{task description}"

Related files loaded:
  - {file1}
  - {file2}
```

### 6. Execute Tasks Sequentially

For each task in the phase:

1. **Set the bd task to in_progress**: `bd update {id} -s in_progress`

2. **Distinguish execution style**:
   - `[deterministic]`: Execute exactly as described. No improvisation.
   - `[agentic]`: Use judgment. Read related code, understand patterns, implement appropriately.

3. **Implement the task** (write code, create files, modify existing files).

4. **After completing the task**:
   - Close the bd task: `bd close {id}`
   - Check off the task in the blueprint: change `- [ ]` to `- [x]` on the matching line
   - Show progress: "Checked off: {task}. Phase {N}: {done}/{total}"

5. **Ask the user**: "Continue to next task, pause here, or skip this task?"
   - **continue** (or yes): proceed to the next task
   - **pause**: stop here, show what's done and what's left
   - **skip**: mark the task as skipped (leave unchecked), move to the next one

### 7. Phase Complete

When all tasks in a phase are checked off:
- Show: "Phase {N} ({name}): {total}/{total} -- complete!"
- Suggest committing: `[DEV] {type}/{name}: phase {N} complete`
- Ask: "Continue to Phase {N+1}, or pause here?"

### 8. All Done

When all phases are complete:
- Show: "All implementation phases complete!"
- Suggest next steps:
  - `/review-code` to self-review the changes
  - `/wrap-up {type}/{name}` to prepare for PR

## Constraints

- Do NOT auto-commit. Suggest commit messages, let the user decide.
- Do NOT skip ahead. Work through tasks in order within each phase.
- Respect the `[deterministic]` vs `[agentic]` distinction.
- Beads tasks are ephemeral per session. The blueprint is the persistent record.

## Troubleshooting

### Beads not installed (`bd` not found)
**Cause**: The `bd` CLI is not installed or not in PATH.
**Solution**: Install Beads or skip task tracking. The blueprint checkboxes are the persistent record — Beads tasks are optional tracking.

### Blueprint has no Implementation Plan
**Cause**: The blueprint was scaffolded but not refined.
**Solution**: Run `/refine {type}/{name}` first to research the codebase and generate the Implementation Plan.

### Blueprint not found
**Cause**: Wrong path or blueprint doesn't exist.
**Solution**: Run `/status` to list available blueprints.

### All phases already complete
**Cause**: Every task in the Implementation Plan is already checked off.
**Solution**: This is normal. The skill suggests next steps: `/review-code` then `/wrap-up`.
