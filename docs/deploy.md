# Deployment Guide

This document covers the one-time Azure setup, required GitHub secrets, and the first-deploy order of operations for HackathonVotingApp.

---

## Architecture Overview

| Component | Azure Service | Tier |
|---|---|---|
| React frontend | Azure Static Web Apps | Free |
| .NET 10 API | Azure App Service (Linux) | F1 Free |
| Database | Azure SQL Serverless (GP_S_Gen5_1) | ~$0 when idle |

Deployment is fully automated via `.github/workflows/ci.yml`. Every push to `main` triggers: build → test → infra (Bicep) → API deploy → frontend deploy.

---

## Required GitHub Secrets

Set these under **Settings → Secrets and variables → Actions → Secrets**.

### `AZURE_CLIENT_ID`
The client (application) ID of the Azure AD app registration used for OIDC authentication.

```bash
# After creating the app registration (see setup below):
az ad app list --display-name "hackathon-voting-gh-actions" --query "[0].appId" -o tsv
```

### `AZURE_TENANT_ID`
Your Azure Active Directory tenant ID.

```bash
az account show --query tenantId -o tsv
```

### `AZURE_SUBSCRIPTION_ID`
Your Azure subscription ID.

```bash
az account show --query id -o tsv
```

### `SQL_ADMIN_PASSWORD`
A strong password for the Azure SQL Server `sqladmin` account.

- Must be 12+ characters with uppercase, lowercase, digits, and symbols.
- Example: generate with `openssl rand -base64 18` then append `!Az1` to meet complexity rules.
- Store the password somewhere safe (e.g., your personal password manager) — you'll need it if you ever reset the SQL server.

### `AZURE_STATIC_WEB_APPS_API_TOKEN`
The deployment token for Azure Static Web Apps. Only obtainable **after** the first infra deploy (chicken-and-egg — see First Deploy section).

```bash
az staticwebapp secrets list \
  --name "hackathon-voting-dev-swa" \
  --resource-group "hackathon-rg" \
  --query "properties.apiKey" -o tsv
```

---

## One-Time Azure Setup

Run these commands once before the first deployment. Requires Azure CLI (`az login` first).

### 1. Create the Resource Group

```bash
az group create \
  --name hackathon-rg \
  --location eastus
```

### 2. Create the App Registration (Service Principal for GitHub Actions)

```bash
# Create the app registration
az ad app create --display-name "hackathon-voting-gh-actions"

# Note the appId from the output (this is your AZURE_CLIENT_ID)
APP_ID=$(az ad app list --display-name "hackathon-voting-gh-actions" --query "[0].appId" -o tsv)
echo "AZURE_CLIENT_ID: $APP_ID"

# Create the service principal
SP_OBJECT_ID=$(az ad sp create --id $APP_ID --query id -o tsv)
echo "SP Object ID: $SP_OBJECT_ID"
```

### 3. Assign the Contributor Role

Grant the service principal Contributor access on the resource group (least privilege for deployment).

```bash
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

az role assignment create \
  --assignee $SP_OBJECT_ID \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/hackathon-rg"
```

### 4. Create the Federated Credential (OIDC)

This allows GitHub Actions to authenticate with Azure without storing a client secret.

```bash
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-main-branch",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:aligneddev/HackathonVotingApp:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"],
    "description": "GitHub Actions OIDC for main branch deployments"
  }'
```

> **Note:** The `subject` must exactly match the repository and branch. If you fork this repo, update `aligneddev/HackathonVotingApp` to your `{owner}/{repo}`.

### 5. Add GitHub Secrets

Now add the three OIDC secrets to the repository:

```bash
TENANT_ID=$(az account show --query tenantId -o tsv)

# Use gh CLI or GitHub UI to set secrets:
gh secret set AZURE_CLIENT_ID --body "$APP_ID"
gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
gh secret set SQL_ADMIN_PASSWORD --body "<your-strong-password>"
```

---

## Order of Operations: First Deploy

The `AZURE_STATIC_WEB_APPS_API_TOKEN` can only be retrieved after the SWA resource is provisioned. Follow these steps:

### Step 1 — Provision Infrastructure Manually

Run the Bicep deployment before the first GitHub Actions run to get the SWA token:

```bash
az deployment group create \
  --resource-group hackathon-rg \
  --template-file infra/main.bicep \
  --parameters \
      environmentName=dev \
      appName=hackathon-voting \
      sqlAdminPassword="<your-sql-admin-password>"
```

### Step 2 — Retrieve and Register the SWA Token

```bash
SWA_TOKEN=$(az staticwebapp secrets list \
  --name "hackathon-voting-dev-swa" \
  --resource-group "hackathon-rg" \
  --query "properties.apiKey" -o tsv)

gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "$SWA_TOKEN"
```

### Step 3 — Push to `main`

With all five secrets set, push (or re-run the workflow). The full pipeline will execute:

1. `build-and-test-api` — .NET 10 restore → build → test → publish → zip
2. `build-and-test-frontend` — Node 22 → npm ci → vitest → vite build
3. `deploy-infra` — Bicep deployment (idempotent; updates CORS with correct SWA hostname)
4. `deploy-api` — zip deploy to App Service via OIDC
5. `deploy-frontend` — SWA deploy via SWA token

### Subsequent Deploys

Every push to `main` is fully automated. No manual steps required after the initial bootstrap.

---

## Notes

### CORS Chicken-and-Egg
The Bicep template sets `Cors__AllowedOrigins__0` on the App Service to the SWA hostname. On the very first deploy (if you skip the manual infra step above), the SWA resource may not exist yet, and CORS will be misconfigured. The second deploy corrects this automatically since Bicep re-evaluates the SWA hostname output each run.

### F1 Free Tier Limits
App Service F1 has 60 CPU minutes/day and no custom domain or SSL offload support. Upgrade to B1 (~$13/month) when you need production SLAs.

### SQL Auto-Pause
The SQL database is configured `autoPauseDelay: 60` (pauses after 60 minutes idle). The first request after a pause incurs a cold-start delay of ~30 seconds. This is acceptable for a hackathon event.
