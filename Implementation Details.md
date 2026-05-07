# Implementation Details

Using Squad
* https://github.com/bradygaster/squad


the squad is from the universe of StarWars.
I'm creating a react app with a  .Net 10 backend. We will host in Azure with the least cost possible. I'll need a technical
writer for documenation. Create the team

5/4 started with 4.2% usages
   │ Name        │ Role                                           │
├────┼─────────────┼────────────────────────────────────────────────┤
│ 🏗️ │ Obi-Wan     │ Lead — architecture, decisions, code review    │
├────┼─────────────┼────────────────────────────────────────────────┤
│ ⚛️ │ Leia        │ Frontend Dev — React, UI, components           │
├────┼─────────────┼────────────────────────────────────────────────┤
│ 🔧 │ Han         │ Backend Dev — .NET 10 APIs, EF Core            │
├────┼─────────────┼────────────────────────────────────────────────┤
│ 🧪 │ Finn        │ Tester — unit/integration tests, QA            │
├────┼─────────────┼────────────────────────────────────────────────┤
│ ⚙️ │ Poe         │ DevOps/Azure — infra, CI/CD, cost optimization │
├────┼─────────────┼────────────────────────────────────────────────┤
│ 📝 │ Padme       │ Technical Writer — docs, API refs, README      │
├────┼─────────────┼────────────────────────────────────────────────┤
│ 📋 │ Scribe      │ Session logger (silent)                        │
├────┼─────────────┼────────────────────────────────────────────────┤
│ 🔄 │ Ralph       │ Work monitor                            


train the team and bring in skills to use TDD with failing tests first, then I will review the tests before complete. We will
work in vertical slices, we want quality over quantiy. Use the best engineering practices for Modern Software Engineering
* Optimize for Learning
	- Work iteratively
	- Prioritize feedback
	- Embrace incrementalism
	- Be Experimental
	- Practice Empiricism (ground decisions on feedback and evidence)
* Optimize for Managing Complexity
	- Design for Modularity
	- Maintain High Cohesion
	- Separate Concerns
	- Hide Information and Use Abstraction
  - Manage Coupling Effectively
* Trunk Based Delivery
* Continuous Delivery


## Implementation
We are building mobile first web app, data stored in an Azure Database. Create the plan to create the skeleton projects and the home page with a 
fancy visual welcoming them to the hackathon voting. Our theme is engineering  


5/5 I ran /improve-codebase-architecture from https://github.com/mattpocock/skills.

then /caveman  I don't have time to look at this, but I like your approach. Apply your suggestions in
this current branch and get us to a good starting point before continued implementation

slice 2 and 3 PRs

 Requests  11 Premium (5h 19m 3s)
 Tokens    ↑ 14.0m • ↓ 150.2k • 12.3m (cached)


### Slice 4
 Slice 4 — Red Phase Ready for Review

  Branch: finn/slice4-failing-tests

  ┌───────────────────────────────┬───────────────────────────────────────────┬────┐
  │ File                          │ Tests                                     │    │
  ├───────────────────────────────┼───────────────────────────────────────────┼────┤
  │ LeaderboardServiceTests.cs    │ GetLeaderboard_ReturnsEmpty,              │ ❌ │
  │                               │ _RankedByVotes, _LimitsToTopN,            │ 4  │
  │                               │ _IncludesVoteCount                        │    │
  ├───────────────────────────────┼───────────────────────────────────────────┼────┤
  │ LeaderboardEndpointTests.cs   │ GetLeaderboard_ReturnsOk,                 │ ❌ │
  │                               │ _ReturnsRankedList, _ReturnsEmptyArray    │ 3  │
  ├───────────────────────────────┼───────────────────────────────────────────┼────┤
  │ leaderboardApi.test.ts        │ _callsCorrectEndpoint, _returnsRankedList │ ✅ │
  │                               │                                           │ 2  │
  ├───────────────────────────────┼───────────────────────────────────────────┼────┤
  │ LeaderboardPage.test.tsx      │ renders_loading_state,                    │ ❌ │
  │                               │ renders_leaderboard_entries,              │ 4  │
  │                               │ shows_rank_numbers, shows_vote_counts     │    │
  └───────────────────────────────┴───────────────────────────────────────────┴────┘

