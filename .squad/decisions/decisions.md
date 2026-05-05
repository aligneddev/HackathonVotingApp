# Decisions Archive

## 2026-05-04

### 2026-05-04T12:36: User directives — Engineering practices
**By:** Kevin Logan (via Copilot)
**What:**
- TDD: write failing tests first. User (Kevin) reviews and approves tests before implementation begins. No feature code without a passing test first.
- Work in vertical slices — one thin, complete slice end-to-end per unit of work.
- Quality over quantity — never ship more than what's needed; get it right before moving on.
- Optimize for Learning: iterate, prioritize feedback, embrace incrementalism, be experimental, practice empiricism.
- Optimize for Managing Complexity: design for modularity, maintain high cohesion, separate concerns, hide information and use abstraction, manage coupling effectively.
- Trunk Based Delivery: all work integrates to trunk (main) continuously; no long-lived branches.
- Continuous Delivery: every commit is potentially releasable; pipeline enforces this.
**Why:** User request — captured for team memory. These are the foundational engineering norms for this project.

---

## Decision: TDD Workflow Established

**Date:** 2026-05-04  
**Author:** Finn (Tester)  
**Status:** Active  

### Decision

TDD workflow established for the HackathonVotingApp team. Failing tests are required before any implementation begins. Kevin Logan reviews and approves failing tests before the Green phase begins. This is a hard gate — not optional.

**The gate:** No implementation code is written until:
1. Failing tests exist (compile correctly, fail for the right reason).
2. Kevin has reviewed and explicitly approved the tests.

### Testing Stack

| Layer | Tools |
|---|---|
| .NET 10 unit/integration | xUnit + FluentAssertions + NSubstitute |
| React component/behavior | Vitest + @testing-library/react + @testing-library/user-event + MSW |

### Rationale

Kevin has mandated TDD as the team's development process. The review gate ensures tests genuinely define requirements before implementation — preventing tests from being written to confirm existing behavior rather than specify intended behavior.

### Authoritative Reference

See `.squad/skills/tdd-workflow/SKILL.md` for the full workflow, naming conventions, worked examples, and anti-patterns.

---

## Decision: Engineering Practices Encoded as Team Skills

**Date:** 2026-05-04
**Author:** Obi-Wan

### Decision

Kevin Logan has established foundational engineering norms for the HackathonVotingApp. These are encoded as reusable skill files that every agent reads before starting work.

### Skills Created

- `.squad/skills/mse-principles/SKILL.md` — Modern Software Engineering Principles (optimize for learning; optimize for managing complexity; in-practice guidance for React + .NET 10)
- `.squad/skills/vertical-slices/SKILL.md` — Vertical Slice Development (end-to-end slices as the unit of work; definition of done; how to cut a slice on this stack)
- `.squad/skills/quality-over-quantity/SKILL.md` — Quality Over Quantity (short, punchy constraints on scope and correctness)

Two additional skills are owned by teammates and referenced in charters even if not yet present:
- `.squad/skills/tdd-workflow/SKILL.md` — owned by Finn
- `.squad/skills/trunk-based-delivery/SKILL.md` — owned by Poe

### Charter Updates

All six agent charters (obi-wan, leia, han, finn, poe, padme) have been updated with a `## Skills` section listing all five skill files. Charters are additive — no existing content was replaced.

### TDD Gate

Kevin reviews failing tests before implementation proceeds on any slice. This is a hard gate, not a suggestion. The failing tests must be written, committed, and reviewed by Kevin before any agent begins implementation work on that slice.

### Rationale

Encoding these as skill files (rather than embedding in individual charters or decisions.md) makes them easy to update independently, easy to reference consistently, and cheap to extend. Any agent spawned in the future can read these files and immediately understand the team's engineering norms.

---

## Decision: Trunk Based Delivery & Continuous Delivery Adoption

