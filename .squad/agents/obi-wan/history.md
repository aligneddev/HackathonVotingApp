# Obi-Wan — History

## Context

Joined the HackathonVotingApp team on 2026-05-04.

**Project:** HackathonVotingApp — a hackathon voting application.
**Stack:** React (frontend), .NET 10 (backend), Azure (cost-optimized hosting).
**Owner:** Kevin Logan.

## Learnings

### 2026-05-04 — Skills Infrastructure

Created three foundational skill files encoding Kevin's engineering norms:
- `.squad/skills/mse-principles/SKILL.md` — Modern Software Engineering Principles (iterative learning, complexity management, React + .NET 10 in-practice guidance)
- `.squad/skills/vertical-slices/SKILL.md` — Vertical Slice Development (end-to-end slices as the unit of work; definition of done includes Kevin's TDD gate)
- `.squad/skills/quality-over-quantity/SKILL.md` — Quality Over Quantity (scope discipline; every line earns its place)

Updated all six agent charters (obi-wan, leia, han, finn, poe, padme) with a `## Skills` section appended after the `## Model` section. All five skills (including the forthcoming tdd-workflow and trunk-based-delivery) are listed in every charter. This is the charter update pattern: append a `## Skills` section; never replace existing charter content.

### 2026-05-04 — Team Training Completed

All engineering norms have been encoded and merged to `.squad/decisions/decisions.md`. Orchestration logs written. Team has shared understanding of TDD (with Kevin gate), MSE principles, vertical slices, quality-over-quantity, trunk-based delivery, and continuous delivery practices.

### 2026-05-04 — Slice 1 GitHub Issues Created

Created 6 Slice 1 work items as GitHub issues in `aligneddev/HackathonVotingApp`:

**Issues Created:**
- **#1** — "[Slice 1] Write failing tests — health endpoint + home page" (Finn, `squad:finn`)
  - TDD gate: tests before implementation. Failing tests for health endpoint + home page.
- **#2** — "[Slice 1] GATE: Kevin reviews and approves failing tests" (Kevin, `tdd-gate`)
  - Hard gate: Kevin must approve tests before implementation begins. Blocks #6, #7, #8.
- **#5** — "[Slice 1] Scaffold Bicep infra stubs + GitHub Actions CI" (Poe, `squad:poe`, `infra`)
  - Infrastructure skeleton: Bicep stubs, no real provisioning. CI/CD workflow for .NET + React.
- **#6** — "[Slice 1] Scaffold .NET 10 minimal API + implement health endpoint" (Han, `squad:han`)
  - Backend skeleton: Make Finn's tests pass. Health endpoint returns 200 + status JSON. Depends on gate #2.
- **#7** — "[Slice 1] Scaffold React/Vite frontend + engineering-themed home page" (Leia, `squad:leia`)
  - Frontend skeleton: Engineering-themed home page (dark bg, circuit motif, Framer Motion). Depends on gate #2.
- **#8** — "[Slice 1] Update README with local dev setup instructions" (Padme, `squad:padme`)
  - Developer documentation: dev env setup, how to run API/frontend locally. Depends on #6 + #7.

**Labels Created:**
- `slice-1` (#0075ca) — all Slice 1 issues
- `squad` (#e4e669) — all team issues
- `squad:finn`, `squad:han`, `squad:leia`, `squad:poe`, `squad:padme` (#d93f0b) — assignee labels
- `tdd-gate` (#b60205) — test review gates
- `infra` (#0e8a16) — infrastructure work

**GitHub Project Board:**
- Project board creation requires `project` and `read:project` OAuth scopes. Current gh auth token lacks these scopes.
- Workaround: Manually create GitHub Project "HackathonVotingApp — Slice 1" via web UI, add issues #1, #2, #5, #6, #7, #8, and configure status columns (Todo, In Progress, Review/Gate, Done).

### 2026-05-04 — Slice 2 GitHub Issues Created

Created 5 Slice 2 work items (Presentation Admin CRUD) as GitHub issues in `aligneddev/HackathonVotingApp`:

**Issues Created:**
- **#19** — "[Slice 2] Write failing tests — Presentation CRUD" (Finn, `squad:finn`)
  - TDD Red Phase: failing tests for all Slice 2 features before implementation begins. Tests for API endpoints (GET, POST, PUT, DELETE /presentations) and frontend AdminPage component.
- **#18** — "[Slice 2] GATE: Kevin reviews and approves failing tests" (Kevin, `tdd-gate`)
  - Hard gate: Kevin reviews and approves Finn's tests. Blocks #20 (Han), #17 (Leia).
- **#20** — "[Slice 2] .NET 10 API — Presentation CRUD endpoints" (Han, `squad:han`)
  - Backend: Presentation model (Id, Title, PresenterName, Description, CreatedAt). EF Core with InMemory database. Minimal API endpoints (GET, POST, PUT, DELETE /presentations). Depends on gate #18.
- **#17** — "[Slice 2] React Admin UI — Presentation CRUD" (Leia, `squad:leia`)
  - Frontend: AdminPage.tsx with presentation list, add/edit form, delete with confirmation. Fetch from API. Mobile-first, Tailwind v4, engineering theme. Depends on gate #18.
- **#16** — "[Slice 2] Update README — Presentation CRUD API docs" (Padme, `squad:padme`)
  - Documentation: API endpoint docs, /admin route docs, dev setup updates. Depends on #20 + #17.

**Labels Created:**
- `slice-2` (#0E8A16) — all Slice 2 issues
