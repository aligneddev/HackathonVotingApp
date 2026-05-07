# HackathonVotingApp — Domain Context

## Glossary

### Presentation
A hackathon entry submitted by a presenter. Has a title, presenter name, and description. Managed by admins before the event. The unit that attendees vote on.

### Vote
A single attendee's choice for a Presentation. One vote per device (enforced via cookie). Cast during the voting phase.

### Leaderboard
A **live, operational** view showing all Presentations ranked by vote count. Visible to attendees during the event. Route: `/leaderboard`.

### Results
A **post-event, celebratory** view showing ALL Presentations ranked by vote count. Lives in the admin section. Intended to be displayed after voting closes. Route: `/admin/results`. Data source: reuses `GET /leaderboard`, no client-side slice. No new API endpoint. Top 3 entries receive prize labels (🥇 1st Place, 🥈 2nd Place, 🥉 3rd Place); remaining entries show rank position ordered by votes, no prize label. Static snapshot — loads once, no auto-refresh.

### Admin Section
The operator-facing area of the app. Currently at `/admin`. Will be password-protected in a future slice. Contains: Presentation CRUD, and Results display. Nav bar links to both sections ("Presentations" and "Results").

### Prize
A recognition awarded to the top 3 Presentations by vote count. Fixed tiers displayed as: 🥇 1st Place, 🥈 2nd Place, 🥉 3rd Place.
