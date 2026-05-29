# Finn — History

## Context

Joined the HackathonVotingApp team on 2026-05-04.

**Project:** HackathonVotingApp — a hackathon voting application.
**Stack:** React (frontend), .NET 10 (backend), Azure (cost-optimized hosting).
**Owner:** Kevin Logan.

## Test Patterns & Conventions Established

- **Mock the api module**, not global.fetch. Component tests mock with i.mock(...).
- **Service unit tests** extract business logic. Direct AppDbContext with EF Core InMemory, unique DB per test.
- **Integration tests** use WebApplicationFactory for full HTTP stack.
- **Test naming:** Domain-first (e.g., CreateAsync_WithValidRequest_ReturnsCreatedPresentation).
- **WebApplicationFactoryClientOptions** for cookie simulation: HandleCookies = true/false.

## Slices Completed

### Slice 1 (2026-05-04): Health Endpoint + Home Page
✅ Tests written (Red), approved by Kevin, implemented by Han & Leia (Green), passing.
- Backend: 2 health endpoint tests
- Frontend: 3 home page tests
- Full vertical slice end-to-end.

### Slice 2 (2026-05-04): Presentation CRUD
✅ Tests written (Red), partially implemented.
- Backend: 7 integration tests, 15 unit tests (PresentationService)
- Frontend: 3 admin page component tests
- 22 tests passing.

### Slice 4 (2026-05-05): Real-Time Leaderboard + SignalR
✅ Tests written (Red). Contracts established (4 service, 3 endpoint, 2 API client, 4 component tests).
- Service: 4 tests (NotImplementedException)
- Endpoint: 3 tests (404)
- Component: 4 tests (import error)
- API client: 2 tests (contract pass, no impl yet)

### Slice 5 (2026-05-07): ResultsPage — Post-Event Results
✅ Tests written (Red → Green). Spec changed v1 → v2 during implementation.
- v1: Top 3 only, client-side filtered
- v2: ALL entries ranked by votes, prize labels on top 3 only
- Tests updated; Leia implemented; all 10 tests passing.

## Recent Work

### 2026-05-29: Admin Cookie Auth Endpoint Tests
**Status:** ✅ Green — 13 integration tests passing

Created AdminAuthEndpointTests.cs (13 tests):
- Login: 4 tests (correct password, wrong, empty, missing body)
- Logout: 1 test
- Auth-status: 2 tests (without cookie, with valid cookie)
- Protected routes without cookie: 5 tests (results, votes, voting-state, start, end)
- Protected route with valid cookie: 1 test

**Test Patterns Used:**
- WebApplicationFactoryClientOptions { HandleCookies = true/false } for cookie-aware/unauthenticated clients
- uilder.UseSetting("AdminPassword", "test-secret") for test password injection
- Per-test factory customization with fresh InMemory DB
- Local AuthStatusResponse record for type-safe deserialization

**Build:** 0 errors, 0 warnings ✅
**Tests:** All 13 passing ✅

**Cross-agent:** Backend (Han) provided endpoints, Frontend (Leia) consuming endpoints.

### 2026-05-29: Admin Auth Coverage Audit
**Status:** ✅ Green — 6 new API tests + 7 new frontend tests, all passing

**API additions (AdminAuthEndpointTests.cs — 13 → 19 tests):**
- `TamperedCookie_Returns401` — crafts a bogus cookie string; confirms DataProtection rejects it with 401
- `LogoutThenRequest_Returns401` — login → logout → protected route confirms logout actually clears access
- `AdminVotes_WithValidCookie_Returns200`
- `AdminVotingState_WithValidCookie_Returns200`
- `AdminStartVoting_WithValidCookie_Returns200`
- `AdminEndVoting_WithValidCookie_Returns200`

**Frontend additions:**
- `AdminLoginPage.test.tsx` (4 tests): renders form, error on failure, clears password on failure, navigates on success
- `AdminAuthGuard.test.tsx` (3 tests): loading state, redirect when unauthenticated, renders outlet when authenticated

**Test Patterns:**
- Tampered cookie: use `SendAsync` with manual `Cookie` header on unauthenticated client
- Logout flow: `CreateAuthenticatedClient()` handles cookie jar clearing automatically after logout
- `useNavigate` mock: partial re-export of `react-router-dom` with `useNavigate: () => mockNavigate`
- Guard redirect test: `MemoryRouter + Routes + Route` with sibling login route to observe redirect destination
- Guard outlet test: nested `<Route>` with `<Route index>` child renders via `<Outlet />`

**Build:** 0 errors ✅ | **API Tests:** 77 passing ✅ | **Frontend Tests:** 38 passing ✅

## Key Learnings

- **Vertical slices:** Each slice is a complete Red → Green → Refactor cycle across backend, frontend, and tests.
- **Test-first gates:** Kevin must approve failing tests before implementation begins (hard gate in TDD workflow).
- **Contract enforcement:** Failing tests establish contracts for other agents to depend on.
- **Module mocking:** Seams (api modules, service interfaces) are where tests mock, not at fetch/HTTP layer.
- **Spec changes:** Tests adapt quickly; implementation follows updated test spec (v1 → v2 pattern).