**Date:** 2026-05-04  
**Author:** Poe (DevOps/Azure)  
**Requested by:** Kevin Logan

### Decision

Trunk Based Delivery adopted. All work on short-lived branches off main, merged via PR with CI gate. CD pipeline: build → test → lint → deploy to staging → Kevin approves production. Azure Static Web Apps for React, App Service staging slots for .NET 10 API.

### Details

- One trunk: `main`. Branch lifetime hours to 1 day maximum.
- Branch naming: `{agent-or-author}/{issue-or-slug}`
- CI gate required on all PRs — no merging broken builds
- Feature flags preferred over long-lived branches when work exceeds one day
- Commit format: Conventional Commits with issue reference

### Pipeline Stages

1. Build (`dotnet build` + `npm run build`)
2. Test (`dotnet test` + `npm test`)
3. Lint/Static Analysis
4. Integration Tests (if applicable)
5. Deploy to Staging — automatic on main merge
6. Deploy to Production — manual Kevin approval

### Azure Deployment Targets

- React → Azure Static Web Apps (free tier, built-in GitHub Actions)
- .NET 10 API → Azure App Service with staging/production deployment slots
- Secrets → Azure Key Vault via managed identity
- IaC → Bicep in `/infra/`
- Pipeline → `.github/workflows/ci-cd.yml`

---

## Decision: Slice 1 Work Tracking via GitHub Project

**Date:** 2026-05-04  
**Owner:** Obi-Wan (Tech Lead)  
**Status:** Implemented ✓

### Context

Slice 1 work items need to be tracked and visible to the team. GitHub Projects provides a natural, centralized workspace for planning and monitoring progress.

### Decision

Use **GitHub Project (ProjectsV2)** as the single source of truth for Slice 1 work.

- **Project Name:** `HackathonVotingApp — Slice 1`
- **Location:** https://github.com/aligneddev/HackathonVotingApp/projects
- **Issues Tracked:** #1, #2, #5, #6, #7, #8 (all tagged `slice-1`)

### Issues Created

| Issue | Title | Assignee | Labels | Status |
|-------|-------|----------|--------|--------|
| #1 | [Slice 1] Write failing tests — health endpoint + home page | Finn | `squad:finn`, `squad`, `slice-1` | **Todo** |
| #2 | [Slice 1] GATE: Kevin reviews and approves failing tests | Kevin | `tdd-gate`, `squad`, `slice-1` | **Review/Gate** |
| #5 | [Slice 1] Scaffold Bicep infra stubs + GitHub Actions CI | Poe | `squad:poe`, `infra`, `squad`, `slice-1` | **Todo** |
| #6 | [Slice 1] Scaffold .NET 10 minimal API + implement health endpoint | Han | `squad:han`, `squad`, `slice-1` | **Todo** (blocked on #2) |
| #7 | [Slice 1] Scaffold React/Vite frontend + engineering-themed home page | Leia | `squad:leia`, `squad`, `slice-1` | **Todo** (blocked on #2) |
| #8 | [Slice 1] Update README with local dev setup instructions | Padme | `squad:padme`, `squad`, `slice-1` | **Todo** (blocked on #6, #7) |

### Dependencies Enforced

- **#2 is a hard gate:** No implementation (#6, #7) begins until Kevin explicitly approves the failing tests in #1.
- **#8 depends on completion of #6 and #7:** README must reflect the actual project structure.

### Columns (Status Field)

The GitHub Project uses these status columns:

