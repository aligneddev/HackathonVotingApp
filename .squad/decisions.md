# Squad Decisions

## Active Decisions

### 2026-05-04: TDD Red phase complete — Slice 1
**By:** Finn
**What:** Wrote failing tests for health endpoint and home page. Tests compile but fail. Branch: finn/1-slice1-failing-tests. Kevin must approve via issue #2 before Han/Leia implement.
**Files:** src/HackathonVotingApp.Api.Tests/Endpoints/HealthEndpointTests.cs, src/frontend/src/__tests__/HomePage.test.tsx

---

### 2026-05-04: API dev port changed to 5050
**By:** Han
**What:** launchSettings.json configured for port 5050. Port 5000 was in use (common Windows conflict with IIS Express / reserved ports).
**Local dev URL:** http://localhost:5050/health

---

### 2026-05-04: Presentation CRUD API — Slice 2 Backend
**Date:** 2026-05-04  
**Author:** Han (Backend Dev)  
**Status:** Proposed — pending team review

#### Decision 1: EF Core InMemory for Slice 2, Real Azure SQL in Slice 6
**Context:** Slice 2 needs persistence for Presentation CRUD. Azure SQL Serverless is planned (Poe's Bicep infra) but not yet wired up.

**Decision:** Use `Microsoft.EntityFrameworkCore.InMemory` for Slice 2. Real Azure SQL with EF Core migrations will be introduced in Slice 6.

**Why:**
- Keeps Slice 2 thin and fast — no DB provisioning, migrations, or connection strings needed
- InMemory is sufficient for the hackathon admin CRUD use case in early slices
- `AppDbContext` is already defined with proper EF Core conventions — switching to SQL Server requires only a single `UseInMemoryDatabase` → `UseSqlServer` change

**Transition Plan:** Slice 6 replaces `UseInMemoryDatabase("HackathonVotingApp")` with `UseSqlServer(connectionString)` and adds EF migrations.

#### Decision 2: Minimal API MapGroup Pattern for Endpoint Grouping
**Context:** .NET 10 minimal APIs don't use controllers. Presentation endpoints need clean routing.

**Decision:** Use `app.MapGroup("/presentations")` to group all Presentation CRUD endpoints under a shared route prefix.

**Pattern:**
```csharp
var presentations = app.MapGroup("/presentations");
presentations.MapGet("/", ...);
presentations.MapPost("/", ...);
presentations.MapGet("/{id:guid}", ...);
presentations.MapPut("/{id:guid}", ...);
presentations.MapDelete("/{id:guid}", ...);
```

**Why:**
- Route prefix is declared once — no repetition
- Enables future group-level middleware (auth, rate limiting) with a single call
- Consistent with .NET 10 minimal API best practices

#### Decision 3: DTOs Separate from Domain Model
**Context:** EF Core entities and HTTP response shapes often diverge over time.

**Decision:** Keep `Presentation.cs` (domain/EF entity) and `PresentationDtos.cs` (request/response records) in separate files under `Models/`.

**Files:**
- `src/HackathonVotingApp.Api/Models/Presentation.cs` — EF Core entity
- `src/HackathonVotingApp.Api/Models/PresentationDtos.cs` — `CreatePresentationRequest`, `UpdatePresentationRequest`, `PresentationResponse`, `PresentationExtensions.ToResponse()`

**Why:**
- Decouples the API contract from the data model — can evolve independently
- `PresentationResponse` record matches Finn's test DTO exactly
- `ToResponse()` extension keeps mapping logic cohesive and testable

#### Decision 4: DB Isolation Pattern for Integration Tests
**Context:** xUnit `IClassFixture<WebApplicationFactory<Program>>` shares one app instance per test class. InMemory DB data persists across tests, causing `GetPresentations_ReturnsOkWithEmptyList` to fail when other tests add data.

**Decision:** Override `DbContextOptions<AppDbContext>` in each test instance via `factory.WithWebHostBuilder(...)` to give each test its own named InMemory database.

**Pattern:**
```csharp
var dbName = $"TestDb-{Guid.NewGuid()}";  // ← MUST be outside the options lambda
services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase(dbName));
```

**Critical:** The GUID must be captured in a local variable before the options lambda. If placed inside the lambda (`options.UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}")`), the lambda re-executes per request, creating a new DB each time and causing 404s on data created in a previous request within the same test.

---

### 2026-05-04: AdminPage Decisions (Slice 2 Frontend)
**Date:** 2026-05-04
**Author:** Leia (Frontend Dev)
**Issue:** #17

#### Decision 1: global.fetch pattern — no additional HTTP library
**Decision:** The frontend uses `fetch()` directly (browser native). No axios or other HTTP client library is added.

**Rationale:** Finn's tests mock `global.fetch` with `vi.fn()`. Adding axios or another library would bypass the mock and require additional test infrastructure (MSW or module mocking). Keeping `fetch()` native keeps tests simple and avoids extra dependencies.

**Impact:** All API calls in React components must use `fetch()` directly. If a different HTTP client is ever adopted, tests must be updated to match.

#### Decision 2: AdminPage uses useEffect + useState for data fetching
**Decision:** AdminPage fetches data with `useEffect` on mount and stores results in `useState`. No data-fetching library (React Query, SWR, etc.) is used.

**Rationale:** Slice 2 scope is minimal — a single list fetch with create/delete. The overhead of a data-fetching library is not justified for this slice. This matches the pattern Finn's tests expect (direct fetch call on mount).

**Impact:** For future slices with more complex caching or pagination needs, revisit adopting React Query or SWR.

#### Decision 3: /admin route — no authentication in Slice 2
**Decision:** The `/admin` route is accessible without authentication. Routing is implemented via simple `window.location.pathname` check in `App.tsx` (no React Router installed).

**Rationale:** No auth system exists in Slice 2. Security is out of scope for this slice. React Router was not in the project dependencies, so a lightweight pathname check was used to avoid adding a new dependency for a two-route app.

**Impact:** Authentication and proper routing (React Router or similar) must be added in a future slice before production deployment.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
