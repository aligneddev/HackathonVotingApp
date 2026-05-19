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

### 2026-05-07 — CI/CD Pipeline: OIDC GitHub Actions Workflows

**Files changed:** `.github/workflows/ci.yml` (updated), `docs/deploy.md` (created)  
**Decision file:** `.squad/decisions/inbox/poe-cicd-workflows.md`

**Key decisions:**
- Replaced legacy `AZURE_CREDENTIALS` JSON blob with OIDC federated credentials (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`). `id-token: write` permission scoped to `deploy-infra` and `deploy-api` jobs only.
- Kept a single `ci.yml` (CI + CD) — trunk-based delivery makes tight coupling of build→test→deploy natural.
- Removed `detect-changes` job: its conditional-skip pattern caused `deploy-infra` to be silently skipped when either build job was skipped (not failed). Always run both build jobs — they're fast.
- API: `dotnet publish` → zip → `azure/webapps-deploy@v3` zip deploy (correct for F1, no deployment slots).
- Frontend: SWA action builds from source (`app_location: src/frontend`, `output_location: dist`); `build-and-test-frontend` acts as quality gate before deploy runs.
- `AZURE_STATIC_WEB_APPS_API_TOKEN` is a chicken-and-egg secret: must be fetched after first manual `az deployment group create`. Documented in `docs/deploy.md`.
- Resource group hardcoded as `hackathon-rg`; `AZURE_ENVIRONMENT: dev`.

### 2026-05-04 — Slice 1: Bicep Infra Skeleton + GitHub Actions CI

**Branch:** `poe/3-slice1-infra-skeleton`
**PR:** https://github.com/aligneddev/HackathonVotingApp/pull/9 (draft, Closes #3)

**Files created:**
- `infra/main.bicep` — orchestrates all three modules
- `infra/sql.bicep` — Azure SQL serverless (GP_S_Gen5_1), auto-pause after 60 min idle
- `infra/appservice.bicep` — App Service Plan F1 free tier + Web App (.NET 10)
- `infra/staticwebapp.bicep` — Static Web Apps free tier (src/frontend → dist)
- `.github/workflows/ci.yml` — CI pipeline: .NET 10 build+test + React Node 22 build+test

**Cost decisions:**
- Static Web Apps: Free tier — zero cost for React hosting, built-in GitHub Actions deployment
- App Service: F1 Free tier — 60 CPU min/day, sufficient for dev/demo; upgrade to B1 when load warrants
- SQL Database: Serverless (GP_S_Gen5_1) with `autoPauseDelay: 60` — free tier eligible, auto-pauses after 1h idle, critical for bursty hackathon event usage
- No Key Vault in Slice 1 — deferred to Slice 3 when real secrets are needed
