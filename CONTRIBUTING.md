# Team development workflow

This repository uses **Linear for task tracking** and **GitHub for implementation evidence**.

## 1. Start from a Linear issue

Every implementation change should have a Linear issue before work begins. Use the issue identifier in the branch and PR.

Examples:

- `cs-7-minimum-ui-shell`
- `cs-8-artifact-wireframe`
- `cs-9-object-query-search`

Create branches from the latest `main`.

## 2. Keep changes small

One Linear issue should normally produce one focused branch and one pull request. Do not bundle unrelated cleanup or features into the same PR.

## 3. Commits

Prefer concise commit subjects that include the Linear identifier when practical, for example:

`feat(CS-7): add application shell`

## 4. Pull requests and review

The PR title should include the Linear identifier. In the PR body, link the Linear issue and explain how the acceptance criteria were validated.

PRs are reviewed **manually before merge**. The Product Owner/team lead is the default reviewer, or another teammate can review when appropriate. Trivial changes may be exempt when the team explicitly agrees.

Resolve any review comments that block merge before merging.

## 5. Merge strategy

Default to **squash merge**. This keeps `main` readable and normally produces one merge commit per Linear issue.

Delete the feature branch after merge when practical.

## 6. Linear status convention

Linear remains the task system of record. The GitHub integration provides branch/PR/merge evidence and cross-links work back to the corresponding Linear issue.

Use these statuses operationally:

- Branch created / active implementation → `In Progress`
- PR opened → `In Review` once that status exists
- PR merged and acceptance criteria satisfied → `Done`

If native status automation is unavailable or not configured for a transition, update the Linear status manually rather than maintaining a second workflow in GitHub.
