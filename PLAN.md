# HackathonVotingApp — Implementation Plan

## Problem Statement

Build a mobile-first hackathon voting web app where attendees vote for their favourite presentation. Top 3 win prizes. React frontend, .NET 10 API, Azure SQL database, one vote per device (cookie), real-time leaderboard (SignalR/polling), admin UI for managing presentations. Engineering visual theme.

## Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Vote deduplication | Cookie/localStorage (one vote per device) | Simple, no auth required, fast UX |
| Presentation management | Admin UI (CRUD) | Flexible before the event |
| Real-time leaderboard | SignalR with polling fallback | Live feedback, low infrastructure cost |
| Database | Azure SQL Database (free tier) | Relational model fits presentations + votes |
| React hosting | Azure Static Web Apps (free tier) | Built-in GitHub Actions, CDN, free SSL |
| API hosting | Azure App Service (F1 free tier → B1 if needed) | Lowest cost for .NET 10 |
| IaC | Bicep in `/infra/` | Native Azure, no extra tooling |
| CI/CD | GitHub Actions | Already integrated with Azure SWA |

---

## Vertical Slices (full backlog)

| # | Slice | Owner | Gate |
|---|-------|-------|------|
| 1 | **Skeleton + Home Page** ← current | Obi-Wan, Leia, Han, Poe | Kevin reviews failing tests before implementation |
| 2 | Presentation Admin (CRUD) | Han + Leia | TDD gate |
| 3 | Voting (cast vote, cookie dedup, validation) | Han + Leia + Finn | TDD gate |
| 4 | Real-time Leaderboard (SignalR) | Han + Leia | TDD gate |
| 5 | Results & Top 3 Prizes display | Leia | TDD gate |
| 6 | Azure infra + CI/CD pipeline (full) | Poe | CI green |

---

## Slice 1 Scope: Skeleton + Home Page

### What's in

- .NET 10 Web API project scaffolded (`src/HackathonVotingApp.Api/`)
- xUnit test project scaffolded (`src/HackathonVotingApp.Api.Tests/`)
- React + Vite app scaffolded (`src/frontend/`)
- Engineering-themed home page with fancy welcome visual (mobile-first)
- Health check endpoint (`GET /health`) on the API
- Bicep skeleton in `/infra/` (Azure SQL + App Service + Static Web Apps stubs)
- GitHub Actions CI stub (`.github/workflows/ci-cd.yml`) — build + test only
- Local dev setup documented (README updated)

### What's NOT in this slice

- Login / auth
- Voting logic
- Admin UI
- Database migrations / EF Core models
- Real-time SignalR
- Full Azure deployment (infra stub only)

---

## Repository Structure

```
HackathonVotingApp/
├── src/
│   ├── HackathonVotingApp.Api/
│   │   ├── HackathonVotingApp.Api.csproj   (.NET 10 Web API)
│   │   ├── Program.cs
│   │   └── Endpoints/
│   │       └── HealthEndpoint.cs
│   ├── HackathonVotingApp.Api.Tests/
│   │   ├── HackathonVotingApp.Api.Tests.csproj  (xUnit)
│   │   └── Endpoints/
│   │       └── HealthEndpointTests.cs           (failing first)
│   └── frontend/
│       ├── package.json                (React + Vite + Vitest + Testing Library)
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── pages/
│       │       └── HomePage.tsx        (engineering-themed welcome)
│       └── src/__tests__/
│           └── HomePage.test.tsx       (failing first)
├── infra/
│   ├── main.bicep
│   ├── sql.bicep
│   ├── appservice.bicep
│   └── staticwebapp.bicep
├── .github/
│   └── workflows/
│       └── ci-cd.yml
└── README.md  (updated with dev setup)
```

---

## TDD Workflow for This Slice

Per team norms, Finn writes the failing tests **first**. Kevin reviews and approves before any implementation begins.

### Tests Finn will write (before implementation)

**API — `HealthEndpointTests.cs`**
- `GetHealth_ReturnsOk` — GET /health returns 200
- `GetHealth_ReturnsExpectedBody` — response body has `status: "healthy"`

**Frontend — `HomePage.test.tsx`**
- `renders_welcome_heading` — heading with "Hackathon Voting" text is present
- `renders_engineering_theme_elements` — engineering visual elements render (e.g., gear/circuit icon region)
- `is_mobile_first_layout` — no horizontal scroll at 375px viewport

> ⛔ **GATE:** Kevin must explicitly approve these tests before Han, Leia, or Poe begin implementation.

---

## Home Page Visual Design (Engineering Theme)

Mobile-first, full-viewport welcome screen with:

- **Hero section**: Dark background (near-black `#0d1117`), accent colour engineering blue (`#2563eb`) or circuit-board green (`#22c55e`)
- **Headline**: "Welcome to Hackathon Voting" — large, bold, centred
- **Subheadline**: "Vote for your favourite presentation. Top 3 win prizes." — muted, smaller
- **Visual motif**: SVG circuit-board / gear pattern as background or decorative element
- **CTA button**: "Start Voting →" (disabled/greyed — voting not yet implemented)
- **Animations**: Subtle fade-in on load (Framer Motion or CSS keyframes)
- **Typography**: Monospace or technical font (JetBrains Mono / Inter)
- **Components**: Tailwind CSS v4 for styling (mobile-first breakpoints)

---

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| Backend | .NET | 10 |
| Backend | xUnit | 2.9+ |
| Backend | FluentAssertions | 7+ |
| Backend | NSubstitute | 5+ |
| Frontend | React | 19 |
| Frontend | Vite | 6 |
| Frontend | Vitest | 2+ |
| Frontend | @testing-library/react | 16+ |
| Frontend | Tailwind CSS | 4 |
| Frontend | Framer Motion | 11+ |

---

## Work Order (Slice 1)

```
[Finn]  finn-failing-tests     Write failing tests (API + frontend)
   ↓
[GATE]  kevin-test-review      Kevin reviews & approves failing tests
   ↓ (fan-out)
[Han]   han-api-skeleton       .NET 10 API + health endpoint (tests green)
[Leia]  leia-frontend-skeleton React/Vite + engineering home page (tests green)
[Poe]   poe-infra-skeleton     Bicep stubs + GitHub Actions CI (parallel — no gate)
   ↓ (join)
[Padme] padme-readme           Update README with dev setup instructions
```

---

## Notes

- Tailwind CSS v4 uses CSS-based config — **no `tailwind.config.js`** (different from v3)
- .NET 10 minimal API pattern preferred — no controllers unless complexity warrants
- Cookie pattern for vote dedup: `hackathon-vote-{sessionId}` (Slice 3)
- `Microsoft.AspNetCore.SignalR` referenced in API from Slice 1 to avoid future restructuring
- Azure SQL free tier: 100,000 vCore seconds/month — sufficient for a hackathon event
- Azure Static Web Apps free tier handles React hosting + CDN + SSL automatically
