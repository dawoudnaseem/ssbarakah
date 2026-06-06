# S.S. Barakah — Handoff Log

> This file is the single source of truth for any new session. Read it first, then read the documents it points to. Everything needed to continue work is here.

---

## How to Start a New Session

Read these files in this order:

1. **This file** (`docs/handoff.md`) — full history, decisions, and current state
2. **`docs/todo.md`** — task list; find the first unchecked task
3. **`docs/SS_Barakah_Requirements.md`** — full product requirements (source of truth for behaviour)
4. **`docs/superpowers/specs/2026-06-05-ui-overhaul-design.md`** — UI overhaul spec (login page, nav bar, auth persistence, animations)
5. **Any source files relevant to the next task** (paths are called out in each task section below)

Before writing any Next.js page or component, read:
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
- Key fact: `params` is a `Promise` in Next.js 16. Use `React.use(params)` in client components or `await params` in server components.

---

## Project Overview

**S.S. Barakah** — a team productivity web app for a small friend group (Dawoud, Araf, Sufiyan, Nouho). Productivity is framed as a shared Arctic ship survival mission. Each day the ship has hit an iceberg; completing tasks = repairing the ship. If all required tasks are done by midnight, the ship survives. If anyone misses a required task, the ship sinks.

**Repo:** `https://github.com/dawoudnaseem/ssbarakah.git` (branch: `main`)

**Stack:** Next.js 16.2.7 · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL)

**Local path:** `/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah`

**Run locally:** `npm run dev` → http://localhost:3000

**Tests:** `npm test` (Jest + ts-jest) — currently 47 tests, all passing

---

## Environment Setup

`.env.local` must contain real Supabase credentials (file is git-ignored):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

To set up from scratch: create a Supabase project, run `supabase/migrations/001_create_tables.sql` then `002_seed_data.sql` in the SQL editor, paste the URL and anon key into `.env.local`.

---

## Key Decisions & Permanent Rules

These were decided in conversation and must not be reversed without explicit user instruction:

| Decision | Value | Reason |
|---|---|---|
| Teammate session storage | `localStorage` | Persists across browser restarts; changed from `sessionStorage` in Task 3b |
| Admin session storage | `sessionStorage` | Intentionally short-lived per tab |
| Admin code | Hardcoded in `src/lib/auth.ts` | Intentionally NOT in any doc for security; check the file directly |
| Auth: password comparison | Plain text (`plain_password`) for MVP | Speed; `password_hash` column exists for future upgrade |
| Ship tilt on sinking | Ship sinks in place (translateY) — does NOT crash into iceberg | Design decision; iceberg stays as static background threat |
| Real-time data on ship dashboard | Poll every 15 seconds | Supabase Realtime is free-tier-limited and adds complexity; 15s is responsive enough |
| Worker characters | Coloured circles with CSS animations | Islamic values require no faces/realistic representation |
| Ship dashboard (`/`) | Public — no auth required | Anyone can watch the team's progress |
| Push to GitHub | After every confirmed task | User instruction — always push after user confirms task is done |
| Next.js version | 16.2.7 (NOT 14 as some old docs say) | Installed version; params is a Promise |

---

## Seed Data (Passwords)

| Name | Password |
|---|---|
| Dawoud | `dawoud123` |
| Araf | `araf123` |
| Sufiyan | `sufiyan123` |
| Nouho | `nouho123` |

---

## Current File Structure

