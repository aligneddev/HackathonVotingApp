# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture, design decisions, scope | Obi-Wan | System design, tech choices, breaking changes |
| React UI, components, styling | Leia | Components, hooks, routing, state management |
| .NET 10 API, database, services | Han | Controllers, services, EF Core, auth |
| Tests, quality, edge cases | Finn | Unit tests, integration tests, test strategy |
| Azure infra, CI/CD, cost optimization | Poe | Bicep/Terraform, App Service, cost review |
| Documentation, README, API docs | Padme | Docs, changelogs, API references, guides |
| Code review | Obi-Wan | Review PRs, check quality, suggest improvements |
| Testing | Finn | Write tests, find edge cases, verify fixes |
| Scope & priorities | Obi-Wan | What to build next, trade-offs, decisions |
| Session logging | Scribe | Automatic — never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Obi-Wan |
| `squad:obi-wan` | Architecture, design, review work | Obi-Wan |
| `squad:leia` | Frontend React work | Leia |
| `squad:han` | Backend .NET 10 work | Han |
| `squad:finn` | Testing and QA work | Finn |
| `squad:poe` | Azure infra and DevOps work | Poe |
| `squad:padme` | Documentation work | Padme |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, **Obi-Wan** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Lead review.

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.
