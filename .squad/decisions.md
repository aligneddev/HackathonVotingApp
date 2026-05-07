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

---

### 2026-05-05: PresentationService Unit Tests
**Date:** 2026-05-05  
**Author:** Finn (Tester)  
**Status:** Complete — all tests passing

**Context:** Slice 2 (Presentation Admin CRUD) was functionally complete with integration tests only. `PresentationService` was extracted from `Program.cs` by Han but had no direct unit tests. The service layer is independently testable without an HTTP stack.

**Decision: Direct AppDbContext with EF Core InMemory**

Pattern:
```csharp
private static AppDbContext CreateDb()
{
    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase($"TestDb-{Guid.NewGuid()}")
        .Options;
    return new AppDbContext(options);
}
```

Each test method calls `CreateDb()` and gets a fully isolated, uniquely-named InMemory database.

**Why:** No HTTP overhead, no NSubstitute needed, isolation guaranteed, dispose safety ensured.

**Test Coverage:** 15 tests covering all 5 service methods (GetAllAsync, GetByIdAsync, CreateAsync, UpdateAsync, DeleteAsync). All 22 tests pass: 15 new unit tests + 7 existing integration tests.

**Test File:** `src/HackathonVotingApp.Api.Tests/Services/PresentationServiceTests.cs`

---

### 2026-05-05: HackathonVotingApp Architecture Conventions
**Date:** 2026-05-05
**Author:** Obi-Wan (Lead)
**Status:** Standing conventions — applied after Slice 2 architecture improvements

#### Convention 1: Ubiquitous Language
**Rule:** Domain terms must be consistent from the database schema through the service layer to the API surface to the frontend types. Never use generic names (`item`, `thing`, `data`, `entry`). Use the domain word everywhere — class names, method names, variable names, EF entity names, DTO property names, React state names, TypeScript interface names.

**Rationale:** When a name is domain-correct at every layer, the whole team can reason about code without translation. Ambiguity in naming is a source of bugs and miscommunication. `Presentation`, `Vote`, `Score` — not `Item`, `Entry`, `Data`.

**Pattern — introduce the name before the implementation:** The `Vote` model and `IVotingService` exist before voting is implemented. That is intentional. When Kevin announces a new domain concept, name it in the domain language first, then implement. The type system enforces the ubiquitous language from day one.

**Examples:**
- ✅ `presentations`, `presenterName`, `PresentationResponse`
- ❌ `items`, `name`, `ApiResponse`

#### Convention 2: Thin Routing Layer (Program.cs as Adapter)
**Rule:** `Program.cs` is an HTTP adapter. It wires dependency injection and maps routes to service calls. No business logic lives in `Program.cs`. Route handlers must be one-liners: call a service method and convert the result to an `IResult`. Any logic beyond "call service → return IResult" belongs in a service class.

**Rationale:** Business logic in route handlers is untestable without an HTTP stack, cannot be reused, and bloats `Program.cs` into an unmaintainable monolith. Keeping it thin makes every service independently testable.

**Pattern:**
```csharp
presentations.MapGet("/", async (IPresentationService svc) =>
    Results.Ok(await svc.GetAllAsync()));

presentations.MapPost("/", async (CreatePresentationRequest req, IPresentationService svc) =>
{
    var result = await svc.CreateAsync(req);
    return Results.Created($"/presentations/{result.Id}", result);
});
```

**Violation signal:** If you find yourself writing an `if`, `foreach`, or any data transformation inside a route handler lambda, extract it.

#### Convention 3: Service Interface Seams
**Rule:** Every domain concept gets an interface (`IPresentationService`, `IVotingService`) before implementation details are finalized. Interfaces are registered in DI — even as stubs — from the moment the domain concept is named.

**Rationale:** Interfaces allow unit testing of business logic without an HTTP stack. Registering stubs before the feature slice lands means the seam exists for injection and mocking from day one. No team member is blocked waiting for another's slice to land.

**Pattern — stub registration:**
```csharp
builder.Services.AddScoped<IVotingService, VotingService>(); // stub until Slice N
```

**Pattern — unit test (no WebApplicationFactory):**
```csharp
var mockContext = Substitute.For<AppDbContext>(...);
var svc = new PresentationService(mockContext);
var result = await svc.CreateAsync(req);
```

**Rule for new domain areas:** When a new feature is planned (voting, scoring, leaderboard), the interface + stub + DI registration are added in the current slice. The seam exists before the feature slice begins.