```
src/
  app/
    page.tsx                        — smart redirect: logged in → /teammate/[id], else → /login
    globals.css                     — CSS variables + wave/float/bob keyframe animations
    layout.tsx                      — root layout; includes <ConditionalNav />
    login/
      page.tsx                      — full-screen Arctic login (redesigned Task 3b)
    teammate/
      [teammateId]/
        page.tsx                    — teammate dashboard (Task 4; uses React.use(params))
    admin/
      (not yet built — Task 11)
    history/
      (not yet built — Task 13)
  components/
    ConditionalNav.tsx              — hides NavBar on /login; renders h-14 spacer elsewhere
    NavBar.tsx                      — fixed top bar; logo, nav links, avatar dropdown, hamburger
    LoginModal.tsx                  — overlay login form triggered from NavBar
    IcyErrorModal.tsx               — frosted glass error modal (red border, dismiss on click)
  lib/
    supabaseClient.ts               — singleton Supabase browser client
    auth.ts                         — loginTeammate, logoutTeammate, getCurrentTeammate, admin helpers
    dateUtils.ts                    — toDateString, todayString, yesterdayString, tomorrowString, dayOfWeek, endOfDayHasPassed
    calculations.ts                 — all pure business logic functions (see §22.1 of requirements)
    finalization.ts                 — finalizeDay (idempotent), createNextDayRecurringTasks
  types/
    database.ts                     — TypeScript interfaces for all 7 Supabase tables
  __tests__/
    dateUtils.test.ts               — 10 tests
    calculations.test.ts            — 37 tests
supabase/
  migrations/
    001_create_tables.sql
    002_seed_data.sql
docs/
  handoff.md                        — THIS FILE
  todo.md                           — task checklist
  SS_Barakah_Requirements.md        — full PRD (source of truth)
  superpowers/
    specs/
      2026-06-05-ui-overhaul-design.md   — UI overhaul spec
    plans/
      2026-06-05-project-setup-and-lib.md — historical plan (Tasks 1&2; stale code inside)
```

---

## CSS Animations (globals.css)

| Class | Keyframe | Use |
|---|---|---|
| `animate-wave` | `wave` — translateX loop | Ocean wave layer |
| `animate-float` | `float` — translateY bob | Icebergs |
| `animate-bob` | `bob` — translateY + slight rotate | Ship |

CSS variables: `--navy: #061826`, `--ocean: #0B3558`, `--ice-blue: #9DD8F7`, `--frost: #F2FBFF`, `--warning: #F59E0B`, `--danger: #DC2626`, `--success: #22C55E`

---

## Completed Tasks

### ✅ Tasks 1 & 2 — Project Setup & Core Library (2026-06-05)

- Next.js 16 scaffolded with TypeScript, Tailwind, App Router, `src/` layout
- Supabase SQL migrations: 7 tables (`teammates`, `preset_tasks`, `daily_tasks`, `recurring_tasks`, `task_completions`, `daily_results`, `teammate_daily_stats`)
- Seed data: 4 teammates + 9 Islamic + 7 regular preset tasks
- All `src/lib/` utilities created and tested
- 36 unit tests passing at end of Task 2

### ✅ Task 3 — Login Page v1 (2026-06-05, superseded by Task 3b)

Original login page built (centered frosted card). This design was scrapped and replaced entirely in Task 3b.

### ✅ Task 4 — Teammate Dashboard (2026-06-05)

Full client-side dashboard at `/teammate/[teammateId]`:
- Auth guard: reads `getCurrentTeammate()` from localStorage; redirects to `/login` if absent
- Fetches today's `daily_tasks`, last 365 days of `teammate_daily_stats` (for streak), all `preset_tasks`
- Recurring task seeding on mount (duplicate check per `(teammate_id, task_date, preset_task_id)`)
- Task completion: optimistic UI update; Supabase re-fetch on error
- Repeatable tasks: button disabled when `completion_count >= max_completions`; shows count/max
- Stats row: Points Today, Tasks Done (required only), Streak in days
- Chad/Chud badge display
- Add custom task form + Preset task modal (with recurring toggle)
- Heatmap placeholder (Task 14 will populate)
- Uses `React.use(params)` to unwrap `Promise<{ teammateId }>` (Next.js 16 requirement)

### ✅ UI Overhaul Design Session (2026-06-05)

No code written — design decisions made and documented. Produced:
- `docs/superpowers/specs/2026-06-05-ui-overhaul-design.md`
- Updated `docs/SS_Barakah_Requirements.md` (sections 6.1, 6.3, 8.1, 8.1a, 8.2, 18.2, 19, 20, 25.2, 27, 28)
- Added Tasks 3b and 3c to `docs/todo.md`

### ✅ Task 3b — Login Page Redesign & Auth Persistence (2026-06-06)

**Auth persistence:**
- `src/lib/auth.ts`: `loginTeammate` → `localStorage.setItem` (was `sessionStorage`)
- `logoutTeammate` → `localStorage.removeItem`
- `getCurrentTeammate` → reads `localStorage`
- Admin code updated (value in `auth.ts`; not documented here intentionally)
- Admin session still uses `sessionStorage`

**IcyErrorModal (`src/components/IcyErrorModal.tsx`):**
- Frosted glass overlay, red-tinted border (`rgba(220,38,38,0.5)`)
- ❄️ icon, error message, Dismiss button
- Dismisses on Dismiss click or outside-overlay click

