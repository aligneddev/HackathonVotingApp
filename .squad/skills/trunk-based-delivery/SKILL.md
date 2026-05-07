# Trunk Based Delivery

**Confidence:** high — established team practice, confirmed by Kevin (2026-05-07)

## The Core Rule

There is one trunk: `main`. All work integrates to main continuously.

- No long-lived feature branches. Branch lifetime: hours to 1 day maximum.
- Slice branches are **shared** — all agents working on a slice push to the same branch.

## Branch Naming

| Context | Pattern | Example |
|---|---|---|
| Slice work (all agents) | `slice/{N}-{slug}` | `slice/6-azure-infra` |
| Hotfix or solo work outside a slice | `{agent-or-author}/{issue-or-slug}` | `han/42-hotfix-vote-api` |

Per-agent branches are **only** for hotfixes or solo work that is not part of a slice. For all slice work, every agent uses the shared `slice/{N}-{slug}` branch.

## Slice Branch Workflow

1. **Obi-Wan creates the slice branch** at slice start: `git checkout -b slice/{N}-{slug}` from latest `main`, then `git push -u origin slice/{N}-{slug}`
2. **All agents pull the slice branch** before starting work: `git checkout slice/{N}-{slug} && git pull origin slice/{N}-{slug}`
3. **Agents commit directly to the slice branch** — no sub-branches per agent
4. Keep commits small and focused — one logical change per commit
5. **One PR per slice**, opened when all work is complete and tests + CI are green
6. **PR title format:** `Slice {N}: {description}` (e.g., `Slice 6: Azure infra + CI/CD pipeline`)
7. PR targets `main` — merge promptly once CI is green

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
- Never create a per-agent branch for slice work — use the shared `slice/{N}-{slug}` branch