- **Todo** — Issue not yet started
- **In Progress** — Team member actively working on it
- **Review/Gate** — Awaiting review or gate approval (e.g., #2 awaiting Kevin)
- **Done** — Issue completed and merged

### Rationale

1. **Native GitHub Integration:** No external tools needed. Issues, PRs, and project board live in one place.
2. **Clear Sequencing:** Dependencies and gates are visible. Team sees what's blocked and why.
3. **Lightweight Tracking:** Minimal overhead; team focuses on code, not process.
4. **Aligned with Slice Definition:** Each slice = 1 project board. Easy to archive and move on to Slice 2, Slice 3, etc.

### Implementation Notes

- All 6 issues labeled with `slice-1` and `squad` for easy filtering.
- Each issue includes acceptance criteria, dependencies, and assigned owner.
- TDD gate enforced: tests written first (#1), then reviewed (#2), then implementation (#6, #7).
- Project board manual creation required due to gh CLI auth scope limitations (requires `project` and `read:project` scopes).

### Next Steps

1. Manually create the GitHub Project in the web UI and add all 6 issues.
2. Team begins work on issues in dependency order: start #1, then wait for #2 gate, then #5, #6, #7 in parallel, then #8.
3. Update issue status as work progresses.
4. Slice 1 done when all 6 issues are closed.

---

## Decision: Slice 1 Implementation Complete

**Date:** 2026-05-04  
**Status:** Done

### Implementation Summary

Slice 1 development complete. All five team members delivered working, tested code across the vertical slice:

#### Finn (Tester) — PR #10
- Failing tests written for health endpoint + home page components
- Tests follow TDD discipline; Kevin reviewed and approved before implementation

#### Han (Backend Dev) — PR #11
- GET /health endpoint implemented with .NET 10 minimal API
- 2/2 tests passing
- Program class declared partial for WebApplicationFactory compatibility

#### Leia (Frontend Dev) — PR #12
- Engineering-themed home page implemented in React + Tailwind v4
- Gear SVG motif, gradient heading, framer-motion animations
- 3/3 component tests passing
- Tailwind v4 CSS-only config (no tailwind.config.js)

#### Poe (DevOps) — PR #9
- Bicep infrastructure stubs created (Static Web Apps, App Service F1, SQL serverless)
- GitHub Actions CI workflow configured for .NET + React build, test, lint
- All resources on free/consumption tiers per hackathon cost constraints
- SQL auto-pause after 1h idle to minimize costs during bursty usage

#### Padme (Technical Writer) — PR #13
- README updated with local dev setup instructions
- Covers Node.js, .NET, database setup, and running both frontend + backend

### Acceptance Criteria Met

✓ All PRs created and referenced above  
✓ All tests passing (2 + 3 = 5 tests in implementation PRs)  
✓ Infrastructure stubs in place and CI workflow running  
✓ Documentation updated  
✓ No test approvals blocked; all gates cleared  

### Next Steps

- Merge PRs to main in dependency order
- Team ready for Slice 2 planning

---

## 2026-05-05

### 2026-05-05T11:03: Slice 3 — Voting TDD Test Contracts

**By:** Finn (Tester)  
**Status:** Red phase complete — awaiting Kevin approval before implementation begins

**Purpose:** This document records the test contracts written for Slice 3: Voting (cast vote, cookie dedup, validation). Each test defines the expected behavior Han (backend) and Leia (frontend) must implement to make it green.

**Backend — Integration Tests (`VotingEndpointTests.cs`):**
- Expected routes: `POST /votes/{presentationId}` and `GET /votes/{presentationId}/count`
- 6 integration tests covering 201 Created, 404 Not Found, 409 Conflict, vote count response shape

**Backend — Unit Tests (`VotingServiceTests.cs`):**
- 6 unit tests on VotingService: CastVoteAsync (return true/false), GetVoteCountAsync (return count)
- Dedup contract: CastVoteAsync returns false if Vote for same PresentationId already exists (DB-level)
- Cookie dedup is HTTP layer's responsibility, not service

**Frontend — Component Tests (`VotingButton.test.tsx`):**
- 4 component tests: render enabled/disabled button, click calls castVote, state updates after vote
- localStorage key pattern: `voted-{presentationId}`
- Mocking pattern: `vi.mock('../api/votingApi', ...)`

**Frontend — API Tests (`votingApi.test.ts`):**
- 2 API module tests: castVote POST, getVoteCount GET with fetch mocking
- votingApi shape: `{ castVote: async (id: string): Promise<void>, getVoteCount: async (id: string): Promise<number> }`

**Implementation Guidance:** Detailed patterns provided for Han (route group, cookie logic, service) and Leia (api module, component with useState lazy initializer).

---

### 2026-05-05: Han — Slice 3 Voting Backend Decision

**By:** Han (Backend Dev)  
**Status:** Implemented — all 34 tests passing

**Decision:** Cookie Dedup at HTTP Layer + Service-Level Integrity Guard

**Context:** CastVoteAsync needs duplicate-vote prevention. Two layers implemented:
- **HTTP Layer:** Route handler reads request cookie `hackathon-voted-{presentationId}`. If present, return 409 Conflict immediately.
- **Service Layer:** VotingService.CastVoteAsync checks `db.Votes.AnyAsync(v => v.PresentationId == presentationId)`. If exists, return false; else persist Vote, SaveChanges, return true.

**Rationale:**
- Cookie check: Primary user-facing dedup for same browser, HTTP-specific concern
- DB check: Safety net, independently testable, service-layer integrity
- Separation of concerns: Service knows domain (Votes table), route handler bridges HTTP context

**Route Handler Pattern:**
```csharp
votes.MapPost("/{presentationId:guid}", async (Guid presentationId, IVotingService votingService, HttpContext httpContext) =>
{
    var cookieKey = $"hackathon-voted-{presentationId}";
    if (httpContext.Request.Cookies.ContainsKey(cookieKey))
        return Results.Conflict();
    var success = await votingService.CastVoteAsync(presentationId);
    if (!success) return Results.NotFound();
    httpContext.Response.Cookies.Append(cookieKey, "true", new CookieOptions { MaxAge = TimeSpan.FromDays(365) });
    return Results.Created($"/votes/{presentationId}", null);
});
```

**Vote Count Route:** Checks presentation existence first (404 if not found), then calls GetVoteCountAsync to count votes, returns 200 `{ count }`.

---

### 2026-05-05: Leia — Slice 3 Voting Frontend Decisions

**By:** Leia (Frontend Dev)  
**Status:** Implemented — all 12 tests passing

**Decision 1: localStorage Vote Deduplication Pattern**

Client-side guard: After successful vote, write `voted-${presentationId}` → `'true'` to localStorage. On component mount, check that key via lazy `useState` initializer to set initial disabled state.

**Why lazy initializer:** Synchronous localStorage read during first render avoids useEffect + second render, preventing flash of enabled state.

**Pattern:**
```tsx
const storageKey = `voted-${presentationId}`;
const [voted, setVoted] = useState(() => !!localStorage.getItem(storageKey));

const handleVote = async () => {
  await votingApi.castVote(presentationId);
  localStorage.setItem(storageKey, 'true');
  setVoted(true);
};
```

**Scope:** Client-side dedup only. Server-side dedup (by session/IP) is future work.

**Decision 2: VotingButton Component Contract**

Props: `{ presentationId: string }`

Button text and styling:
- Not voted: `"Vote"` — enabled, indigo background (`bg-indigo-600 hover:bg-indigo-500`)
- Already voted: `"Voted!"` — disabled, gray background (`bg-gray-600`)

Error handling: Silently swallowed for now; future slice should add error state/toast.

**Decision 3: votingApi Module Contract**

Module: `src/frontend/src/api/votingApi.ts`

```typescript
export const votingApi = {
  castVote: async (presentationId: string): Promise<void>
  getVoteCount: async (presentationId: string): Promise<number>
}
```

Routes:
- `POST /votes/{presentationId}` — cast vote
- `GET /votes/{presentationId}/count` — returns `{ count: number }`

Error handling: Both throw on `!res.ok`. Test mock pattern: `vi.mock('../api/votingApi', ...)` as single seam.
