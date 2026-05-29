# HackathonVotingApp Review Recommendations (2026-05-29)

## Priority 1 (High Risk)

1. Protect admin and presentation mutation endpoints.
- Current behavior in `Program.cs` leaves admin controls open.
- Decision recorded for this cycle: defer auth changes and use compensating controls where feasible (network restriction, audit logging, temporary admin secret header).

2. Enforce duplicate ballot protection at the database level.
- Add a unique constraint on `SessionId + NormalizedVoterAliasToken`.
- Handle uniqueness conflicts in vote submission to return `409 Conflict` consistently under race conditions.

3. Align docs with implemented API surface.
- README currently reflects older endpoint shapes in places.
- Runtime routes should remain the source of truth and docs should be updated to match.

## Priority 2 (Reliability and Correctness)

1. Centralize ranking-to-points mapping.
- Remove duplicated scoring logic used by admin results and leaderboard.
- Keep one reusable mapping/function so scoring changes are made once.

2. Add uniform API validation and error responses.
- Add DTO-level validation attributes for required fields, lengths, and ranges.
- Return consistent `ProblemDetails` payloads for validation and known failures.

3. Improve health/readiness behavior.
- Expand health from liveness-only to include dependency checks (especially database readiness).

## Priority 3 (Frontend Robustness)

1. Unify API client behavior.
- Add shared timeout, abort, and normalized error handling for all frontend API modules.

2. Remove silent failure UX in admin pages.
- Show explicit error and retry states for create/delete/start/end operations.

3. Accessibility improvements.
- Improve form semantics and modal focus management in admin pages.

## Priority 4 (Infra and CI/CD)

1. SQL hardening decision: implement private endpoint + managed identity.
- Replace permissive SQL firewall posture with private connectivity and identity-based access.

2. Expand CI verification.
- Add Bicep validation/what-if and richer smoke tests beyond a basic health ping.

3. Add baseline observability and alerting.
- Capture request/error/dependency telemetry and alert on sustained issues.

## Testing Additions

1. Backend:
- Concurrency test for simultaneous duplicate ballot submission.
- Authorization/compensating-control tests for admin endpoints.
- Validation edge-case tests for DTO constraints.

2. Frontend:
- Admin failure path tests.
- Modal keyboard/focus tests.
- API timeout/error mapping tests.

## Execution Order

1. Data integrity and API contracts.
2. Backend reliability updates.
3. Frontend robustness and accessibility.
4. Infra hardening and CI expansion.
5. Documentation sync and final verification.

## Verification Checklist

1. Run backend tests:
`dotnet test src/HackathonVotingApp.Api.Tests/HackathonVotingApp.Api.Tests.csproj -c Release`
2. Run frontend tests:
`cd src/frontend && npm run test`
3. Build frontend:
`cd src/frontend && npm run build`
4. Validate CI and infra:
Bicep validation and what-if passes.
5. Confirm security behavior:
Duplicate concurrent ballot attempt results in one success and one conflict.
