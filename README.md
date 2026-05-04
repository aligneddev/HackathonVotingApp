# HackathonVotingApp

A mobile-first web app for voting on hackathon presentations. The top 3 presentations earn prizes.

**Theme:** Engineering | **Stack:** React + .NET 10 + Azure

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| .NET SDK | 10.x | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| Node.js | 22+ | [nodejs.org](https://nodejs.org/) |
| Git | any | [git-scm.com](https://git-scm.com/) |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/aligneddev/HackathonVotingApp.git
cd HackathonVotingApp
```

### 2. Run the API

```bash
dotnet restore
dotnet run --project src/HackathonVotingApp.Api
```

API runs at `http://localhost:5000`. Health check: `GET /health` → `{"status":"healthy"}`

### 3. Run the Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Running Tests

### API Tests (.NET / xUnit)

```bash
dotnet test
```

### Frontend Tests (Vitest)

```bash
cd src/frontend
npm test
```

### All tests

```bash
# From repo root
dotnet test && cd src/frontend && npm test
```

---

## Project Structure

```
HackathonVotingApp/
├── src/
│   ├── HackathonVotingApp.Api/         # .NET 10 minimal API
│   │   └── Program.cs                  # Endpoints
│   ├── HackathonVotingApp.Api.Tests/   # xUnit integration tests
│   └── frontend/                       # React + Vite + Tailwind v4
│       └── src/
│           ├── pages/HomePage.tsx      # Engineering-themed home page
│           └── __tests__/              # Vitest component tests
├── infra/                              # Azure Bicep (not deployed yet)
│   ├── main.bicep
│   ├── appservice.bicep
│   ├── sql.bicep
│   └── staticwebapp.bicep
└── .github/workflows/ci.yml           # GitHub Actions CI
```

---

## CI/CD

GitHub Actions runs on every push and PR to `main`:
- ✅ .NET build + test
- ✅ React build + test

See `.github/workflows/ci.yml`.

---

## Azure Infrastructure (Slice 3 — not deployed yet)

| Resource | Tier | Cost |
|----------|------|------|
| Static Web Apps | Free | $0/mo |
| App Service | F1 Free | $0/mo |
| SQL Database | Serverless (auto-pause) | ~$0 idle |

Bicep templates in `infra/` are stubs — deployment comes in a future slice.

---

## Development Workflow

This project uses **trunk-based delivery** with short-lived feature branches:

1. Branch: `{agent}/{issue-number}-{slug}` (e.g., `han/6-health-endpoint`)
2. Commit: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, etc.)
3. PR → CI green → review → merge to `main`

**TDD is required.** Tests are written first (Red), reviewed, then implementation follows (Green).