**Login page redesign (`src/app/login/page.tsx`):**
- Full-screen Arctic gradient; old centered card removed
- Title + tagline at top
- Large ship SVG (340px wide, rotated 5°) with detailed rigging, portholes, red crack on hull
- Massive threatening iceberg right side (`animate-float`, delay 1.8s)
- Smaller iceberg left side (`animate-float`, delay 0.8s)
- 30 pre-computed star positions (stable — no `Math.random()` hydration mismatch)
- Two-layer animated wave covering bottom ~28%
- Full-width "Crew Access" frosted panel docked to bottom: horizontal row on desktop, stacked on mobile
- Failed login → `IcyErrorModal` (no inline error text)

### ✅ Task 3c — Nav Bar & Login Modal (2026-06-06)

**NavBar (`src/components/NavBar.tsx`):**
- Fixed top bar, `z-30`, `backdrop-filter: blur(14px)`, Arctic styling
- Left: `⚓ S.S. Barakah` → links to `/`
- Center (desktop): Ship / History / Admin — active page gets white + underline
- Right (logged out): `Board Ship →` button opens `<LoginModal />`
- Right (logged in): initial circle + name + `▾` → dropdown (My Dashboard, Log Out)
- Dropdown closes on `mousedown` outside via `document` listener
- Re-reads `getCurrentTeammate()` from localStorage on every pathname change

**Mobile hamburger:**
- `☰` visible on mobile; center links hidden
- Opens frosted drawer sliding down from `top-14`
- Closes on outside tap or link click

**LoginModal (`src/components/LoginModal.tsx`):**
- Frosted glass overlay; dismissible by clicking backdrop
- Mini ship SVG, title, name + password inputs, `Board →` button
- Failure → `IcyErrorModal`
- Success → calls `onSuccess()` callback (NavBar re-reads localStorage), redirects to `/teammate/[id]`

**ConditionalNav (`src/components/ConditionalNav.tsx`):**
- Returns `null` on `/login`
- Otherwise renders `<NavBar />` + `<div className="h-14" />` spacer
- Added to `src/app/layout.tsx` before `{children}`

