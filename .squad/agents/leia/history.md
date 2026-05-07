# Leia — History

## Context

Joined the HackathonVotingApp team on 2026-05-04.

**Project:** HackathonVotingApp — a hackathon voting application.
**Stack:** React (frontend), .NET 10 (backend), Azure (cost-optimized hosting).
**Owner:** Kevin Logan.

## Work Completed

### Slice 1 — Home Page Implementation (Issue #7)
**Date:** 2026-05-04 | **Branch:** `leia/7-slice1-frontend` | **PR:** #12

Implemented engineering-themed home page in React + Vite:
- Design: gear SVG motif, gradient heading, disabled CTA button
- Animations: framer-motion entrance effects (professional feel)
- Styling: Tailwind v4 CSS-only config (no tailwind.config.js)
- 3/3 tests passing (Vitest + @testing-library/react + @testing-library/user-event)
- Follows TDD discipline: tests written and approved by Kevin before implementation

**Files:** `src/frontend/src/pages/HomePage.tsx` | `src/frontend/src/pages/__tests__/HomePage.test.tsx` | `src/frontend/src/index.css`

See `.squad/orchestration-log/2026-05-04T18-29-24Z-leia.md` for full details.

## Learnings

### 2026-05-07 — Ranked Voting UI (RankedVotingList + VotingPage redesign)

- **New component:** `src/frontend/src/components/RankedVotingList.tsx`
  - Controlled component — parent (VotingPage) owns `RankedVotingListItem[]` state, passes `items` + `onChange` callback
  - Native HTML5 drag-and-drop: `draggable`, `onDragStart`/`onDragOver`/`onDrop`/`onDragEnd` — no external library
  - Drag visual feedback: dragging row → `opacity-40`; drop target → `ring-1 ring-indigo-500 border-indigo-500`
  - Arrow buttons (↑/↓) as accessible alternative; disabled at boundaries
  - Notes textarea: `maxLength={500}`, `resize-y`, `aria-label` per item for accessibility
  - Rank badge: `bg-indigo-700` rounded pill showing `index + 1`

- **Updated VotingPage:** `src/frontend/src/pages/VotingPage.tsx`
  - Removed VotingButton usage; VotingButton.tsx untouched (used elsewhere)
  - Session dedup: `voted-session-{sorted-ids}` localStorage key — checked on mount
  - Submit loop: sequential `castVote(id, ranking, notes)` per item (ranking = index+1)
  - 409 Conflict → sets submitted true + shows "already voted" error message

- **Updated votingApi:** `src/frontend/src/api/votingApi.ts`
  - `castVote(presentationId, ranking?, notes?)` — `ranking` optional to preserve VotingButton backwards compat
  - Sends JSON body with `Content-Type: application/json`; omits undefined fields

- **Backwards compat:** making `ranking` optional in TS avoids TypeScript errors in VotingButton (which calls `castVote(id)` only)
- **Tests:** All 28 pass — no regressions ✅

### 2026-05-07 — ResultsPage (Finn's 10 tests → all 28 passing)

- **File:** `src/frontend/src/pages/ResultsPage.tsx`
- **Route added:** `/results` → `<ResultsPage />` in `App.tsx`
- **Tests:** All 28 pass — 18 existing + 10 new ResultsPage tests ✅
- **Pattern:** Mirrors VotingPage/LeaderboardPage — `useEffect` + `useState`, `leaderboardApi.getLeaderboard()`, loading state via `null` sentinel.
- **Prize label logic:** A `PRIZES` array of 3 objects (`{ medal, label }`) indexed by position. `PRIZES[index]` returns `undefined` for entries 4+, so no prize badge renders — clean and index-safe.
- **Loading text:** "Loading results…" — matches `/loading/i` regex used in Finn's test.
- **Medal + label in one `<span>`:** `{prize.medal} {prize.label}` renders as `"🥇 1st Place"`, satisfying both `getByText(/🥇/)` and `getByText(/1st place/i)` in a single DOM node.
- **Styling:** Tailwind v4, dark engineering theme, consistent with VotingPage.

