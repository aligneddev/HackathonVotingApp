# Han — History

## Context

Joined the HackathonVotingApp team on 2026-05-04.

**Project:** HackathonVotingApp — a hackathon voting application.
**Stack:** React (frontend), .NET 10 (backend), Azure (cost-optimized hosting).
**Owner:** Kevin Logan.

## Work Completed

### Slice 1 — Health Endpoint Implementation (Issue #6)
**Date:** 2026-05-04 | **Branch:** `han/6-slice1-api-skeleton` | **PR:** #11

Implemented GET /health endpoint using .NET 10 minimal API (no controllers):
- Endpoint returns `200 OK` with JSON `{"status":"healthy"}`
- 2/2 tests passing (xUnit + FluentAssertions)
- Program class declared `partial` for WebApplicationFactory test compatibility
- Follows TDD discipline: tests written and approved by Kevin before implementation

**Files:** `src/HackathonVotingApp.Api/Program.cs` | `src/HackathonVotingApp.Api.Tests/HealthEndpointTests.cs`

See `.squad/orchestration-log/2026-05-04T18-29-24Z-han.md` for full details.

## Learnings

### 2026-05-04: Slice 1 — Health Endpoint (TDD Green Phase)

**Branch:** `han/6-slice1-api-skeleton`  
**PR:** #11 — https://github.com/aligneddev/HackathonVotingApp/pull/11  
**Issue:** #6

**What was done:** Added `GET /health` endpoint to `src/HackathonVotingApp.Api/Program.cs` using .NET 10 minimal API pattern. Returns HTTP 200 with JSON body `{"status":"healthy"}`.

**Files changed:**
- `src/HackathonVotingApp.Api/Program.cs` — added `MapGet("/health", ...)` and `AddEndpointsApiExplorer()`

**Test results:** 2/2 passed
- `GetHealth_ReturnsOk` ✅
- `GetHealth_ReturnsExpectedBody` ✅

**Notes:**
- `public partial class Program { }` was already in Program.cs (Finn set it up) — enables `WebApplicationFactory<Program>` in tests.
- `InternalsVisibleTo` is set in the API csproj as well.
- Merged from `finn/1-slice1-failing-tests` branch first to get test files and API project scaffold.
- Solution file is `.slnx` format (not `.sln`) — already existed, left untouched.

### 2026-05-04: Slice 2 — Presentation CRUD API (TDD Green Phase)

**Branch:** `han/20-slice2-presentation-crud`  
**PR:** #23 — https://github.com/aligneddev/HackathonVotingApp/pull/23  
**Issue:** #20

**Files created:**
- `src/HackathonVotingApp.Api/Models/Presentation.cs` — EF Core entity model
- `src/HackathonVotingApp.Api/Models/PresentationDtos.cs` — CreatePresentationRequest, UpdatePresentationRequest, PresentationResponse records + ToResponse() extension
- `src/HackathonVotingApp.Api/Data/AppDbContext.cs` — EF Core DbContext with Presentations DbSet

**Files modified:**
- `src/HackathonVotingApp.Api/Program.cs` — added EF Core InMemory registration + 5 CRUD endpoints
- `src/HackathonVotingApp.Api.Tests/Endpoints/PresentationEndpointTests.cs` — added DB isolation via WithWebHostBuilder

**Endpoint routes:**
- `GET /presentations` → 200 + list
- `POST /presentations` → 201 + created resource
- `GET /presentations/{id:guid}` → 200 or 404
- `PUT /presentations/{id:guid}` → 200 or 404
- `DELETE /presentations/{id:guid}` → 204 or 404

**EF Core InMemory configuration (Program.cs):**
```csharp
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseInMemoryDatabase("HackathonVotingApp"));
```

**DB isolation for tests:** Each test uses `factory.WithWebHostBuilder(...)` to override `DbContextOptions<AppDbContext>` with a unique `$"TestDb-{Guid.NewGuid()}"`. The GUID must be captured in a local variable OUTSIDE the options lambda — if placed inside, it reruns per-request, creating a new DB each time and causing 404s.

