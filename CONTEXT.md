# HackathonVotingApp — Domain Context

## Glossary

### Presentation
A hackathon entry submitted by a presenter. Has a title, presenter name, and description. Managed by admins before the event. The unit that attendees vote on.

Presentation lifecycle rule:
- Admin presentation create/edit/delete actions are allowed only in pre-voting state
- During active voting, the presentation list is locked

### Ballot
A single Attendee's immutable ranking submission for the active Voting Session. A Ballot is atomic and complete for the event: it must include one ranked entry per required rank for the current presentation count. Ballots are anonymous-auth (no SSO) and require a self-declared Voter Alias Token. Each Attendee can submit at most one Ballot per Voting Session.

Ballot submission model:
- Ballot submission is the only attendee voting action
- Per-presentation standalone voting is not part of the domain model

### Ballot Entry (formerly Vote)
One ranked Presentation within a Ballot, including rank position and optional attendee notes. Ballot Entries carry weighted points used for winner determination. Notes are immutable after ballot submission and are admin-only (not visible to public attendees).

Admin note visibility policy:
- Every admin can view all attendee notes by default

Data export policy:
- Admin export of ballot data (including real name, token, and notes) is not allowed
- Sensitive ballot identity and note data remains in-app only

Post-close data integrity policy:
- Ballots in closed sessions are non-deletable by admins
- During active voting, admins may delete submitted ballots only for abuse/error recovery
- Active-session ballot deletion uses soft-delete tombstones (not hard delete)
- Soft-deleted ballots are excluded from all leaderboard and winner aggregates (including TotalPoints, FirstPlaceCount, SecondPlaceCount, and BallotCount)
- Soft-delete tombstones are metadata-only (ballot contents redacted)
- Original attendee notes are redacted on deletion; tombstones retain only admin-provided free-text deletion reason
- Free-text deletion reason must be 10 to 300 characters
- Tombstone metadata must include deletion reason and deleter identity
- Tombstone metadata includes exact deletion timestamp in UTC
- Tombstone metadata is immutable once created
- Active-session ballot deletion is authorized for any single admin (no two-person approval)
- Deletion effects are applied immediately: leaderboard and winner aggregates recalculate synchronously after delete
- When a ballot is deleted during active voting, the associated Voter Alias Token becomes eligible to submit a new ballot in that session

### Attendee
An eligible participant in the hackathon event who submits a ballot using a self-declared Voter Alias Token.

### Voter Alias Token
A session-scoped unique identifier used for ballot eligibility and deduplication. For simplicity, tokens are self-claimed by attendees during voting (not pre-issued at check-in). Ballot uniqueness is enforced by Voter Alias Token (not by name string) within a Voting Session. Real name is retained for admin audit but is not used as the primary uniqueness key. Before first successful ballot submission, attendees may edit a token entry. After an accepted ballot, token identity is immutable for that session except when the associated ballot is admin-deleted during active voting, in which case the same token becomes immediately reusable.

Token format policy:
- Length: 3 to 32 characters
- Character set: letters, digits, and spaces
- Composition: no required digit
- Comparison: case-insensitive on the server after normalization
- Weak patterns rejected (for example: 12345678, AAAAAAAA, "   ")

Operational simplicity policy:
- No brute-force rate limiting or lockout is applied to token entry during voting
- System behavior prioritizes low-friction event flow over active token-attempt throttling

Validation error exposure policy:
- Attendee-facing token validation errors are generic (for example: unable to submit ballot)
- Specific failure reasons (unknown token, used token, malformed token) are restricted to admin/audit visibility

Retention policy:
- Aggregate scoring data is retained permanently
- Personal identity mapping (real name and Voter Alias Token linkage) is also retained permanently

Access policy:
- All admins have full access to personal identity mapping (real name and Voter Alias Token linkage)

Audit policy:
- No immutable audit log is maintained for ballot actions, identity access, or session lifecycle actions

Dispute adjudication policy:
- For post-close disputes, the authoritative source is the database final state snapshot at session close time
- In absence of audit trails, disputes beyond that snapshot may be non-resolvable

### Voting Session
The event-scoped voting window controlled by admins. Ballot uniqueness is enforced per Voter Alias Token within the active Voting Session. Live standings are provisional while the session is open and become final when the session closes. On close, accepted ballots are frozen, ballots remain immutable, winners are final, and the session close is irreversible.

Global rule configuration policy:
- Scoring map is fixed globally across events: 1st=8, 2nd=5, 3rd=3, 4th=2, 5th=1
- Tie-break chain is fixed globally across events: FirstPlaceCount, SecondPlaceCount, BallotCount, PresentationId ascending
- These rules are not configurable per session
- These rules are permanently immutable for this one-time-use application

Voting start precondition:
- Admin can start voting only when at least 3 Presentations exist
- Voting begins only when an admin explicitly clicks Start Voting; reaching the threshold alone does not auto-start a session
- Start Voting requires a confirmation step showing locked settings summary (presentation count, scoring map, tie-break chain, irreversible close)

### Leaderboard
A **live, operational** view showing all Presentations ranked by weighted TotalPoints. Visible to attendees during the event. Primary ordering is TotalPoints with deterministic tie-breaks; ballot count is a secondary display metric. Canonical tie-break chain is: (1) FirstPlaceCount, (2) SecondPlaceCount, (3) BallotCount, (4) PresentationId ascending. Route: `/leaderboard`.

### Results
A **post-event, celebratory** view showing ALL Presentations ranked by final weighted TotalPoints. Lives in the admin section. Intended to be displayed after voting closes. Route: `/admin/results`. Data source: reuses `GET /leaderboard`, no client-side slice. No new API endpoint. Top 3 entries receive prize labels (🥇 1st Place, 🥈 2nd Place, 🥉 3rd Place); remaining entries show rank position ordered by final standing, no prize label. Static snapshot — loads once, no auto-refresh.

### Admin Section
The operator-facing area of the app. Currently at `/admin`. Will be password-protected in a future slice. Contains: Presentation CRUD, and Results display. Nav bar links to both sections ("Presentations" and "Results").

### Prize
A recognition awarded to the top 3 Presentations by final weighted TotalPoints after tie-break resolution. Fixed tiers displayed as: 🥇 1st Place, 🥈 2nd Place, 🥉 3rd Place.