### 2026-05-06 — Slice 3 Voting Page Wired (VotingPage + /vote route)

- **Branch:** main (applied directly)
- **Tests:** All 18 pass — 3 HomePage ✅, 3 AdminPage ✅, 4 LeaderboardPage ✅, 4 VotingButton ✅, 2 leaderboardApi ✅, 2 votingApi ✅
- **VotingPage.tsx location:** `src/frontend/src/pages/VotingPage.tsx`
- **Route added:** `/vote` → `<VotingPage />` in `App.tsx`
- **HomePage change:** Replaced disabled `<motion.button>` + "Voting opens when..." paragraph with `<motion.div>` wrapping `<Link to="/vote">` — voting is now open.
- **Test update required:** `HomePage.test.tsx` needed `MemoryRouter` wrapper (Link requires router context) and `is_mobile_first_layout` updated from `getByRole('button', disabled)` to `getByRole('link', { href: '/vote' })`.
- **VotingPage pattern:** Mirrors `AdminPage` pattern — `useEffect` + `useState`, `presentationApi.getPresentations()`, loading/empty states, dark engineering theme.
- **Component reuse:** `<VotingButton presentationId={p.id} />` handles all dedup/localStorage logic — VotingPage is purely layout + fetch.


### Slice 5 — ResultsPage Implementation (2026-05-07)

**Date:** 2026-05-07 | **Branch:** (merged directly) | **Status:** ✅ Complete

Implemented `ResultsPage.tsx` per Finn's updated test spec (all 28 frontend tests passing).

- **Component:** `src/frontend/src/pages/ResultsPage.tsx`
  - Fetches via `leaderboardApi.getLeaderboard()` on mount (no polling)
  - Loading state: `entries: LeaderboardEntry[] | null` (null = loading, [] = empty)
  - Shows loading indicator with "loading" text
  - Renders page heading matching `/results/i`
  - Displays ALL entries (not filtered to top 3)
  - Prize labels (🥇/🥈/🥉 + text) for top 3 only via PRIZES array
  - Entries 4+ rendered without medals

- **Route wiring:** `src/frontend/src/App.tsx` — added `<Route path="/results" element={<ResultsPage />} />`

- **Design pattern:** PRIZES array (`{ medal, label }[]`) indexed by position — returns undefined for index ≥ 3, zero branching
  - Medal + label in single semantic `<span>`
  - Matches both Finn's `/🥇/` and `/1st place/i` queries in same node

- **Test results:** All 28 frontend tests passing (10 new ResultsPage + 18 existing)

