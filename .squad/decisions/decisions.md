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
