# HackathonVotingApp

A mobile-first hackathon voting platform where attendees vote on presentations and the top 3 vote-getters win prizes. Built with modern engineering practices: vertical slices, TDD red-first, continuous delivery, and trunk-based development.

**Tech Stack:** React 19 + Vite | .NET 10 Minimal APIs | EF Core InMemory | Tailwind v4 | xUnit + Vitest

**Hosting:** Azure (cost-optimized)

---

## Local Development Setup

### Prerequisites

- **.NET 10 SDK** — [download](https://dotnet.microsoft.com/download)
- **Node.js 20+** — [download](https://nodejs.org/)

### Backend API

The backend runs as a .NET 10 Minimal API on port **5050**.

```bash
cd src/HackathonVotingApp.Api
dotnet run
```

API health check:
```bash
curl http://localhost:5050/health
```

### Frontend

The frontend runs as a Vite React app on port **5173** and automatically proxies API calls to the backend.

```bash
cd src/frontend
npm install
npm run dev
```

Frontend app:
```
http://localhost:5173
```

**Vite Proxy Configuration:** Routes to `/presentations`, `/votes`, and `/health` are automatically forwarded to `http://localhost:5050`. See `vite.config.ts`.

### Running Both (Recommended)

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd src/HackathonVotingApp.Api
dotnet run
```

**Terminal 2 — Frontend:**
```bash
cd src/frontend
npm install
npm run dev
```

Then visit `http://localhost:5173` in your browser.

---

## Testing

### Backend Tests

From the repo root or from `src/HackathonVotingApp.Api.Tests/`:

```bash
dotnet test
```

- **Framework:** xUnit
- **Test structure:** Integration tests (with `WebApplicationFactory`) + unit tests (with EF Core InMemory)
- **Pattern:** Each test gets an isolated in-memory database via unique GUID database name

### Frontend Tests

From `src/frontend/`:

```bash
npm run test
```

Watch mode:
```bash
npm run test:watch
```

- **Framework:** Vitest
- **Component Testing:** React Testing Library
- **Mocking:** `vi.mock()` for API modules and native `fetch()`

---

## REST API Reference

All endpoints are prefixed with `http://localhost:5050` during local development.

### Health

#### `GET /health`

**Response:**
```json
{ "status": "healthy" }
```

---

### Presentations

#### `GET /presentations`

Retrieve all presentations.

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Building Real-Time Systems",
    "presenterName": "Alice",
    "description": "An engineering deep-dive into event-driven architecture.",
    "createdAt": "2026-05-04T12:00:00Z"
  }
]
```

---

#### `POST /presentations`

Create a new presentation.

**Request Body:**
```json
{
  "title": "Building Real-Time Systems",
  "presenterName": "Alice",
  "description": "An engineering deep-dive into event-driven architecture."
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Building Real-Time Systems",
  "presenterName": "Alice",
  "description": "An engineering deep-dive into event-driven architecture.",
  "createdAt": "2026-05-04T12:00:00Z"
}
```

---

#### `GET /presentations/{id}`

Retrieve a single presentation by ID.

**Response:** `200 OK` (success) or `404 Not Found` (presentation doesn't exist)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Building Real-Time Systems",
  "presenterName": "Alice",
  "description": "An engineering deep-dive into event-driven architecture.",
  "createdAt": "2026-05-04T12:00:00Z"
}
```

---

#### `PUT /presentations/{id}`

Update an existing presentation.

**Request Body:**
```json
{
  "title": "Building Real-Time Systems v2",
  "presenterName": "Alice",
  "description": "Updated description."
}
```

**Response:** `200 OK` (success) or `404 Not Found`

---

#### `DELETE /presentations/{id}`

Delete a presentation.

**Response:** `204 No Content` (success) or `404 Not Found`

---

### Voting

#### `POST /votes/{presentationId}`

Cast a vote for a presentation. Votes are deduplicated per browser via cookie.

**Path Parameters:**
- `presentationId` — UUID of the presentation

**Response:**
- `201 Created` — Vote recorded
- `404 Not Found` — Presentation doesn't exist
- `409 Conflict` — Already voted for this presentation (cookie `hackathon-voted-{presentationId}` exists)

**Deduplication:** The server sets a cookie `hackathon-voted-{presentationId}` with 1-year TTL (`MaxAge = 365 days`). Subsequent requests from the same browser are rejected with `409 Conflict`.

---

#### `GET /votes/{presentationId}/count`

Get the current vote count for a presentation.

**Response:** `200 OK` or `404 Not Found`

```json
{
  "count": 42
}
```

---

## Architecture

### Routing Layer (Program.cs)

The HTTP adapter. Routes are defined in `Program.cs` as Minimal API endpoints grouped by domain (`/presentations`, `/votes`). **No business logic lives in route handlers** — they are one-liners that call a service and return an `IResult`.

**Pattern:**
```csharp
var presentations = app.MapGroup("/presentations");
presentations.MapGet("/", async (IPresentationService svc) =>
    Results.Ok(await svc.GetAllAsync()));
```

### Services

Business logic lives in service classes implementing domain interfaces:
- **`IPresentationService`** — Presentation CRUD (GetAll, GetById, Create, Update, Delete)
- **`IVotingService`** — Vote recording and counting

Services are registered in DI and injected into route handlers:
```csharp
builder.Services.AddScoped<IPresentationService, PresentationService>();
builder.Services.AddScoped<IVotingService, VotingService>();
```

### Data Access

