---
name: gitlab-integration
description: GitLab operations via glab CLI. Use when working with GitLab merge requests, issues, CI/CD pipelines, or repository operations. Triggers include creating/viewing/merging MRs, checking pipeline status, managing issues, and any GitLab-specific tasks.
---

# GitLab Integration

Patterns for interacting with GitLab via the glab CLI.

## Authentication

### Check Auth Status
```bash
glab auth status
```

### Login
```bash
glab auth login
glab auth login --token <token>
```

## Merge Requests

### Create MR
```bash
# Basic
glab mr create --title "Title" --description "Description"

# With target branch
glab mr create --title "Title" --target-branch main

# With labels and assignee
glab mr create --title "Title" --label "feature,priority:high" --assignee username

# Draft MR
glab mr create --title "Draft: Title" --draft
```

### Create MR via Push Options
```bash
git push -o merge_request.create \
         -o merge_request.target=<branch> \
         -o merge_request.title="Title" \
         -o merge_request.description="Description" \
         -o merge_request.label="label1,label2" \
         -o merge_request.assignee="username" \
         -o merge_request.remove_source_branch
```

### List MRs
```bash
glab mr list                          # All open MRs
glab mr list --state opened|merged|closed
glab mr list --target-branch=main
glab mr list --author=username
glab mr list --assignee=@me
glab mr list --label="feature"
```

### View MR
```bash
glab mr view <id>                     # View details
glab mr view <id> --comments          # View with comments
glab mr view <id> --web               # View in browser
glab mr diff <id>                     # View diff
```

### Update MR
```bash
glab mr update <id> --title "New Title"
glab mr update <id> --description "New description"
glab mr update <id> --label "new-label"
glab mr update <id> --ready           # Mark ready (remove draft)
```

### MR Actions
```bash
glab mr approve <id>
glab mr merge <id>
glab mr merge <id> --squash
glab mr close <id>
glab mr reopen <id>
```

### MR Comments
```bash
glab mr comment <id> --message "Comment text"
glab mr note <id> "Note text"
```

## Issues

### List Issues
```bash
glab issue list                       # All open issues
glab issue list --state opened|closed
glab issue list --label "bug"
glab issue list --assignee @me
```

### View Issue
```bash
glab issue view <id>
glab issue view <id> --comments
glab issue view <id> --web
```

### Create Issue
```bash
glab issue create --title "Title" --description "Description"
glab issue create --title "Title" --label "bug,priority:high"
```

### Update Issue
```bash
glab issue update <id> --title "New Title"
glab issue close <id>
glab issue reopen <id>
```

## CI/CD

### Pipeline Status
```bash
glab ci status                        # Current pipeline status
glab ci view                          # View pipeline
glab ci view <pipeline_id>            # View specific pipeline
```

### Job Operations
```bash
glab ci trace <job_id>                # View job logs
glab ci list                          # List jobs
```

### Pipeline Actions
```bash
glab ci retry <pipeline_id>           # Retry failed pipeline
glab ci cancel <pipeline_id>          # Cancel running pipeline
glab ci run                           # Run new pipeline
```

### CI Config Validation
```bash
glab ci lint .gitlab-ci.yml
```

## Repository

### Clone
```bash
glab repo clone <repo>
```

### View
```bash
glab repo view
glab repo view --web
```

### Fork
```bash
glab repo fork <repo>
```

## Project Configuration

### View Project
```bash
glab project view
```

### List Variables
```bash
glab variable list
```

## API Access

### Direct API Calls
```bash
# GET request
glab api projects/:id/merge_requests

# POST request
glab api projects/:id/issues --method POST --field title="Title"
```

## Useful Patterns

### Check MR Before Push
```bash
glab mr list --source-branch=$(git branch --show-current)
```

### Monitor CI After Push
```bash
git push origin HEAD
sleep 5
glab ci status
```

### Quick MR Workflow
```bash
git checkout -b feature/quick-fix
# ... make changes ...
git add . && git commit -m "fix: quick fix"
git push -o merge_request.create \
         -o merge_request.target=main \
         -o merge_request.title="fix: quick fix"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth failed | Run `glab auth login` |
| MR not found | Check MR ID and project |
| CI lint fails | Check .gitlab-ci.yml syntax |
| Push rejected | Pull and rebase first |