#### Convention 4: Typed Frontend API Client
**Rule:** React components do not call `fetch()` directly. All API communication is centralized in `src/api/{domain}Api.ts` (e.g., `presentationApi.ts`, `votingApi.ts`). Components import typed functions from the api module.

**Module responsibilities:**
- URL construction
- HTTP method, headers, body serialization
- Error handling — throws on `!response.ok` (no silent failures)
- TypeScript interfaces that mirror backend DTOs

**Pattern:**
```typescript
// src/api/presentationApi.ts
export interface Presentation { id: string; title: string; presenterName: string; ... }

export const presentationApi = {
  getAll: async (): Promise<Presentation[]> => {
    const res = await fetch('/presentations');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  // ...
};
```

**Test rule:** Tests mock the api module, not `global.fetch`.
```typescript
vi.mock('../api/presentationApi', () => ({ presentationApi: { getAll: vi.fn() } }));
```

**Rule for new domains:** When a new domain is added (voting, scoring), a corresponding `votingApi.ts` is created before the component that needs it.

#### Convention 5: React Router for Navigation
**Rule:** All routing goes through React Router (`BrowserRouter` + `Routes` + `Route`). No `window.location` string comparisons. No raw `href` programmatic navigation without `useNavigate`. New pages register a `<Route>` in `App.tsx`.

**Rationale:** React Router is the single routing authority. It provides auth guards, lazy loading, nested routes, and navigation history — all seams the app will need as it grows. `window.location.pathname` checks are fragile, invisible to the router, and cannot be guarded.

**Pattern:**
```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</BrowserRouter>
```

**Rule:** Every new page = a new `<Route>` in `App.tsx`. Future auth guards wrap route groups inside the router — not conditionals around `window.location`.

#### Convention 6: DTOs Separate from Domain Models
**Rule:** EF Core entities and API contracts live in separate files. The entity represents the data model; the DTO represents the HTTP contract. They evolve independently. A `ToResponse()` extension method maps entity → DTO at the service boundary.

**File structure:**
- `Models/{Domain}.cs` — EF Core entity
- `Models/{Domain}Dtos.cs` — request records, response records, `{Domain}Extensions.ToResponse()`

**Rationale:** API contracts and data models diverge over time. Exposing EF entities directly on the API surface creates coupling — a DB schema change becomes a breaking API change. `ToResponse()` keeps mapping logic cohesive, testable, and in one place.

**Pattern:**
```csharp
// PresentationDtos.cs
public static class PresentationExtensions
{
    public static PresentationResponse ToResponse(this Presentation p) =>
        new(p.Id, p.Title, p.PresenterName, p.Description, p.CreatedAt);
}
```


### Style Guidelines

- **Minimal APIs** — No controllers, use top-level route definitions
- **Records for DTOs** — Immutable data types
- **Result types** — No exceptions for expected business flows
- **Pure functions** — Business logic should be side-effect free where possible
- **Ubiquitous language** — Use domain terms from `.squad/skills/domain-driven-design/SKILL.md`

**Frontend contract:** The TypeScript `Presentation` interface in `presentationApi.ts` mirrors `PresentationResponse`. When the backend DTO changes, the frontend interface must be updated. These are the shared contract — keep them in sync.


** Code Formatting:** follow the .editorconfig (create one if needed), run `dotnet csharpier format .` for C#, and `prettier --write .` for TypeScript before committing.

### 2026-05-07: ResultsPage Tests and Implementation (Slice 5)
**Date:** 2026-05-07
**Author:** Finn (Tester) & Leia (Frontend Dev)
**Status:** Complete — all 28 frontend tests passing

#### Test Phase Summary (Finn)
Test file: `src/frontend/src/pages/ResultsPage.test.tsx`

**Behavioral Contracts (Updated):**
1. Loading state: indicator with "loading" text while API call in flight
2. Page heading: `/results/i` regex present after load
3. Prize labels: 🥇, 🥈, 🥉 for top 3 only (even when 5+ entries present)
4. All entries rendered: ALL entries' titles and presenterNames visible (not just top 3)
5. Entries 4+ visible: Appear in DOM without prize labels (no "4th Place" or "5th Place" text)
6. Fewer than 3 entries: Render without empty slots or errors
7. Empty results: No prize cards, no crash
8. No polling: API called exactly once on mount

