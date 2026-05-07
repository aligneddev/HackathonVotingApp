# Finn — History

## Context

Joined the HackathonVotingApp team on 2026-05-04.

**Project:** HackathonVotingApp — a hackathon voting application.
**Stack:** React (frontend), .NET 10 (backend), Azure (cost-optimized hosting).
**Owner:** Kevin Logan.

## Learnings

### 2026-05-04 — TDD Skill Created

Created `.squad/skills/tdd-workflow/SKILL.md` — the authoritative TDD workflow for the HackathonVotingApp team.

Key rules established:
- **Hard gate:** No implementation until failing tests exist AND Kevin approves them.
- **Cycle:** Red → Review → Green → Refactor. The Review step is mandatory; Kevin's explicit approval is required before Green begins.
- **Testing tools chosen:**
  - .NET 10: xUnit (runner), FluentAssertions (assertions), NSubstitute (mocking), WebApplicationFactory (API integration tests)
  - React: Vitest (runner), @testing-library/react + @testing-library/user-event (component tests), MSW (API mocking)
- Minimum per vertical slice: unit tests + integration tests + component tests, each with a happy path and at least one error/edge case.
- Decision recorded to `.squad/decisions/inbox/finn-tdd-skill.md`.

### 2026-05-04 — Team Training Completed

All engineering norms have been encoded and merged to `.squad/decisions/decisions.md`. Orchestration logs written. Team has shared understanding of TDD (with Kevin gate), MSE principles, vertical slices, quality-over-quantity, trunk-based delivery, and continuous delivery practices.

### 2026-05-04 — Slice 2 Red Phase

Wrote failing tests for Presentation CRUD (TDD Red phase).

**Branch:** `finn/slice2-failing-tests`
**PR:** https://github.com/aligneddev/HackathonVotingApp/pull/21 (Draft)

**Test files created:**
- `src/HackathonVotingApp.Api.Tests/Endpoints/PresentationEndpointTests.cs` — 7 API integration tests
- `src/frontend/src/__tests__/AdminPage.test.tsx` — 3 frontend component tests
- `src/frontend/src/pages/AdminPage.tsx` — empty stub (makes tests compile, all fail)

**API Test Results (dotnet test):**
| Test | Status |
|---|---|
| GetPresentations_ReturnsOkWithEmptyList | ❌ FAIL (no route → 404) |
| CreatePresentation_ReturnsCreated | ❌ FAIL (no route → 404) |
| CreatePresentation_ReturnsCreatedPresentationWithId | ❌ FAIL (no route → 404) |
| GetPresentation_ExistingId_ReturnsOk | ❌ FAIL (no route → 404) |
| GetPresentation_MissingId_ReturnsNotFound | ⚠️ Pre-passes (404 before route; validates correctly post-impl) |
| UpdatePresentation_ReturnsOk | ❌ FAIL (no route → 404) |
| DeletePresentation_ReturnsNoContent | ❌ FAIL (no route → 404) |

**Frontend Test Results (npm test):**
| Test | Status |
|---|---|
| renders_presentations_heading | ❌ FAIL (stub renders empty div) |
| renders_add_presentation_button | ❌ FAIL (stub renders empty div) |
| renders_presentation_list_after_fetch | ❌ FAIL (stub renders empty div) |

**Notes:**
- `GetPresentation_MissingId_ReturnsNotFound` currently passes because no `/presentations` route exists (ASP.NET returns 404 for unmatched routes). This test will remain valid after implementation — it will pass only if the endpoint correctly handles a missing ID with 404.
- MSW is not yet installed in the frontend. Tests use `vi.fn()` to mock `fetch` globally. Future test additions should use MSW per SKILL.md conventions.

### 2026-05-04 — Slice 1 Complete

Slice 1 delivered: health endpoint + home page. Failing tests written for both backend (2) and frontend (3). Kevin approved; all tests passing after implementation by Han (backend) and Leia (frontend). Full team executed vertical slice successfully. See `.squad/orchestration-log/2026-05-04T18-29-24Z-finn.md`.

### 2026-05-05: PresentationService Unit Tests Written

Created `src/HackathonVotingApp.Api.Tests/Services/PresentationServiceTests.cs` — 15 unit tests covering all 5 service methods.

**Test file:** `src/HackathonVotingApp.Api.Tests/Services/PresentationServiceTests.cs`

**Pattern used:** Direct `AppDbContext` instantiation with EF Core InMemory, unique DB name per GUID per test. No HTTP stack, no WebApplicationFactory, no NSubstitute needed.