**Teammate dashboard cleanup:**
- Removed "Ship Dashboard" and "History" bottom nav buttons from `/teammate/[teammateId]/page.tsx`
- Inline "Log out" button in page header kept (it's a page action, not navigation)

**Known issue (will fix in Task 7):**
- After logout, user is sent to `/login` which has no nav bar, so `Board Ship →` modal is unreachable
- Fix: once Task 7 (ship dashboard at `/`) is built as a public page, logout will redirect there instead of `/login`

### ✅ Task 5 — Daily Task Creation & Completion Logic (2026-06-06)

All behaviour was already implemented in Task 4. Task 5 extracted the testable pure logic:

**New exports in `src/lib/calculations.ts`:**
- `calculateDisplayPoints(tasks)` — sums `points × completion_count` for completed tasks
- `isTaskCompletable(task)` — `false` for completed non-repeatable; `false` for repeatable at/past max; `true` otherwise

**Tests:** 11 new tests (RED before implementation). Total: 47 passing.

**Component wiring:**
- Removed inline `calcPoints` helper from teammate dashboard; uses `calculateDisplayPoints`
- Removed inline `atMax`/`disabled` derivation in `TaskRow`; uses `isTaskCompletable`
- Single guard in `completeTask`: `if (!isTaskCompletable(task)) return`

**Verified correct (already working from Task 4):**
1. Recurring tasks seeded on page load with per-task duplicate check
2. Repeatable button disabled at max; count/max shown
3. Optimistic UI update on completion; Supabase re-fetch on error
4. Points recalculate after every completion

---

## Git History (key commits)

| Commit | Description |
|---|---|
| `d2aa2f3` | Reimagined the whole layout (UI overhaul design) |
| `7158e95` | feat: Tasks 3b, 3c, 5 — login redesign, nav bar, auth persistence, task logic |

---

### ✅ Task 6 — Preset Task System (2026-06-06)

Pure refactor — no behaviour changes:
- Created `src/components/tasks/PresetTaskSelector.tsx` exporting `PresetTaskSelector` (renamed from inline `PresetModal`), `PresetRow`, `Field`, `Toggle`, and `inputStyle`
- Removed all five duplicated definitions from `/teammate/[teammateId]/page.tsx`
- Dashboard now imports from the new file; file is ~100 lines shorter
- TypeScript clean, all 47 tests still pass

### ✅ Task 7 — Main Ship Dashboard (2026-06-06)

Replaced the redirect-only `src/app/page.tsx` with the public ship dashboard:

**Data:** Polls Supabase every 15 seconds (teammates, daily_tasks, task_completions, daily_results for today).

**Layout (top → bottom):**
1. Mission status chip (CRITICAL/DAMAGED/STABILIZING/ALMOST REPAIRED/SURVIVED/SUNK) + live countdown to midnight
2. Team progress bar with % label; "No repairs assigned yet" message when 0 required tasks
3. `ShipScene` component (`src/components/ship/ShipScene.tsx`) — ship SVG tilts linearly from −15° (0%) to 0° (100%), 4 coloured worker circles animate (panic/calm/celebrate based on progress), 2-layer animated waves, floating iceberg
4. Failure overlay if `daily_results.outcome = 'sunk'` (red panel with Chud callout)
5. Chad + Chud badge cards side by side (reads `current_chad`/`current_chud` from teammates table)
6. Crew leaderboard (rank, name, pts, required done/missed)
7. Recent Repairs feed (last 10 completions, newest first; teammate name + task name + time + pts)

**Worker animations** added to `globals.css`: `animate-panic` (fast jitter), `animate-calm-worker` (slow drift), `animate-celebrate` (bounce)

**Logout redirect** updated from `/login` → `/` in both `teammate/[id]/page.tsx` and `NavBar.tsx` — nav bar is now always reachable after logout.

---

## Next Tasks

### Task 6 — Preset Task System
Extract `PresetModal` and `PresetRow` from the teammate dashboard (currently inline in `/teammate/[teammateId]/page.tsx`, which is 700+ lines) into `src/components/tasks/PresetTaskSelector.tsx`. No behaviour changes — purely making the component reusable and the dashboard file smaller. Wire the dashboard back to import from the new file.

### Task 7 — Main Ship Dashboard (`/`)

**Confirmed design (approved by user 2026-06-06):**
- Public page — no auth required
- Polls Supabase every 15 seconds
- Layout (top → bottom):
  1. Mission status chip + countdown to midnight
  2. Team progress bar with % label
  3. Ship scene — ship SVG tilts based on progress, 4 coloured circles as workers, ocean waves, static iceberg
  4. Chad + Chud badge cards side by side
  5. Team leaderboard (rank, name, points, tasks done/missed)
  6. Recent completions feed (last 10, newest first)
- Ship tilt: 0%→−15°, 25%→−10°, 50%→−5°, 75%→−2°, 100%→0° (CSS rotate)
- Worker states: panic (fast jitter) below 75%, calm (slow drift) 75–99%, celebrate (bounce) at 100%
- No sinking animation yet — that's Task 16. At day-end if sunk, show tilted ship + failure overlay.
- After Task 7 is done: update logout redirect from `/login` to `/` so the nav bar is always accessible

### Tasks 8–18 — See `docs/todo.md`

---

## Document Consistency Status (as of 2026-06-06)

All five inconsistencies found in the review were fixed:
1. ✅ Admin code removed from `SS_Barakah_Requirements.md §8.4` (was exposing "Dawoud Sink")
2. ✅ `§22.1` function names updated to match actual `calculations.ts` exports
3. ✅ `§28` duplicate item #4 fixed; numbering corrected through item 27
4. ✅ `§29` added (was missing; jump from 28 to 30)
5. ✅ Plans doc noted as targeting Next.js 14 but actual version is 16.2.7; stale auth.ts code inside is flagged

---

## Known Stale Documents (do not treat as current)

- `docs/superpowers/plans/2026-06-05-project-setup-and-lib.md` — historical implementation plan for Tasks 1&2. The auth.ts code inside uses old `sessionStorage` and old admin code. Do not use as reference for current code — it is frozen history.

---

## Workflow Rules (set by user)

1. **One task at a time.** Complete fully before starting the next.
2. **Append to `handoff.md`** after each completed task.
3. **Push to GitHub** after every task the user confirms is done.
4. **TDD for all new logic.** Write failing test first, confirm RED, implement, confirm GREEN.
5. **Brainstorm before building** any new feature or page — use the brainstorming skill, get design approval before writing code.
6. **Read `AGENTS.md`** (which references `node_modules/next/dist/docs/`) before writing any Next.js code.
