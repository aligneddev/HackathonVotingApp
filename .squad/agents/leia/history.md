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

### 2026-05-05: Slice 4 Green Phase — Real-Time Leaderboard Frontend

Implemented `LeaderboardPage` component and `leaderboardApi` module.

**Branch:** `leia/slice4-leaderboard`  
**PR:** #26 — Open  
**Status:** ✅ Complete — all 6 frontend tests passing

**Files created:**
- `src/frontend/src/api/leaderboardApi.ts` — HTTP client module with `getLeaderboard(limit?)` function
- `src/frontend/src/pages/LeaderboardPage.tsx` — component with fetch-on-mount, loading/error states, ranked table display

**Implementation:**
- API module: Exports `LeaderboardEntry` interface + `leaderboardApi.getLeaderboard()` function
- Component: Fetches leaderboard on mount, displays loading state, renders ranked table with rank numbers, presentation title, presenter name, vote counts
- Styling: Dark theme (gray-950 bg, indigo-400 rank numbers, hover highlights)
- Error handling: Displays fetch errors to user; no silent failures
- Route: `/leaderboard` registered in App.tsx

**Test results:** 6/6 passing
- 2 API client tests (fetch endpoint, response parsing)
- 4 component tests (heading render, loading state, ranked list render, updates when votes change)

**Architecture notes:** All fetch logic in api module (seam). Tests mock api module, not global.fetch. Component uses api seam; integration tests verify routing. Pattern supports future SignalR integration.

**Cross-slice learning:** Frontend integrates with Han's backend leaderboard endpoint. API contract matches backend DTOs. Type safety verified through tests. Frontend prepared for real-time updates (SignalR) in future slice.

See `.squad/orchestration-log/2026-05-05T15-53-05Z-leia.md` for full green phase details.