- **EF Core InMemory** (Slices 1–5) — in-process in-memory database for fast dev iteration
- **Azure SQL** (Slice 6) — production database with EF Core migrations

Current setup: `DbContext` configured with `UseInMemoryDatabase("HackathonVotingApp")`

Each integration test overrides this to use a unique in-memory database name to ensure isolation.

### Domain Models & DTOs

**Domain Model** (`Models/Presentation.cs`):
- EF Core entity representing the persisted data shape
- Should not be exposed directly on the API surface

**DTOs** (`Models/PresentationDtos.cs`):
- Request records: `CreatePresentationRequest`, `UpdatePresentationRequest`
- Response record: `PresentationResponse`
- Extension method: `Presentation.ToResponse()` — maps entity to DTO at the service boundary

This separation allows the API contract and data model to evolve independently.

### Frontend API Client

React components do **not** call `fetch()` directly. All API communication is centralized in typed modules:
- `src/api/presentationApi.ts` — Presentation endpoints
- `src/api/votingApi.ts` — Voting endpoints

Each module exports a typed API object:
```typescript
export const presentationApi = {
  getAll: async (): Promise<Presentation[]> => { ... },
  create: async (req: CreatePresentationRequest): Promise<Presentation> => { ... },
  // ...
};
```

Components import and call these functions. Tests mock the entire api module.

---

## Project Structure

```
src/
├── HackathonVotingApp.Api/               # Backend
│   ├── Program.cs                        # Route definitions & DI setup
│   ├── Services/
│   │   ├── IPresentationService.cs       # Domain interface
│   │   └── PresentationService.cs        # Implementation
│   ├── Models/
│   │   ├── Presentation.cs               # EF Core entity
│   │   └── PresentationDtos.cs           # Request/response DTOs
│   ├── Data/
│   │   └── AppDbContext.cs               # EF Core context
│   └── HackathonVotingApp.Api.csproj
│
├── HackathonVotingApp.Api.Tests/         # Backend tests
│   ├── Endpoints/                        # Integration tests (with HTTP)
│   ├── Services/                         # Unit tests (no HTTP)
│   └── HackathonVotingApp.Api.Tests.csproj
│
└── frontend/                             # React frontend
    ├── src/
    │   ├── App.tsx                       # Main routing component
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   └── AdminPage.tsx
    │   ├── api/
    │   │   ├── presentationApi.ts        # Typed presentation client
    │   │   └── votingApi.ts              # Typed voting client
    │   └── __tests__/
    │       └── *.test.tsx                # Component tests
    ├── vite.config.ts                    # Vite config & proxy setup
    ├── vitest.config.ts                  # Vitest config
    └── package.json
```

---

## Vertical Slice Roadmap

### ✅ Slice 1: Skeleton & Home Page
- .NET 10 Minimal API boilerplate
- React + Vite frontend skeleton
- Engineering-themed home page with welcome
- `/health` endpoint
- Infrastructure in place (CORS, DI, EF Core)

### ✅ Slice 2: Presentation Admin (CRUD)
- Backend: Presentation CRUD API endpoints
- Frontend: Admin page for managing presentations
- EF Core InMemory database
- DTOs separated from entities
- Service layer with clean separation of concerns

### ✅ Slice 3: Voting (Cast & Dedup & Count)
- Backend: Vote endpoints with cookie-based deduplication
- Frontend: Voting UI on presentation cards
- Vote counting and display

### 🔲 Slice 4: Real-Time Leaderboard
- SignalR hub for live vote updates
- Leaderboard page showing top presentations in real-time

### 🔲 Slice 5: Results & Top 3 Prizes
- Results page showing final rankings
- Top 3 winner display with prize badges

### 🔲 Slice 6: Azure Infrastructure & CI/CD
- Bicep IaC for Azure SQL, App Service, Storage
- EF Core migrations and Azure SQL integration
- GitHub Actions CI/CD pipeline
- Cost-optimized Azure Consumption Plan deployment

---

## Code Style & Conventions

### C#

- **Format:** Run `dotnet csharpier format .` before committing
- **Naming:** Domain-driven — use ubiquitous language (e.g., `Presentation`, not `Item`)
- **Records for DTOs:** Immutable request/response types
- **Result types:** Use `Results.*` helpers; no exceptions for expected flows
- **Thin routing:** Business logic lives in services, not `Program.cs`

### TypeScript / React

- **Format:** Run `prettier --write .` before committing
- **Naming:** Match the backend domain language
- **API calls:** Use typed api modules, not `fetch()` directly in components
- **Routing:** React Router for all navigation; no `window.location` comparisons
- **Testing:** Mock api modules, not `global.fetch`
- **Tailwind v4:** CSS-based configuration; no `tailwind.config.js` file

---

## Contributing

1. **Branch naming:** Follow the vertical slice model — `{initials}/{slice-number}-{feature}`
2. **Commits:** Include meaningful messages; reference issues and PRs
3. **Tests first:** Write failing tests before implementation (TDD red phase)
4. **Architecture:** Respect service boundaries and the thin routing layer
5. **Documentation:** Update docs as code evolves; keep API reference in sync

---

## Resources

- [.squad/decisions.md](.squad/decisions.md) — Architecture decisions and conventions
- [PLAN.md](PLAN.md) — High-level project roadmap and direction
- [Implementation Details.md](Implementation Details.md) — Feature-level specs

---

**Built with quality over quantity. Vertical slices. Continuous delivery. Modern software engineering.**
