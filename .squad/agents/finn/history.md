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

### 2026-05-04 — Slice 1 Complete

Slice 1 delivered: health endpoint + home page. Failing tests written for both backend (2) and frontend (3). Kevin approved; all tests passing after implementation by Han (backend) and Leia (frontend). Full team executed vertical slice successfully. See `.squad/orchestration-log/2026-05-04T18-29-24Z-finn.md`.
