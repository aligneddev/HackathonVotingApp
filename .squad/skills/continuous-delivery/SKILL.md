# Continuous Delivery

## The Core Rule

- Every commit that lands on main is potentially releasable
- The pipeline is the quality gate — if it's green, it can be deployed
- Deployment should be boring, not scary

## Pipeline Stages (GitHub Actions)

1. **Build** — `dotnet build` + `npm run build` — must pass before anything else
2. **Test** — `dotnet test` + `npm test` — all tests must pass
3. **Lint/Static Analysis** — code style and quality gates
4. **Integration Tests** — API-level tests (if applicable)
5. **Deploy to Staging** — automatic on main merge (Azure Static Web Apps + App Service staging slot)
6. **Deploy to Production** — manual approval gate (Kevin approves)

## Stack-Specific Configuration (GitHub Actions + Azure)

- React → Azure Static Web Apps (GitHub Actions integration is built-in, free)
- .NET 10 API → Azure App Service (deployment slots for staging/production swap)
- Secrets → Azure Key Vault, referenced via managed identity (never hardcoded)
- IaC → Bicep, stored in `/infra/` directory at repo root
- Pipeline file → `.github/workflows/ci-cd.yml`

## Environment Strategy

- `main` → staging slot automatically
- Production promotion → manual Kevin approval via GitHub Environment protection rule
- No separate long-lived staging branch — staging IS main, just on the staging slot

## Keeping CD Fast

- Target: < 5 minute feedback loop from commit to test results
- Parallelize build and test steps where possible
- Cache dependencies (npm ci cache, NuGet cache)
- Fail fast — build errors surface before tests run

## What This Means for Every Agent

- Before opening a PR, verify your slice will pass CI locally: `dotnet test` + `npm test`
- Never open a PR with known failing tests
- Small PRs merge faster and are easier to revert if needed
