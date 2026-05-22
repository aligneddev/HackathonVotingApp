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
 
 see deploy.md
had to make several fixes, including api route, EF Migrations



## TODO
- [ ] voting Rubric addition
- [ ] More presentation details for submission
- [ ] Omnitech presentation submission - sudo auth
- [X] Voting - enter notes and feedback on each one, rank 1 through 5
- [ ] Secure Admin - sudo auth (saved hashed username and password) to access admin features
- [X] Admin - Start/End voting
- [ ] Admin - edit presentation details
- [X] Admin - view votes and results, ranking (show vote counts, average ranking, order ascending by the average ranking, dialog for feedback people entered)
- [ ] Add some voting animations and fun visuals
- [X] Deploy to Azure with the bicep files
- [ ] Integration/Acceptance Tests
- [ ] Aspirify
- [ ] Switch to Managed Identity for ressources
- [X] Tie login to a sudo user in the database or at least  - name, don't game the system
- [ ] Admin menu
- [ ] Determine a winner (after /grill-me)



## Determine a winner (after /grill-me)
    Finalized rules (2026-05-22):
    - Each voter submits one immutable ballot.
    - Ballot is atomic (single submit request), not per-presentation submission.
    - Voter ranks top 5 only when 5+ presentations exist.
    - If fewer than 5 presentations exist, voter must rank all available presentations.
    - Ballot must be complete for the current event (no partial submissions).
    - Scoring map:
      1st = 8 points
      2nd = 5 points
      3rd = 3 points
      4th = 2 points
      5th = 1 point
    - Winner is presentation with highest TotalPoints.
    - Average points is tracked for analytics and display.
    - Tie-break chain for equal TotalPoints:
      1) More 1st-place rankings
      2) More 2nd-place rankings
      3) Higher ballot count
      4) Earlier time reaching final total
      5) PresentationId ascending (stable fallback)
    - One-ballot-per-voter dual guard:
      - Server-side uniqueness on normalized voter name in active session
      - Client-side localStorage session marker for UX
    - Voter names are admin-only (not public).
    - Public standings show full ranking list with top 3 highlighted.
    - Live standings are provisional while voting is open; final winners lock when admin closes voting.
    - Start fresh for this feature (no legacy submitted ballots to migrate).

    Implementation checklist:
    - [ ] Add a ballot submission contract (`POST /api/votes/ballots`) with voter name and ranked entries.
    - [ ] Validate completeness/uniqueness/rank range based on current presentation count.
    - [ ] Add session-scoped one-ballot uniqueness by normalized voter name.
    - [ ] Refactor vote persistence to save ballot entries atomically in one transaction.
    - [ ] Replace winner computation from vote count to weighted TotalPoints.
    - [ ] Implement tie-break ordering in backend results and leaderboard queries.
    - [ ] Keep per-presentation notes on ranked entries and expose admin-only voter identity.
    - [ ] Update frontend voting page to enforce complete ballot and single atomic submit.
    - [ ] Update results/leaderboard UI to show full ranking with top 3 highlight.
    - [ ] Add backend unit/integration tests for validation, scoring, ties, and immutability.
    - [ ] Add frontend tests for ballot validation, submit flow, and results rendering.
    - [ ] Run full verification (`dotnet test`, frontend tests, formatting).