**Tests by method:**
| Method | Tests |
|---|---|
| GetAllAsync | EmptyDb_ReturnsEmptyList, WithPresentations_ReturnsAll |
| GetByIdAsync | ExistingId_ReturnsPresentationResponse, NonExistentId_ReturnsNull |
| CreateAsync | ValidRequest_ReturnsPresentationResponse, ValidRequest_PersistsToDb, NullDescription_DefaultsToEmptyString |
| UpdateAsync | ExistingId_ReturnsUpdatedResponse, NonExistentId_ReturnsNull, UpdatesAllFields |
| DeleteAsync | ExistingId_ReturnsTrue, NonExistentId_ReturnsFalse, ExistingId_RemovesFromDb |

**Results:** All 22 tests pass (15 new unit + 7 existing integration).

**Key learning:** `await using` is required for `AppDbContext` (it implements `IAsyncDisposable`). Without proper disposal, EF Core InMemory state could leak between tests if the same provider were reused.

### 2026-05-05: Slice 4 Red Phase — Real-Time Leaderboard

Wrote failing tests for Slice 4 (Real-Time Leaderboard + SignalR).

**Branch:** `finn/slice4-failing-tests`

**Stubs created (compilation only):**
- `src/HackathonVotingApp.Api/Models/LeaderboardDtos.cs` — `LeaderboardEntryResponse` record
- `src/HackathonVotingApp.Api/Services/ILeaderboardService.cs` — interface seam
- `src/HackathonVotingApp.Api/Services/LeaderboardService.cs` — stub (throws `NotImplementedException`)
- `src/frontend/src/api/leaderboardApi.ts` — minimal API client stub
- `src/frontend/src/pages/LeaderboardPage.tsx` — empty component stub

**Test files created:**
- `src/HackathonVotingApp.Api.Tests/Services/LeaderboardServiceTests.cs` — 4 service unit tests
- `src/HackathonVotingApp.Api.Tests/Endpoints/LeaderboardEndpointTests.cs` — 3 integration tests
- `src/frontend/src/__tests__/leaderboardApi.test.ts` — 2 API client tests
- `src/frontend/src/__tests__/LeaderboardPage.test.tsx` — 4 component tests

**Results:**
| File | Tests | Failing |
|---|---|---|
| `LeaderboardServiceTests.cs` | 4 | 4 ❌ (NotImplementedException) |
| `LeaderboardEndpointTests.cs` | 3 | 3 ❌ (404 — no route) |
| `leaderboardApi.test.ts` | 2 | 0 (stub satisfies contract) |
| `LeaderboardPage.test.tsx` | 4 | 4 ❌ (empty stub) |

**Key contracts established:**
- `GET /leaderboard` → 200 with `[{ id, title, presenterName, voteCount }]` ordered descending by `voteCount`
- `ILeaderboardService.GetLeaderboardAsync(int limit = 10)` — default 10 items
- `LeaderboardPage` must show loading state, rank numbers, and vote counts
- Decision note: `.squad/decisions/inbox/finn-slice4-tdd.md`

**Learning:** `leaderboardApi.test.ts` tests pass in red phase because the minimal API client stub correctly implements the HTTP contract (calls `GET /leaderboard`, parses JSON). These tests serve as contract enforcement, not red-phase gates. The true red-phase failures are in the service, endpoint, and component layers.

### 2026-05-07: Slice 5 Red Phase — ResultsPage

Wrote failing tests for Slice 5 (ResultsPage — post-event celebratory results display).

**Test file created:** `src/frontend/src/pages/ResultsPage.test.tsx`

**Pattern used:** Co-located test file (same directory as the future component), module-mock of `leaderboardApi` using `vi.mock`, `MemoryRouter` wrapper (matches AdminPage pattern), `waitFor` for async rendering.

**Tests written (10 total):**
| Test | Expected Failure Reason |
|---|---|
| shows a loading indicator while API call is in flight | `ResultsPage.tsx` does not exist — import error |
| renders a Results heading | `ResultsPage.tsx` does not exist |
| renders exactly 3 prize cards when 5 entries are returned | `ResultsPage.tsx` does not exist |
| renders the correct prize labels: 1st Place, 2nd Place, 3rd Place | `ResultsPage.tsx` does not exist |
| renders the title for each of the top 3 winners | `ResultsPage.tsx` does not exist |
| renders the presenterName for each of the top 3 winners | `ResultsPage.tsx` does not exist |
| does NOT render the 4th or 5th entry when 5 entries are returned | `ResultsPage.tsx` does not exist |
| renders only 2 prize cards when fewer than 3 entries exist | `ResultsPage.tsx` does not exist |
| renders no prize cards when the leaderboard is empty | `ResultsPage.tsx` does not exist |
| calls the leaderboard API exactly once on mount and never again | `ResultsPage.tsx` does not exist |

**Confirmed failure output:**
```
FAIL  src/pages/ResultsPage.test.tsx
Error: Failed to resolve import "./ResultsPage" from "src/pages/ResultsPage.test.tsx". Does the file exist?
```

All 10 tests in the suite fail at the import resolution stage — the expected TDD red phase failure.