- **Key decisions applied:**
  - Render ALL entries (spec changed from v1's "top 3 only")
  - Prize labels for top 3 only
  - No nav link yet — post-hackathon admin view

### 2026-05-04 — Slice 1 Frontend Skeleton (Issue #7)

- **Branch:** `leia/7-slice1-frontend`
- **PR:** https://github.com/aligneddev/HackathonVotingApp/pull/12 (draft)
- **Tests:** All 3 pass — renders_welcome_heading ✅, renders_engineering_theme_elements ✅, is_mobile_first_layout ✅
- **Tailwind v4:** Uses CSS-only config via `@import "tailwindcss"` in `src/index.css` — NO `tailwind.config.js`. Plugin is `@tailwindcss/vite` in `vite.config.ts`.
- **framer-motion:** Used for entrance animations on heading, subtext, and CTA button.
- **Workflow:** Merged Finn's `finn/1-slice1-failing-tests` branch to get the frontend scaffold, then implemented the component.
- **Gotcha:** When checking out a new branch at the same commit as another branch, git may silently track the wrong one. Always verify with `git branch --show-current` before committing.

### 2026-05-04 — Slice 2 Admin Page (Issue #17)

- **Branch:** `leia/17-slice2-admin-ui`
- **PR:** https://github.com/aligneddev/HackathonVotingApp/pull/22
- **Tests:** All 6 pass — 3 AdminPage + 3 HomePage
  - renders_presentations_heading ✅
  - renders_add_presentation_button ✅
  - renders_presentation_list_after_fetch ✅
- **AdminPage.tsx location:** `src/frontend/src/pages/AdminPage.tsx`
- **fetch() pattern:** Component uses `fetch()` directly — no axios. Tests mock `global.fetch` with `vi.fn()`. Do NOT use any other HTTP lib.
- **Tailwind v4 dark theme classes:** `bg-gray-950`, `bg-gray-900`, `text-indigo-400`, `border-gray-700`, `rounded-xl` — standard dark engineering palette.
- **Route pattern:** No React Router installed — App.tsx uses `window.location.pathname` for simple conditional routing. `/admin` → `<AdminPage />`, default → `<HomePage />`.
- **Gotcha (repeated):** git may commit to the wrong branch if another branch exists at the same commit. Always verify `git branch --show-current` before committing.

**Decisions Made:**
1. **native fetch() pattern** — Component uses `fetch()` directly (no axios). Tests mock `global.fetch` with `vi.fn()`. This keeps tests simple and avoids adding extra HTTP library dependencies.
2. **useEffect + useState** — Component handles data fetching with React hooks (no React Query or SWR). Sufficient for Slice 2 scope; can revisit in future slices with complex caching.
3. **No authentication** — `/admin` route accessible without auth. Pathname-based routing (no React Router). Auth will be added in a future slice before production.

### 2026-05-05: Architecture Conventions Established

Kevin approved standing conventions for all frontend work:

- **Never call fetch() in a component.** All HTTP communication lives in `src/api/{domain}Api.ts`. Components import typed functions. This makes mocking in tests trivial and keeps components focused on UI concerns.
- **Api module structure:** Each domain gets its own file (`presentationApi.ts`, `votingApi.ts`). The module exports: typed interfaces + an api object with async methods. Methods throw on HTTP errors (no silent failures).
- **React Router is the routing authority.** All navigation uses `<Route>` in `App.tsx`. No `window.location`, no `href` programmatic navigation without `useNavigate`. New pages = new `<Route>`.
- **Frontend types mirror backend DTOs.** The `Presentation` interface in `presentationApi.ts` should match `PresentationResponse` from the backend. When the backend DTO changes, update the frontend interface. Shared contract = no surprises.
- **Ubiquitous language on the frontend too.** Variable names, component props, state names — use the domain word. `presentations`, not `items`. `presenterName`, not `name`.



**Date:** 2026-05-07

- Created new RankedVotingList component (controlled component pattern)
  - Owned state: RankedVotingListItem[] (id, ranking, notes) lifted to VotingPage
  - Native HTML5 drag-drop: draggable + onDragStart/onDragOver/onDrop/onDragEnd
  - Arrow buttons (up/down) for keyboard-accessible ranking adjustment
  - Notes textarea per presentation (optional feedback)
- Updated VotingPage to replace simple vote button list with RankedVotingList
  - Changed from immediate vote on button click → ranked list + Submit button
  - Submission: sequential castVote calls (not parallel) to respect cookie dedup
  - Session dedup: oted-session-{sorted IDs} localStorage key (no server round-trip)
- Updated otingApi.castVote signature: castVote(presentationId, ranking?, notes?)
  - Made anking optional for backward compat (VotingButton may call without it)
- All 28 frontend tests passing
- 0 TypeScript errors
- Decision documented: .squad/decisions.md (2026-05-07 section)
- Orchestration log: .squad/orchestration-log/2026-05-07T15-10-44-807-05-00-leia.md

**Status:** Complete — RankedVotingList fully integrated with Han's backend API
