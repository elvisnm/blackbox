# Asana API Guide

How to interact with Asana from skills. Used by `/draft`, `/scaffold`, `/refine`, `/send-back`, `/design`, `/review-ticket`, `/review-design`, and `/refresh`.

## Step 0: Validate Token

Before any discussion or research, verify the token is available:

```bash
source ~/.zshrc 2>/dev/null; echo "${ASANA_TOKEN:+SET}"
```

If empty, stop immediately and tell the user:
> ASANA_TOKEN is not set. Run: `export ASANA_TOKEN="your-token"`
> To get a token: Asana → My Settings → Apps → Developer Apps → Personal Access Tokens → Create New Token.

## Step 1: Resolve Workspace and Project

Read from `~/.blackbox/config.json` first:

```bash
cat ~/.blackbox/config.json
```

Look for `asanaWorkspace` and `asanaProject` fields. If present, use them directly. If not, discover them:

### Discover workspace

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  "https://app.asana.com/api/1.0/workspaces" | jq '.data[0].gid'
```

### Discover project (requires workspace)

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  "https://app.asana.com/api/1.0/projects?workspace=WORKSPACE_GID&opt_fields=name,gid" | jq '.data'
```

If multiple projects exist, ask the user which one to use.

### Save for future use

After discovering workspace and project, save them to config so future skill invocations don't need to rediscover:

```bash
# Use node to update config
node -e "
const fs = require('fs');
const p = require('os').homedir() + '/.blackbox/config.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
c.asanaWorkspace = 'WORKSPACE_GID';
c.asanaProject = 'PROJECT_GID';
fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n');
"
```

## Creating Tasks

### Create a task

Always use `notes` (plain text), NEVER `html_notes` (requires strict XML that fails with markdown/HTML content).

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://app.asana.com/api/1.0/tasks" \
  -d '{
    "data": {
      "name": "Task title",
      "notes": "Plain text description here",
      "projects": ["PROJECT_GID"]
    }
  }'
```

The response includes `data.gid` — save it for follow-up calls.

### Create a subtask

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://app.asana.com/api/1.0/tasks/PARENT_GID/subtasks" \
  -d '{
    "data": {
      "name": "Subtask title",
      "notes": "Plain text description"
    }
  }'
```

Subtasks must be added to the project separately:

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://app.asana.com/api/1.0/tasks/SUBTASK_GID/addProject" \
  -d '{"data": {"project": "PROJECT_GID"}}'
```

### Update a task

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X PUT "https://app.asana.com/api/1.0/tasks/TASK_GID" \
  -d '{
    "data": {
      "notes": "Updated description"
    }
  }'
```

## Reading Tasks

### Fetch a task

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  "https://app.asana.com/api/1.0/tasks/TASK_GID?opt_fields=name,notes,assignee.name,created_at,custom_fields,tags.name,memberships.section.name,memberships.project.name"
```

### Add a comment

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://app.asana.com/api/1.0/tasks/TASK_GID/stories" \
  -d '{"data": {"text": "Comment text here"}}'
```

## Setting Custom Fields and Sections

### Get project sections (for board status)

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  "https://app.asana.com/api/1.0/projects/PROJECT_GID/sections?opt_fields=name,gid"
```

### Move task to a section

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://app.asana.com/api/1.0/sections/SECTION_GID/addTask" \
  -d '{"data": {"task": "TASK_GID"}}'
```

### Get custom fields

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  "https://app.asana.com/api/1.0/projects/PROJECT_GID/custom_field_settings?opt_fields=custom_field.name,custom_field.gid,custom_field.enum_options.name,custom_field.enum_options.gid"
```

### Set custom fields on a task

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X PUT "https://app.asana.com/api/1.0/tasks/TASK_GID" \
  -d '{
    "data": {
      "custom_fields": {
        "FIELD_GID": "ENUM_OPTION_GID"
      }
    }
  }'
```

## Setting Dependencies

```bash
curl -s -H "Authorization: Bearer $ASANA_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://app.asana.com/api/1.0/tasks/TASK_GID/addDependencies" \
  -d '{"data": {"dependencies": ["DEPENDENCY_GID"]}}'
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `html_notes` | Always use `notes` (plain text). `html_notes` requires strict XML — markdown and HTML will fail with parsing errors. |
| Calling `/projects` without workspace | Always pass `?workspace=WORKSPACE_GID` or you'll get 401/403. |
| Not adding subtask to project | Subtasks aren't auto-added to the parent's project. Call `addProject` separately. |
| Hardcoding project/workspace IDs | Read from `~/.blackbox/config.json` first. |
| Not saving discovered IDs | After discovering workspace/project, save to config for future invocations. |