**Key contracts established by these tests:**
- Route: `/admin/results` (component is `ResultsPage`, rendered inside `MemoryRouter`)
- Data source: `leaderboardApi.getLeaderboard()` — reuses existing API, called exactly once (no polling)
- Client-side slice: takes first 3 entries from whatever the API returns
- Prize labels: `🥇 1st Place`, `🥈 2nd Place`, `🥉 3rd Place`
- Fewer than 3: render only what exists, no empty slots
- Zero entries: render no prize cards (graceful empty state)
- Loading state: must show some loading text while API is in flight
- Page heading: must include "Results"

**Decision file:** `.squad/decisions/inbox/finn-results-page-tests.md`

### 2026-05-07: Slice 5 Tests Updated — ResultsPage v2 (Spec Change)

Spec changed: ResultsPage now shows ALL entries ranked by vote count, not just top 3. Top 3 still get prize labels; entries 4+ are visible but unlabeled.

**Test file updated:** `src/frontend/src/pages/ResultsPage.test.tsx`

**Tests changed:**

| Old Name | New Name | Reason |
|---|---|---|
| renders exactly 3 prize cards when 5 entries are returned | renders prize labels only for top 3 when 5 entries returned | Renamed to reflect intent; added `getAllByText` count assertions (each medal appears exactly once) |
| renders the title for each of the top 3 winners | renders titles for ALL entries | Expanded to assert all 5 entry titles are in the DOM |
| renders the presenterName for each of the top 3 winners | renders presenterName for ALL entries | Expanded to assert all 5 presenter names are in the DOM |
| does NOT render the 4th or 5th entry when 5 entries are returned | renders entries 4 and 5 WITHOUT prize labels | Inverted: entries 4/5 must NOW appear; test proves they are rendered but have no prize labels |

**Confirmed failure mode (correct):**
```
FAIL  src/pages/ResultsPage.test.tsx
Error: Failed to resolve import "./ResultsPage" from "src/pages/ResultsPage.test.tsx". Does the file exist?
```
All tests fail at import resolution — correct TDD red-phase failure.

**Decision file:** `.squad/decisions/inbox/finn-results-page-tests-v2.md`

### 2026-05-07: Slice 5 Tests Green — ResultsPage Implementation Complete

Leia completed implementation of `ResultsPage.tsx` per the updated v2 test spec.

**Test file:** `src/frontend/src/pages/ResultsPage.test.tsx` — **All 10 tests now passing ✅**

**Tests now passing:**
1. ✅ shows a loading indicator while the API call is in flight
2. ✅ renders a Results heading
3. ✅ renders prize labels only for top 3 when 5 entries returned
4. ✅ renders the correct prize labels: 1st Place, 2nd Place, 3rd Place
5. ✅ renders titles for ALL entries (expanded from top 3)
6. ✅ renders presenterName for ALL entries (expanded from top 3)
7. ✅ renders entries 4 and 5 WITHOUT prize labels (inverted from v1)
8. ✅ renders only 2 prize cards when fewer than 3 entries exist
9. ✅ renders no prize cards when the leaderboard is empty
10. ✅ calls the leaderboard API exactly once on mount and never again

**Overall test suite:** 28/28 passing (10 new + 18 existing)

**Implementation details:**
- PRIZES array pattern: fixed 3 elements, indexed by position, returns undefined for 3+
- Medal + label co-located in single semantic span
- All entries rendered (not filtered by component)
- Route: `/results` wired in `App.tsx`
- Loading state: null sentinel (matches LeaderboardPage pattern)

**Spec change (v1 → v2):**
- v1: show top 3 only, filter client-side with `.slice(0, 3)`
- v2: show ALL entries, apply prize labels to top 3 only
- Tests updated to reflect new spec; Leia implemented accordingly

### 2026-05-05: Architecture Conventions Established

Kevin approved standing conventions — these change how tests are written:

- **Mock the api module, not global.fetch.** Tests for components that use an api module (e.g., AdminPage using presentationApi) should mock the module with `vi.mock('../api/presentationApi', ...)`. Never mock `global.fetch` for component tests — that bypasses the seam.
- **Service unit tests are now possible.** Han extracts business logic into `PresentationService` etc. Finn can unit-test services directly (no WebApplicationFactory, no HTTP stack) by injecting a mock AppDbContext.
- **Integration tests still use WebApplicationFactory.** Http-level integration tests keep verifying the full stack. Both unit (service) and integration (HTTP) tests are expected.
- **Test naming follows the domain.** Test class: `PresentationServiceTests`. Test method: `CreateAsync_WithValidRequest_ReturnsCreatedPresentation`. Domain words everywhere.
- **Test the seam, not the transport.** For frontend: mock the api module (the seam). For backend: test the service method (the seam). Integration tests verify the wiring, not the logic.
