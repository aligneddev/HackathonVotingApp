# Trunk Based Delivery

## The Core Rule

There is one trunk: `main`. All work integrates to main continuously.

- No long-lived feature branches. Branch lifetime: hours to 1 day maximum.
- Branches are named: `{agent-or-author}/{issue-or-slug}` (e.g., `han/42-vote-api`)

## Branch and Integration Workflow

1. Pull latest from main before starting any work
2. Create a short-lived branch for the current vertical slice
3. Keep commits small and focused — one logical change per commit
4. Open a PR as soon as the slice is ready (tests green, CI green)
5. PR requires CI green — no merging broken builds
6. Merge to main promptly — do not let PRs sit

## Feature Flags Over Long Branches

- If a feature takes more than a day, use a feature flag to hide incomplete work in main
- This is preferred over a long-lived branch

## Commit Hygiene

- Commit message format: `{type}({scope}): {what}` (Conventional Commits)
- Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `ci`
- Example: `feat(voting): add cast-vote endpoint` or `test(voting): add failing tests for cast-vote`
- Always reference the issue: `feat(voting): add cast-vote endpoint (#42)`

## What NEVER To Do

- Never commit directly to main (all work via PR)
- Never merge a PR with failing CI
- Never keep a branch open longer than 1 day without discussing it
