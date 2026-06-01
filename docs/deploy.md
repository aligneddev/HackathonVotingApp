# Deployment Guide

This document covers Azure setup, GitHub secrets, and the dev/prod deployment flow for HackathonVotingApp.

## Architecture Overview

| Component | Azure Service | Tier |
|---|---|---|
| React frontend | Azure Static Web Apps | Free |
| .NET 10 API | Azure App Service (Linux) | F1 Free |
| Database | Azure SQL Serverless (GP_S_Gen5_1) | ~$0 when idle |

Infrastructure is defined in Bicep and deployed through [.github/workflows/ci.yml](../.github/workflows/ci.yml).

## Environment Model

- Resource group: single shared resource group (`kl-hackathon-rg`)
- Dev resource naming: `kl-hackathon-voting-dev-*`
- Prod resource naming: `kl-hackathon-voting-prod-*`
- `main` push behavior: automatically deploys dev only
- Prod deployment: manual workflow dispatch with explicit confirmation input (`confirm_production=true`)

## Required GitHub Secrets

Set these in repository Actions secrets.

### Common OIDC secrets

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

### Dev deployment secrets

- `SQL_ADMIN_PASSWORD`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Prod deployment secrets

- `SQL_ADMIN_PASSWORD_PROD`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD`

### GitHub Variables (non-sensitive config)

- `PRESENTATION_DURATION_MINUTES` — how long each presentation runs in minutes (default: `10` if not set). Controls the countdown timer shown to voters on the voting page.

  Set this as a **repository variable** (not a secret):

  ```bash
  gh variable set PRESENTATION_DURATION_MINUTES --body "10"
  ```

  To set per environment instead:

  ```bash
  gh variable set PRESENTATION_DURATION_MINUTES --body "5" --env dev
  gh variable set PRESENTATION_DURATION_MINUTES --body "10" --env prod
  ```

## One-Time Azure Setup

Run these once before deployments.

### 1. Create the resource group

```bash
az group create --name kl-hackathon-rg --location centralus
```

### 2. Create the app registration + service principal

```bash
az ad app create --display-name "kl-hackathon-voting-gh-actions"
APP_ID=$(az ad app list --display-name "kl-hackathon-voting-gh-actions" --query "[0].appId" -o tsv)
SP_OBJECT_ID=$(az ad sp create --id "$APP_ID" --query id -o tsv)
```

### 3. Assign Contributor on the resource group

```bash
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
az role assignment create \
  --assignee "$SP_OBJECT_ID" \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/kl-hackathon-rg"
```

### 4. Add OIDC federated credential

Create one credential for repository workflow runs:

```bash
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters '{
    "name": "github-actions-workflows",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:aligneddev/HackathonVotingApp:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"],
    "description": "GitHub Actions OIDC for repository deployments"
  }'
```

If you fork this repository, replace `aligneddev/HackathonVotingApp` with your own `owner/repo`.

### 5. Add GitHub secrets

```bash
TENANT_ID=$(az account show --query tenantId -o tsv)

gh secret set AZURE_CLIENT_ID --body "$APP_ID"
gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
```

Set deployment secrets:

```bash
gh secret set SQL_ADMIN_PASSWORD --body "<dev-sql-password>"
gh secret set SQL_ADMIN_PASSWORD_PROD --body "<prod-sql-password>"
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "<dev-swa-token>"
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_PROD --body "<prod-swa-token>"
```

## First Deploy Bootstrap

You must bootstrap each environment once to retrieve its Static Web Apps deployment token.

### Bootstrap dev infrastructure

```bash
az deployment group create \
  --resource-group kl-hackathon-rg \
  --template-file infra/main.bicep \
  --parameters \
    environmentName=dev \
    appName=kl-hackathon-voting \
    sqlAdminPassword="<dev-sql-password>"
```

Retrieve dev SWA token and save it:

```bash
DEV_SWA_TOKEN=$(az staticwebapp secrets list \
  --name "kl-hackathon-voting-dev-swa" \
  --resource-group "kl-hackathon-rg" \
  --query "properties.apiKey" -o tsv)

gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "$DEV_SWA_TOKEN"
```

### Bootstrap prod infrastructure

```bash
az deployment group create \
  --resource-group kl-hackathon-rg \
  --template-file infra/main.bicep \
  --parameters \
    environmentName=prod \
    appName=kl-hackathon-voting \
    sqlAdminPassword="<prod-sql-password>"
```

Retrieve prod SWA token and save it:

```bash
PROD_SWA_TOKEN=$(az staticwebapp secrets list \
  --name "kl-hackathon-voting-prod-swa" \
  --resource-group "kl-hackathon-rg" \
  --query "properties.apiKey" -o tsv)

gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_PROD --body "$PROD_SWA_TOKEN"
```

## Deployment Flows

### Dev flow

- Trigger: push to `main`
- Jobs:
1. Build/test API and frontend
2. Deploy infra (`environmentName=dev`)
3. Deploy API
4. Deploy frontend
5. Run smoke checks against API health and frontend URL

### Prod flow

- Trigger: manual `workflow_dispatch` with `target_environment=prod`
- Safety gate: `confirm_production` must be set to `true`
- Jobs:
1. Build/test API and frontend
2. Deploy infra (`environmentName=prod`) after explicit confirmation
3. Deploy API
4. Deploy frontend
5. Run smoke checks against API health and frontend URL

## Operational Notes

- Single resource group is intentional for now; environment isolation is by resource name.
- App Service F1 is not ideal for production reliability. Upgrade to Basic/Standard when event load increases.
- SQL serverless auto-pause (`autoPauseDelay: 60`) causes first-request cold start after idle periods.

## Local Configuration

Presentation duration is read by the API from `Presentation:DurationMinutes` (default: `10`). Override locally via:

- `appsettings.Development.json` (already set to `5` for dev)
- Shell env var before running the API:

  ```bash
  # bash/zsh
  export Presentation__DurationMinutes=5
  dotnet run --project src/HackathonVotingApp.Api

  # PowerShell
  $env:Presentation__DurationMinutes = "5"
  dotnet run --project src/HackathonVotingApp.Api
  ```

The frontend reads the duration from the API at runtime — no frontend env var needed.