### Slice 5
/grill-me-with-docs
inside the codespace, but the work account couldn't push to the repo, had to make a fork

### Slice 6 - to Azure
`npx skills@latest add mattpocock/skills` to global: 5/5/26 #ai-skills 
/setup-matt-popcock-skills
- scanned the repo, asked about Github issues, tags, docs/adr
 Yes — one-time manual setup before first run:

  1. Create resource group

   az login
   az group create -n omnihackathon-rg -l centralus

  2. Create app registration + OIDC federated credential

   # Create app reg
   az ad app create --display-name "hackathon-voting-cicd"
   # Note the appId output → AZURE_CLIENT_ID
   
   # Create service principal
   az ad sp create --id 95912045-bd70-4bef-96ff-61628803ac3f
   
   # Add federated credential (GitHub OIDC)
   -- worked in Gitbash, not PS
   az ad app federated-credential create \
     --id 95912045-bd70-4bef-96ff-61628803ac3f \
     --parameters '{
       "name":"github-actions",
       "issuer":"https://token.actions.githubusercontent.com",
       "subject":"repo:aligneddev/HackathonVotingApp:ref:refs/heads/main",
       "audiences":["api://AzureADTokenExchange"]
     }'

  # Assign Contributor on resource group
   az role assignment create \
     --assignee 95912045-bd70-4bef-96ff-61628803ac3f \
     --role Contributor \
     --scope /subscriptions/fa3125b0-a692-4be8-9da5-78bc27fa96b8/resourceGroups/omnihackathon-rg

error: (MissingSubscription) The request did not have a subscription or a valid tenant level resource provider.
Code: MissingSubscription
Message: The request did not have a subscription or a valid tenant level resource provider.

  3. Set 4 GitHub secrets (Settings → Secrets → Actions):

  ┌─────────────────────────┬───────────────────────────────────────────┐
  │ Secret                  │ Value                                     │
  ├─────────────────────────┼───────────────────────────────────────────┤
  │ AZURE_CLIENT_ID         │ 95912045-bd70-4bef-96ff-61628803ac3f                          │
  ├─────────────────────────┼───────────────────────────────────────────┤
  │ AZURE_TENANT_ID         │ az account show --query tenantId -o tsv   │
  ├─────────────────────────┼───────────────────────────────────────────┤
  │ AZURE_SUBSCRIPTION_ID   │ az account show --query id -o tsv         │
  ├─────────────────────────┼───────────────────────────────────────────┤
  │ SQL_ADMIN_PASSWORD      │ your choice                               │
  └─────────────────────────┴───────────────────────────────────────────┘

  4. Run workflow → infra deploys → SWA resource created

  5. Grab SWA token (5th and final secret):

   az staticwebapp secrets list \
     --name hackathon-voting-dev-swa \
     --resource-group hackathon-rg \
     --query "properties.apiKey" -o tsv

  Add as AZURE_STATIC_WEB_APPS_API_TOKEN → re-run workflow → done.




## TODO
- [ ] voting Rubric addition
- [ ] More presentation details for submission
- [ ] Omnitech presentation submission - sudo auth
- [ ] Voting - enter notes and feedback on each one, rank 1 through 5
- [ ] Secure Admin
- [ ] Admin - Start/End voting
- [ ] Admin - edit presentation details
- [ ] Admin - view votes and results, ranking (show vote counts, average ranking, order ascending by the average ranking, dialog for feedback people entered)
- [ ] Add some voting animations and fun visuals
- [ ] Deploy to Azure with the bicep files
- [ ] Integration/Acceptance Tests
- [ ] Aspirify