**Key Change from v1:** Spec updated from "show top 3 only" → "show ALL entries with prize labels for top 3 only"

**Test Design:**
- Mock pattern: `vi.mock("../api/leaderboardApi")` (not global.fetch)
- Wrapper: `<MemoryRouter>` for Link navigation support
- Async handling: `waitFor()` for post-load assertions
- Removal of old test: "does NOT render 4th/5th" replaced with "renders 4th/5th without labels"

#### Implementation Phase Summary (Leia)
Component: `src/frontend/src/pages/ResultsPage.tsx`

**Decision 1: PRIZES array for medal/label mapping**
- Fixed 3-element array maps index → {medal, label}
- Returns undefined for index ≥ 3 (zero branching)
- Naturally handles edge cases

**Decision 2: Medal + label co-located in one `<span>`**
- Renders `"🥇 1st Place"` as single semantic unit
- Supports both Finn's `/🥇/` and `/1st place/i` regex queries

**Decision 3: Loading state via null sentinel**
- Type: `LeaderboardEntry[] | null`
- null = hasn't loaded yet
- [] = loaded with no data
- Matches LeaderboardPage pattern

**Decision 4: `/results` route in App.tsx**
- Added `<Route path="/results" element={<ResultsPage />} />`
- No nav link at this time — post-hackathon admin view

**Result:** All 28 frontend tests passing. Route `/results` wired.

### 2026-05-05: Slice PR Policy
**By:** Kevin Logan (via Copilot)
**What:** Each slice = one PR. All tests (backend + frontend) must be green before the PR is created. GitHub issues for all work items in the slice must be created and linked to the PR. PR is not opened until the full slice is done and verified.
**Why:** User request — captured for team memory. Prevents partial merges like the Slice 4 incident where red-phase and implementation PRs were split.

---

## Governance

- Do not commit directly to main — all work must go through PRs
- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction

# README Rewrite — Complete Developer Documentation

**Date:** 2026-05-05  
**Author:** Padme (Technical Writer)  
**Status:** Complete

## Decision

Replaced placeholder README with comprehensive developer documentation covering all aspects of the HackathonVotingApp project.

## What Changed

The README now includes:

1. **Project Overview** — Mobile-first voting platform, engineering theme, team composition
2. **Local Dev Setup** — Exact commands for backend (port 5050) and frontend (port 5173) with Vite proxy config
3. **Testing Instructions** — Backend (xUnit, dotnet test) and frontend (Vitest, npm run test)
4. **Complete REST API Reference** — All 9 endpoints documented with request/response examples:
   - `/health` (GET)
   - `/presentations` (GET, POST, GET by ID, PUT, DELETE)
   - `/votes/{presentationId}` (POST with 1-year cookie dedup, GET count)
5. **Architecture Overview** — Routing layer (thin adapter), services, DTOs, data access, frontend API client pattern
6. **Project Structure** — Directory tree showing backend, tests, frontend organization
7. **Vertical Slice Roadmap** — Slices 1–6 with status and scope
8. **Code Style & Conventions** — C# formatting, TypeScript/React patterns, Tailwind v4, no `tailwind.config.js`
9. **Contributing Guide** — Branch naming, TDD workflow, architecture principles

## Why This Matters

- **First-time contributor friendly** — New team members can follow the exact dev setup without asking questions
- **API surface locked down** — All endpoints documented with HTTP methods, status codes, and JSON payloads
- **Architecture captured** — Service boundaries, DTO separation, thin routing layer all explained
- **Decision visibility** — References `.squad/decisions.md` for ongoing architectural decisions and conventions
- **Roadmap clarity** — Vertical slice breakdown with completed and planned slices

## Alignment with Decisions

Drawn directly from active decisions in `.squad/decisions.md`:
- **API dev port 5050** — documented in dev setup
- **EF Core InMemory for Slices 1–5, Azure SQL in Slice 6** — documented in architecture section
- **Thin routing layer (Program.cs as adapter)** — convention enforced in README
- **Service interfaces (`IPresentationService`, `IVotingService`)** — documented in architecture
- **DTOs separated from domain models** — pattern documented
- **Typed frontend API client** — React components use api modules, not `fetch()` directly
- **Tailwind v4 CSS-based config** — documented in code style

## Next Steps

- Monitor if README needs updates as new slices are completed
- Update API reference if new endpoints are added
- Keep vertical slice roadmap in sync with `.squad/decisions.md`


