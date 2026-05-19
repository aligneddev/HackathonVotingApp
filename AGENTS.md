# AGENTS.md

Mobile-first hackathon voting app — React 19 frontend + .NET 10 Minimal API + Azure SQL.

## Build & Test

| Task | Command |
|------|---------|
| API tests | `dotnet test` (from repo root) |
| Frontend tests | `cd src/frontend && npm run test` |
| API format | `dotnet csharpier format .` |
| Frontend format | `cd src/frontend && prettier --write .` |

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`aligneddev/HackathonVotingApp`). See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

### Triage labels

Default five-label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Domain docs

Single-context repo — one `CONTEXT.md` at root, `docs/adr/` for decisions. See [`docs/agents/domain.md`](docs/agents/domain.md).

### Conventions

Code style, naming, testing patterns, and branch model. See [`docs/agents/conventions.md`](docs/agents/conventions.md).

### Deployment

Azure infrastructure setup and CI/CD pipeline. See [`docs/deploy.md`](docs/deploy.md).
