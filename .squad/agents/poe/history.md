# Poe — History

## Context

Joined the HackathonVotingApp team on 2026-05-04.

**Project:** HackathonVotingApp — a hackathon voting application.
**Stack:** React (frontend), .NET 10 (backend), Azure (cost-optimized hosting).
**Owner:** Kevin Logan.

## Learnings

### 2026-05-04 — Delivery Model & Pipeline Structure

Kevin mandated Trunk Based Delivery and Continuous Delivery as the team's delivery model.

- **Delivery model:** One trunk (`main`), short-lived branches (hours to 1 day max), all work merged via PR with CI gate required. Feature flags preferred over long-lived branches.
- **Commit standard:** Conventional Commits with issue reference — e.g., `feat(voting): add cast-vote endpoint (#42)`.
- **Pipeline:** build → test → lint/static analysis → integration tests → auto-deploy to staging → manual Kevin approval for production.
- **Azure deployment:** React → Azure Static Web Apps (free, built-in GitHub Actions). .NET 10 API → Azure App Service with staging/production deployment slots. Secrets via Azure Key Vault + managed identity. IaC in Bicep under `/infra/`. Pipeline at `.github/workflows/ci-cd.yml`.
- Skill files written to `.squad/skills/trunk-based-delivery/SKILL.md` and `.squad/skills/continuous-delivery/SKILL.md`.
- Decision recorded to `.squad/decisions/inbox/poe-delivery-skills.md`.

### 2026-05-04 — Team Training Completed

All engineering norms have been encoded and merged to `.squad/decisions/decisions.md`. Orchestration logs written. Team has shared understanding of TDD (with Kevin gate), MSE principles, vertical slices, quality-over-quantity, trunk-based delivery, and continuous delivery practices.

### 2026-05-04 — Slice 1 Complete

Slice 1 delivered: health endpoint + home page + infrastructure + CI/CD. Bicep IaC stubs created (Static Web Apps, App Service F1, SQL serverless). GitHub Actions CI workflow operational (build → test → lint → staging auto-deploy). All team members shipped in parallel after TDD gate approval. See `.squad/orchestration-log/2026-05-04T18-29-24Z-poe.md`.