**Test results:** 9/9 passed
- `GetHealth_ReturnsOk` ✅
- `GetHealth_ReturnsExpectedBody` ✅
- `GetPresentations_ReturnsOkWithEmptyList` ✅
- `CreatePresentation_ReturnsCreated` ✅
- `CreatePresentation_ReturnsCreatedPresentationWithId` ✅
- `GetPresentation_ExistingId_ReturnsOk` ✅
- `GetPresentation_MissingId_ReturnsNotFound` ✅
- `UpdatePresentation_ReturnsOk` ✅
- `DeletePresentation_ReturnsNoContent` ✅

**Decisions Made:**
1. **EF Core InMemory for Slice 2** — Using InMemory DB for rapid dev/test cycles. Azure SQL migration planned for Slice 6.
2. **Minimal API MapGroup** — Route grouping under `/presentations` prefix for cleaner code and future middleware support.
3. **DTO Separation** — Keep domain models separate from HTTP DTOs for decoupling and independent evolution.
4. **DB Isolation Tests** — Each test gets unique `TestDb-{Guid.NewGuid()}` name to prevent data leakage across tests. **Critical:** GUID must be outside the options lambda.

### 2026-05-05: Architecture Conventions Established

Kevin approved standing conventions for all backend work:

- **Program.cs stays thin.** It is an HTTP adapter only. All logic belongs in service classes. Route handlers are one-liners: call service → return IResult. If you find yourself writing business logic in a route handler, extract it.
- **Service interface first.** Every new domain concept gets `IXxxService` before implementation. Register it in DI as a stub if needed. This lets Finn mock and test before the slice lands.
- **Ubiquitous language is non-negotiable.** Use the domain word everywhere: class names, method names, variable names, EF entity names, DTO names. `Presentation`, `Vote`, `Score` — not `Item`, `Entry`, `Data`.
- **DTOs live separately.** Entity in `Models/{Domain}.cs`, DTO in `Models/{Domain}Dtos.cs`, mapped via `ToResponse()` extension. Never expose EF entities directly on the API surface.
- **Vote seam pattern.** When Kevin announces a new feature for a future slice, add the interface + stub + DI registration in the current slice so the seam exists. Do not wait until the feature slice to introduce the type.

### 2026-05-05: Slice 4 Green Phase — Real-Time Leaderboard Backend

Implemented `LeaderboardService` and `GET /leaderboard` endpoint.

**Branch:** `han/slice4-leaderboard`  
**PR:** #25 — Merged to main  
**Status:** ✅ Complete — all 7 backend tests passing

**Files created:**
- `src/HackathonVotingApp.Api/Services/LeaderboardService.cs` — service implementation
- `src/HackathonVotingApp.Api/Models/LeaderboardDtos.cs` — `LeaderboardEntryResponse` record

**Implementation:**
- `GetLeaderboardAsync(int limit = 50)` queries all presentations, joins with votes, aggregates vote counts, sorts descending, returns top N
- `GET /leaderboard?limit={optional}` route returns 200 OK with ranked array
- Default limit: 50 (per Kevin's TDD approval)
- Real-time: no caching — fresh counts every request

**Test results:** 7/7 passing
- 4 service unit tests (empty db, with votes, limit respected, real-time updates)
- 3 endpoint integration tests (returns ok, ranked order, pagination)

**Architecture notes:** Service uses in-memory aggregation (LINQ-to-Objects). Presentation without votes filtered out. Service-layer integrity (all logic in service, not route handler). Real-time patterns support future SignalR integration.

**Cross-slice learning:** Leaderboard aggregates Vote and Presentation data from Slices 3 and 2. Integration verified in tests. No breaking changes to existing models.

See `.squad/orchestration-log/2026-05-05T15-53-05Z-han.md` for full green phase details.
