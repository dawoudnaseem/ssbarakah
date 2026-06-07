# S.S. Barakah — Handoff Log

> This file is the single source of truth for any new session. Read it first, then read the documents it points to. Everything needed to continue work is here.

---

## ⏭️ Next Task: Task 16 — Ship Animations & Visual Polish

See `docs/todo.md` under "Task 16". This is a high-complexity task — decompose into sub-tasks during brainstorming.

**Before starting:** Run the brainstorming skill. Break into independent sub-tasks (intro animation, sinking, overlays, sound).

---

## Remaining Tasks — Complexity Overview

| Task | Complexity | Est. Sessions | Notes |
|---|---|---|---|
| 15 — Pomodoro Timer | Low-medium | 1–2 | Pure UI component, no DB. Include `visibilitychange` fix for background tabs. |
| 16 — Ship Animations & Visual Polish | **High** | 3–4 | Most complex remaining task. Many subcomponents: sinking animation, success overlay, intro crash animation (once per day, skippable), alarm sound. Lots of visual iteration — break into sub-tasks during brainstorming. |
| 17 — Mobile Responsiveness | Medium | 1–2 | Audit pass across all pages. Many small fixes: 44px tap targets, no horizontal scroll at 320px/375px/390px, ship scene mobile adaptation. |
| 18 — Final QA & MVP Verification | Low | 1 | Checklist run through all Definition of Done criteria (§28). No new code expected. |

**Flag for Task 16:** Plan carefully during brainstorming. Decompose into independent sub-tasks (intro animation, sinking, overlays, sound) so each can be scoped and reviewed separately without blowing context.

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
      page.tsx                      — admin dashboard with code gate + Crew/Missions/Finalize tabs
    history/
      page.tsx                      — History/Stats page (Fleet Summary, Crew Records, Daily Log)
  components/
    IcyModal.tsx                    — base modal wrapper: backdrop + SVG icicles + glossy-ice card shell; ALL modals use this
    ConditionalNav.tsx              — hides NavBar on /login; renders h-14 spacer elsewhere
    NavBar.tsx                      — fixed top bar; logo, nav links, avatar dropdown, hamburger
    LoginModal.tsx                  — overlay login form triggered from NavBar; uses IcyModal
    IcyErrorModal.tsx               — frosted glass error modal (red border, dismiss on click); uses IcyModal; prop is `onDismiss`
    DeleteConfirmModal.tsx          — delete task confirmation; 2-btn (non-recurring) or 3-btn (recurring) variant; uses IcyModal
    admin/
      AdminCodeGate.tsx             — code input gate; validates via validateAdminCode(); sessionStorage-backed
      TeammatesSection.tsx          — add/edit/delete/toggle teammates
      MissionsSection.tsx           — create/edit/delete preset tasks
      FinalizeSection.tsx           — manual day finalization trigger with confirm modal and double-submit guard
    leaderboard/
      Leaderboard.tsx               — leaderboard rows with amber #1 glow, Chad/Chud pills
      RecentRepairsFeed.tsx         — recent task completions feed
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

Replaced the redirect-only `src/app/page.tsx` with the full public ship dashboard. Went through several design iterations in the same session (all captured below).

---

#### Task 7 — Final architecture

**Data:** Polls Supabase every 15 seconds — `teammates`, `daily_tasks`, `task_completions`, `daily_results` for today. Leaderboard and recent feed computed client-side from those four queries.

**Three fixed overlays (always visible regardless of scroll):**
- Mission status chip (top-left, `fixed top-[70px]`) — CRITICAL / DAMAGED / STABILIZING / ALMOST REPAIRED / SURVIVED / SUNK, colour-coded
- Countdown to midnight (top-right, `fixed top-[70px]`)
- Progress bar (bottom, `fixed bottom-0`) — frosted glass panel, fills navy→ice-blue→green as % rises

**Scene section (`src/app/page.tsx`, normal flow, `height: 100svh`):**
- Full-screen Arctic gradient background (`#061826` → `#0B3558`)
- 30 pre-computed stars (no `Math.random()` — avoids hydration mismatch)
- Three-layer z-ordering inside the scene:
  - `z-1` — dark back wave (`#041220`, `height: 44%`, crest at y=32) — behind ship and icebergs
  - `z-2` — ship + icebergs
  - `z-3` — light front wave (`#0B3558`, `height: 40%`, crest at y=25) — **in front** of ship, partially submerging hull base and iceberg bottoms
- Wave crests both resolve to ~30% waterline from bottom of scene; ship positioned `bottom: 21%` so hull base sits in the front wave

**Ship (three-wrapper pattern — critical detail):**
```
Centering wrapper  — left:50%, translateX(-50%), never animated
  └─ Tilt wrapper  — rotate(shipTilt deg), CSS transition 1.5s, transformOrigin center bottom
       └─ Bob wrapper  — animate-bob-simple (translateY + gentle rotate, no conflict)
            └─ <div style={{width: min(520px, 92vw), position:relative}}>
                 <svg viewBox="0 0 340 170" width="100%" height="auto"> ...ship SVG...
                 4× worker circles (absolute, % positions, scale with SVG)
```
The three-wrapper pattern is **mandatory**. If centering and animation live on the same element, `animate-bob` overrides `translateX(-50%)` and the ship drifts off-centre. Each transform on its own element; they compose correctly.

**Ship tilt:** `shipTilt = -(15 - progress/100 * 15)` — linear −15° (0%) to 0° (100%). If sunk: −30° + `translateY(140px)`.

**Worker animations** (in `globals.css`):
- `animate-panic` — fast jitter (< 75% progress)
- `animate-calm-worker` — slow drift (75–99%)
- `animate-celebrate` — bounce (100%)
- `animate-bob-simple` — `translateY(-11px) rotate(±1.5deg)`, 3.5s loop — ship bobs on the water

**Icebergs:**
- Small (left, `bottom: 28%`, `animate-float` delay 0.8s)
- Large threatening (right, `bottom: 25%`, `animate-float` delay 1.8s)

**Scroll → deep abyss effect:**
- Scene is normal flow (not sticky) — everything (sky, ship, waves) scrolls upward together
- 100px gradient transition (`#0B3558` → `#020810`) acts as the "going underwater" moment
- Data section (`background: #020810`, near-black) contains: failure callout (if sunk), Chad/Chud badge cards, crew leaderboard, recent repairs feed
- "— deep waters —" divider marks the transition

**Logout redirect** updated from `/login` → `/` in both `src/app/teammate/[teammateId]/page.tsx` and `src/components/NavBar.tsx`.

---

#### Key decisions made during Task 7 iterations

| Decision | Value | Reason |
|---|---|---|
| Scene scroll behaviour | Normal flow (not sticky) | User wanted ship/sky/waves to all scroll up together as you "dive" |
| Data section placement | Below scene, dark background | "Scroll into the deep ocean abyss" — user's design concept |
| Only progress bar as overlay | Fixed bottom, no other overlays in scene | User's explicit instruction |
| Mission chip + countdown | Fixed top-left / top-right | User requested these back after they were removed |
| Ship size | `min(520px, 92vw)` | User requested larger than original 340px |
| Ship bottom position | `21%` | User iterated: 36% → 29% → 26% → 18% → 21% (final, user-set) |
| Three-wrapper pattern | Mandatory | Prevents `animate-bob` from overwriting `translateX(-50%)` centering |
| Wave z-layering | Dark wave z:1 (behind), light wave z:3 (in front) | User's explicit request — icebergs/ship partially submerged by front wave |
| `ShipScene.tsx` | Deleted — inlined into `page.tsx` | Simpler; ship is only used on this one page |

---

### ✅ Task 8 — Progress Calculation (2026-06-06)

Most logic was already in place from Task 7. This task confirmed and completed the remaining gap:

- `calculateTeamProgress(dailyTasks)` in `src/lib/calculations.ts` — already implemented and tested (returns 0 for empty, rounds to integer %)
- `getProgressState(percentage, isSunk)` in `src/lib/calculations.ts` — already implemented and tested (critical/damaged/stabilizing/almost_repaired/survived/sunk)
- `getMissionStatus(progress, isSunk)` in `src/app/page.tsx` — already wired to the mission chip overlay with color coding
- Progress bar already polls live data every 15 seconds via `fetchData` / `setInterval`
- **New:** Added `hasNoRequiredTasks` check in `src/app/page.tsx`; when no required tasks exist the progress bar label shows "No repairs assigned yet" and a sub-line "Choose your tasks to begin today's mission." instead of the percentage

All 47 tests still passing.

---

### ✅ Icy Modal System & Delete Task (2026-06-06)

**IcyModal (`src/components/IcyModal.tsx`):**
- Shared base wrapper for all modals — provides backdrop blur, `role="dialog"`, ESC key handler, SVG icicle strip along top inner edge (8 icicles, heights 22–46px, semi-transparent white-blue), glossy-ice card (white-tinted gradient → navy, bright ice-white border, inset highlight sheen)
- Props: `onClose`, `children`, `accentColor?` (default `#9DD8F7`), `maxWidth?` (default `max-w-sm`)
- **All future modals must use this wrapper — do not hand-roll backdrop/card styles**

**Retrofitted modals:**
- `IcyErrorModal` — now uses `<IcyModal accentColor="#DC2626">`; content (❄️ icon, red message, Dismiss button) unchanged
- `LoginModal` — now uses `<IcyModal>`; content (ship SVG, inputs, Board button) unchanged

**DeleteConfirmModal (`src/components/DeleteConfirmModal.tsx`):**
- Non-recurring task: Cancel + Remove (red)
- Recurring task: Cancel + Remove today only + Remove forever
- "Remove forever" deletes `recurring_tasks` row so task never seeds again; "Remove today only" leaves it intact

**Teammate dashboard changes (`src/app/teammate/[teammateId]/page.tsx`):**
- `recurringTasks` stored in state (populated from existing seed effect)
- `taskToDelete: DailyTask | null` state controls modal visibility
- `deleteTask(task, scope)` — optimistic removal, deletes `task_completions` then `daily_tasks`, optionally `recurring_tasks`
- `TaskRow` gains `onDelete` prop and a red ✕ button (44px tap target) to the left of the complete button

### ✅ Recurring Task Detection Bugfix (2026-06-06)

Three bugs found and fixed in `src/app/teammate/[teammateId]/page.tsx` after the icy modal task:

**Bug 1 — Detection logic excluded custom recurring tasks entirely:**
The `isRecurring` check gated on `taskToDelete.preset_task_id !== null`, which is always `false` for custom tasks (they have `preset_task_id = null`). Fixed to use a branching strategy: preset tasks match by `preset_task_id`; custom tasks match by `name`:
```tsx
isRecurring={recurringTasks.some(rt =>
  taskToDelete.preset_task_id !== null
    ? rt.preset_task_id === taskToDelete.preset_task_id
    : rt.preset_task_id === null && rt.name === taskToDelete.name
)}
```

**Bug 2 — `recurringTasks` state was never refreshed after adding a recurring task:**
Added `fetchRecurringTasks` as a `useCallback` (mirrors `fetchTasks` but queries `recurring_tasks`). Called after every insert into `recurring_tasks` in both `submitAddTask` and `addPresetTask`. Previously the state was only populated at mount, so newly-added recurring tasks were invisible to the detection logic.

**Bug 3 — `deleteTask` "forever" scope silently skipped custom tasks:**
Was gated on `task.preset_task_id` being set. Now handles both branches: preset tasks delete by `preset_task_id`, custom tasks delete by `name`.

---

### ✅ "Repeatable (in a single day)" rename & UX clarification (PENDING — next task)

**Background:** User confusion between two separate features:
- **"Repeatable"** — complete the same task N times in a single day (shows 0/N → N/N counter). This is the correct feature for "I want to run 5 times today".
- **"Repeat every day (recurring)"** — auto-seeds the task into `daily_tasks` each new day so it appears without manual re-adding.

**What needs to change:**
1. Rename the label **"Repeatable"** → **"Repeatable (in a single day)"** in the custom task form (`src/app/teammate/[teammateId]/page.tsx`, the `Toggle` near line 503)
2. Rename the label **"Repeatable"** → **"Repeatable (in a single day)"** in `src/components/tasks/PresetTaskSelector.tsx` if it appears there
3. The max-completions field label should read **"How many times in a single day?"** instead of "Max completions per day"
4. The "Repeat every day (recurring)" toggle label is fine as-is — it correctly describes daily auto-seeding
5. No behaviour changes — only label text

**How the feature already works (do not change this):**
- Toggle "Repeatable (in a single day)" ON → shows "How many times?" number input (default 1, min 2)
- Task row shows `completion_count/max_completions` (e.g. `0/5 → 1/5 → ... → 5/5`)
- "+" button increments `completion_count`; disabled when count reaches `max_completions`
- `isTaskCompletable()` in `calculations.ts` correctly enforces the cap

**Files to edit:**
- `src/app/teammate/[teammateId]/page.tsx` — two Toggle labels + one Field label
- `src/components/tasks/PresetTaskSelector.tsx` — check for any "Repeatable" or "Max completions" labels

This is a pure label rename, no logic changes, no new tests needed.

---

### ✅ "Repeatable (in a single day)" Label Rename (2026-06-06)

Pure label rename — no logic changes:
- `src/app/teammate/[teammateId]/page.tsx`: Toggle label `"Repeatable"` → `"Repeatable (in a single day)"`
- `src/app/teammate/[teammateId]/page.tsx`: Field label `"Max completions per day"` → `"How many times in a single day?"`
- `src/components/tasks/PresetTaskSelector.tsx`: no "Repeatable" or "Max completions" labels found — nothing to change
- All 47 tests still passing

---

### ✅ Custom Task Points — Three Fixed Options (2026-06-06)

Replaced the free-entry number input for points in the custom task creation form with three toggle buttons:
- **Small** — 5 pts
- **Medium** — 10 pts (default)
- **Large** — 15 pts

Selected option highlights in ice-blue (`#9DD8F7`). No logic changes — `form.points` still drives everything downstream identically.

**File changed:** `src/app/teammate/[teammateId]/page.tsx` (the `<Field label="Points">` block, ~line 505)

---

### ✅ Preset Task Fixes — Recurring Bug, Renames, Removal, Ordering (2026-06-06)

**Bug fix — recurring toggle had no effect for many preset tasks:**
- Root cause: `addPresetTask` in `src/app/teammate/[teammateId]/page.tsx` guarded the `recurring_tasks` insert with `preset.can_be_recurring`. Several tasks (e.g. "Attend Islamic class", "Memorize Quran", "Give sadaqah") had `can_be_recurring = false` in the DB, so toggling "Repeat every day" silently did nothing and the 3-button delete modal never appeared.
- Fix: removed the `&& preset.can_be_recurring` guard. Any preset task can now be made recurring, matching custom task behaviour exactly.

**Content changes (applied via `supabase/migrations/003_update_preset_tasks.sql` — must be run manually in Supabase SQL editor):**
- "Attend Islamic class" renamed → "Attend Halaqa/Dars in Person"; `can_be_recurring` set to `true`
- "Read 10 pages" renamed → "Reading Regular Book"; points kept at 20, `is_repeatable` set to `false`, `default_max_completions` set to 1, `can_be_recurring` set to `true`
- "Code for 1 hour" deleted from `preset_tasks`

**Ordering (client-side sort in `src/components/tasks/PresetTaskSelector.tsx`):**

Islamic Tasks display order:
1. Seek Ilm
2. Attend Halaqa/Dars in Person
3. Read Quran
4. Memorize Quran
5. Review Quran
6. Morning adhkar
7. Evening adhkar
8. Give sadaqah

Regular Tasks display order:
1. Journal
2. Workout
3. Reading Regular Book
4. Study
5. Apply to jobs
6. Clean room

Order is enforced by `sortByOrder()` helper in `PresetTaskSelector.tsx` — tasks not in the list fall to the bottom. `ISLAMIC_ORDER` and `REGULAR_ORDER` constants at the top of that file are the single source of truth for ordering.

**`supabase/migrations/002_seed_data.sql` also updated** to reflect the final desired state (for fresh DB setups).

All 47 tests still passing.

---

### ✅ Task 9 — Leaderboard (2026-06-06)

**Design session:** Visual mockups shown in browser companion. Approved design:
- Row layout: rank · avatar circle (initial) · name + inline Chad/Chud badge · points + status stacked on right
- Rank #1 row glows amber (`rgba(245,158,11,0.08)` bg, amber border); all others dark navy
- Avatar: amber solid for #1, navy + ice border for others; shows first letter of name uppercased
- Chad badge: `⚓ CHAD` amber pill inline after name (only when `current_chad` is true)
- Chud badge: `💀 CHUD` red pill inline after name (only when `current_chud` is true — never both)
- Points: amber for #1, ice-blue for others
- Status line (only when `totalRequired > 0`): `✓ all X/X tasks done` in green when all required done; `N missed` in red otherwise
- No pills for required/total stats — status line only
- Requirements written into `docs/SS_Barakah_Requirements.md §17`

**Implementation (subagent-driven, 4 tasks):**

New files created:
- `src/types/leaderboard.ts` — exports `LeaderboardEntry` (teammate, points, completedRequired, totalRequired, missedRequired) and `RecentCompletion` (id, completed_at, points_awarded, task_name, teammate_name); previously these were inline in `page.tsx`
- `src/components/leaderboard/Leaderboard.tsx` — pure presentational component; receives `entries: LeaderboardEntry[]` prop; renders all approved row styles
- `src/components/leaderboard/RecentRepairsFeed.tsx` — pure presentational component; receives `items: RecentCompletion[]`; `formatTime` helper moved here from `page.tsx`

Modified:
- `src/app/page.tsx` — removed 45 lines of inline markup; now uses `<Leaderboard entries={leaderboard} />` and `<RecentRepairsFeed items={recentFeed} />`; data fetching and 15-second polling unchanged

**Bug caught in final review and fixed:**
- `entry.teammate.name[0].toUpperCase()` would throw a `TypeError` at runtime if a teammate's name was an empty string. Fixed to `(entry.teammate.name[0] ?? '?').toUpperCase()`.

All 47 tests still passing.

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

## ✅ Task 10 — Chad/Chud Badge Logic (2026-06-06)

`calculateChad` and `calculateChud` implemented in `src/lib/calculations.ts`:

- **`calculateChad(stats)`** — returns the `teammate_id` with the highest `points_earned` for the day. Tiebreak: lowest `teammate_id` first. Returns `null` if stats array is empty.
- **`calculateChud(stats)`** — only eligible teammates have `missed_required_tasks > 0`. Among eligible: lowest `points_earned` first; tiebreak: most `missed_required_tasks`; final tiebreak: lowest `teammate_id`. Returns `null` if nobody missed required tasks.

Badge persistence: `finalizeDay` calls both functions and writes `current_chad = true` / `current_chud = true` to the `teammates` table after each finalization. These flags persist on the `teammates` table until the next finalization clears and reassigns them — meaning a teammate carries their badge all the following day (intentional "walk of shame" / "day of honour" mechanic).

Badge display: Chad/Chud pills already rendered in `src/components/leaderboard/Leaderboard.tsx` (from Task 9) using `entry.teammate.current_chad` and `entry.teammate.current_chud`. No new component needed.

New tests added to `src/__tests__/calculations.test.ts` covering: no stats → null, single teammate, ties on points (lowest id wins for Chad), ties on points with missed tasks (highest missed wins for Chud), nobody missed (Chud = null).

---

## ✅ Task 11 — Admin Dashboard (2026-06-06)

Route: `/admin` — protected by admin code gate.

**Files created:**
- `src/app/admin/page.tsx` — top-level admin page; renders `<AdminCodeGate>` which conditionally shows the dashboard once authenticated; section switcher for Crew / Missions / Finalize tabs
- `src/components/admin/AdminCodeGate.tsx` — code input form; validates via `validateAdminCode()` from `src/lib/auth.ts`; stores session via `setAdminSession()`; checks `isAdminAuthenticated()` on mount to skip gate if already authenticated in this tab's sessionStorage
- `src/components/admin/TeammatesSection.tsx` — teammate management: add (name + password), edit name, change password, toggle `is_active`, soft-delete. All via Supabase direct calls. Uses `IcyModal` for edit/add modals, `IcyErrorModal` for errors.
- `src/components/admin/MissionsSection.tsx` — preset task management: create, edit, delete preset tasks. Fields: name, category (Islamic/Regular), points, `is_repeatable`, `default_max_completions`, `can_be_recurring`. `confirmDelete` wrapped in try/catch with `IcyErrorModal` feedback (fix applied in code quality review).
- `src/components/admin/FinalizeSection.tsx` — manual finalization trigger. States: idle → confirming (`IcyModal` with red accent) → running (spinner, Confirm button `disabled`) → done (green success box + Reset button) or error (`IcyErrorModal`). Uses `useRef` guard to prevent double-submit. `todayString()` called inside `handleFinalize` (not at component scope, to avoid stale date on long-open tabs). Reset button clears both `done` and `error` states.

**Key implementation detail:** `IcyModal` uses `onClose` prop; `IcyErrorModal` uses `onDismiss` prop — these are different and must not be swapped.

---

## ✅ Task 12 — Daily Finalization (2026-06-06)

`finalizeDay(dateStr: string)` implemented in `src/lib/finalization.ts`. It is **idempotent** — safe to call multiple times for the same date (checks for existing `daily_results` row and returns early if found).

**Steps inside `finalizeDay`:**
1. Fetch all active teammates
2. Fetch all `daily_tasks` for the given date
3. Fetch all `task_completions` for those tasks
4. Fetch all `preset_tasks` to identify which tasks are required (`is_required = true` on `daily_tasks`)
5. For each teammate: calculate `points_earned`, `completed_required_tasks`, `total_required_tasks`, `missed_required_tasks`
6. Determine `outcome`: `'survived'` if all teammates completed all their required tasks; `'sunk'` otherwise
7. Determine `chad_teammate_id` via `calculateChad`, `chud_teammate_id` via `calculateChud`
8. Calculate fleet-wide `completion_percentage`
9. Insert row into `daily_results` (idempotency check is on this insert — if row exists, abort)
10. Insert rows into `teammate_daily_stats` for each teammate
11. Update `current_chad` / `current_chud` booleans on `teammates` table (clear all first, then set winners)
12. Call `createNextDayRecurringTasks(dateStr)` to seed recurring tasks for the following day

**Auto-trigger on app open:** `src/app/layout.tsx` (or `src/app/page.tsx`) checks on mount whether yesterday has a `daily_results` row; if not, calls `finalizeDay(yesterdayString())`. This handles the case where midnight passed without anyone having the app open.

**Tests:** `src/__tests__/finalization.test.ts` covers the full flow with a mocked Supabase client. TS2367 type error fixed in tests: `const missed: number = 2` (not `const missed = 2`) to avoid TypeScript literal type narrowing false positives.

**Test count after Tasks 10–12:** 60 tests, all passing.

---

## Task 13 — History/Stats Page (2026-06-06)

Route: `/history` (already linked in NavBar).

Single file: `src/app/history/page.tsx`.

**Three sections:**

1. **Fleet Summary** — 4 stat chips (Days Survived, Current Streak 🔥, Days Sunk, Survival Rate). All show `—` if no finalized days exist. Streak counts consecutive survived days going backwards from the newest result.

2. **Crew All-Time Records** — one card per active teammate, sorted by total all-time points descending. Card has: 56px avatar (amber for top scorer), 22px name, 13px Chad/Chud count pills, 36px Total Points + Tasks Done. Below that: a 20×3 heatmap (60 cells, 14×14px, 3px gap) covering the last 60 days with a warm orange-to-gold scale; red cells = days where required tasks were missed.

3. **Daily Log** — one card per `daily_results` row, newest first. Shows outcome icon (⛵/🌊), formatted date, title, Chad/Chud/crew chips, and completion %.

**Data:** All fetched once on mount via `Promise.all` — no polling. Sources: `daily_results`, `teammate_daily_stats`, `teammates`, `task_completions`.

**No new tests** — no new logic functions; all derived values are simple in-memory sums and counts.

### Task 13 — Final Review & Fixes (2026-06-06, this session)

A final overall code reviewer ran against the completed implementation. All cross-cutting checks passed (no `Math.random()`, `'use client'` present, heatmap produces exactly 60 cells, loading/error/empty states all present, NavBar already wired to `/history`). One important fix was identified:

**Fix — `paddingTop: '80px'` → `'56px'` in three places:**
- The NavBar is `h-14` (56px). All other pages use `paddingTop: '56px'`. The history page used `'80px'` in its error branch, loading branch, and the main render root — leaving a 24px dead zone at the top of the page. Fixed in all three occurrences in `src/app/history/page.tsx`. Committed: `fix: align history page paddingTop to 56px (matches NavBar height)`.

Two suggestions were noted but not acted on (low risk, by design):
1. `calcStreak` relies on caller passing newest-first sorted array — it does (query sorts descending), but has no internal guard. Fine for this codebase size.
2. Chud chip always renders (shows "💀 Chud: None" when absent); Chad chip is omitted when null. Asymmetry is intentional per spec.

**Final state:** 60 tests passing, `npx tsc --noEmit` clean. All work on `main` branch (no separate feature branch was used). Committed and pushed to GitHub.

---

### ✅ Task 13 — Complete (2026-06-06)

`src/app/history/page.tsx` created. Key implementation details:

**Helper functions (above component):**
- `localDateStr(d: Date)` — builds `YYYY-MM-DD` using local time (`getFullYear/getMonth/getDate`), NOT `toISOString()` which gives UTC and causes off-by-one bugs for UTC-negative timezones
- `calcStreak(results)` — iterates newest-first, compares each result's date to expected date (today − i); breaks on date gap OR sunk outcome
- `heatmapColor(points, missedRequired)` — red override if `missedRequired > 0`; warm scale: 0pts ghost → `#7C3200` → `#B84A00` → `#F97316` → `#FBBF24`
- `buildHeatmapCells(teammateId, stats)` — builds lookup by date, loops `i = 59` down to `0` (oldest to newest), produces exactly 60 cells
- `formatDate(dateStr)` — appends `T12:00:00` before constructing `Date` to avoid UTC midnight off-by-one; uses `month: 'long'` for full month names

**Data fetch:**
```ts
const [r1, r2, r3, r4] = await Promise.all([
  supabase.from('daily_results').select('*').order('result_date', { ascending: false }),
  supabase.from('teammate_daily_stats').select('*'),
  supabase.from('teammates').select('*'),
  supabase.from('task_completions').select('teammate_id'),
])
```
Checks `r1.error || r2.error || r3.error || r4.error` and sets `fetchError` string on any failure.

**Render structure:** Three inline functions `renderFleetSummary()`, `renderCrewRecords()`, `renderDailyLog()` called from the JSX return. `data` is destructured once after both loading and error guards: `const { results, stats, teammates, completionCounts } = data!`

**Crew records:** `activeTeammates = teammates.filter(t => t.is_active)` sorted by total points desc. Top scorer gets amber styling.

**Daily log:** `tmById` built from ALL teammates (including inactive) so historical names still resolve.

---

## ✅ Task 14 — Heatmap on Teammate Dashboard (2026-06-06)

**Design:** Option A — heatmap grid + legend only. No extra stats alongside the grid (streak is already shown in the stats row above; total points over 60 days would be misleading vs all-time figures).

**New file: `src/lib/heatmap.ts`**
Extracted three pure helper functions from `src/app/history/page.tsx` into a shared lib:
- `localDateStr(d)` — `YYYY-MM-DD` from local time (not UTC)
- `heatmapColor(points, missedRequired)` — warm colour scale; red override if `missedRequired > 0`
- `buildHeatmapCells(teammateId, stats)` — returns exactly 60 `{ color, date }` cells, oldest→newest

**Modified: `src/app/history/page.tsx`**
- Added `import { localDateStr, buildHeatmapCells } from '@/lib/heatmap'`
- Removed the three now-duplicate inline function definitions (~35 lines)

**Modified: `src/app/teammate/[teammateId]/page.tsx`**
- Added `import { buildHeatmapCells } from '@/lib/heatmap'`
- Added `heatmapStats: TeammateDailyStat[]` state (initially `[]`)
- Expanded `fetchStreak` query from `select('stat_date, completed_all_required')` → `select('*')` and calls `setHeatmapStats(data)` — no extra Supabase round-trip
- Replaced the "Heatmap coming in Task 14" placeholder with the real 20×3 CSS grid using `buildHeatmapCells(teammate?.id ?? '', heatmapStats)`
- Uses `teammate?.id ?? ''` (optional chaining) consistent with rest of file; empty string produces all-ghost cells if somehow null

**Post-completion fix:** Heatmap grid switched from fixed `14px` cells to `grid-template-columns: repeat(20, 1fr)` + `aspect-ratio: 1` per cell so the heatmap fills the full width of its card. History page heatmap unchanged (cell sizes are defined in each page's JSX, not in the shared lib).

**Tests:** 60 passing, `npx tsc --noEmit` clean.

**Next task:** Task 15 — Pomodoro Timer

---

## ✅ Task 15 — Pomodoro Timer (2026-06-06)

Single file: `src/components/pomodoro/PomodoroTimer.tsx`. Embedded between Activity Heatmap and Required Repairs in `/teammate/[id]`.

**Timer logic:**
- Configurable focus/break durations via number inputs (shown only when stopped; hidden while running)
- Default 25 min focus / 5 min break; Reset restores defaults and returns to focus mode
- Indefinite auto-cycle (focus → break → focus …) until Reset
- `visibilitychange` fix: `endTimeRef` stores absolute `Date.now() + secondsLeft * 1000` on start; recalculates `secondsLeft` when tab regains focus to correct background-tab drift

**UI:**
- MM:SS at 36px bold; mode label `FOCUS` (ice-blue) / `BREAK` (green `#22C55E`)
- Start/Pause (ice-blue filled) + Reset (ghost) buttons
- During break only: `🫁 Breathing Exercise` button appears

**Breathing Exercise overlay:**
- Full-screen `#020810` overlay (deep-abyss dark, same as ship dashboard scroll section)
- 4-phase box-breathing, 5s each, loops indefinitely: breathe in → hold → breathe out → hold
- Circle scales via `transform: scale()` CSS transition (expanded on phases 0–1, contracted on 2–3); transition duration 5s on grow/shrink phases, 0.3s on hold snaps
- Instruction text (`Breathe in`, `Hold`, etc.) is inside the circle and scales with it
- Break countdown shown small and fixed inside circle above the instruction text (does not scale)
- `Stop exercise` fixed at bottom; overlay also auto-closes when break countdown hits 0

**Future enhancement (logged):** Eyeless sea creatures (fish, octopus, whale) drifting in breathing overlay background — deferred to a polish pass, not in MVP.

**Tests:** 60 passing, `npx tsc --noEmit` clean.

**Next task:** Task 16 — Ship Animations & Visual Polish

---

## Task 15 — Post-completion fixes & redesign (2026-06-07)

Several rounds of iteration on `src/components/pomodoro/PomodoroTimer.tsx` after the initial commit:

**Bug fix — mode not switching + breathing button not appearing:**
- Root cause: `setMode` was called inside a `setSecondsLeft` updater function (React anti-pattern — side-effect state calls inside updaters are unreliable). Also, `mode` was in the tick effect's dependency array, causing the interval to be torn down and recreated on every mode switch (race condition).
- Fix: added `modeRef`, `focusMinsRef`, `breakMinsRef` to avoid stale closures. Tick effect depends only on `running`. `setMode` called directly, not inside an updater.

**Redesign — circular progress ring + drag selector:**
- Replaced the two number inputs with a single SVG circle that serves dual purpose:
  - **Idle:** circular drag selector — draggable handle on the circumference sets focus minutes (1–120 min; one full loop = 120 min). Selected minutes shown large in the centre.
  - **Running/paused:** progress ring — outline fills clockwise using `stroke-dashoffset` as time elapses. MM:SS + mode label in the centre. Ring is ice-blue during focus, green during break.
- Break duration fixed at 5 min (not configurable). "Skip break →" button added during break.
- Start button shows "Resume" when paused (detected via `endTimeRef.current !== null`).
- Drag uses global `mousemove`/`mouseup`/`touchmove`/`touchend` listeners (via `useEffect` on `dragging` state) so dragging outside the SVG works correctly.
- `totalSecsRef` (ref, not state) tracks the total seconds for the current session phase — used for progress ring calculation without causing extra re-renders.

**Breathing overlay — icy appearance:**
- Circle: translucent ice radial-gradient background, `2px solid rgba(200,238,255,0.9)` border, outer glow + inner highlight via `box-shadow`, `backdropFilter: blur(8px)`.
- Icicles below the circle were added then removed (they didn't scale with the circle since they were positioned absolutely outside the transform).
- `breathReady` flag: delays the first `scale(1)` transition by one `requestAnimationFrame` so the browser paints the circle at `scale(0.55)` first — ensuring the "breathe in" phase correctly grows from small to large.

**Text centering in SVG:**
- Used `dominantBaseline="middle"` so `y` is the true visual midpoint of each text element.
- Final positions (user-adjusted): number at `CY + 4`, label at `CY + 24` — user iterated to find the best visual balance.

---

## ✅ Visual Fixes — Teammate Dashboard Background Fade & Nav Menu Polish (2026-06-07)

### Teammate dashboard — deep-waters background fade

**Problem:** The teammate dashboard (`src/app/teammate/[teammateId]/page.tsx`) had a single `linear-gradient(#061826 → #0B3558)` applied across the entire page, so the background looked flat and inconsistent with the main Ship page (`/`).

**Fix:** Split the page into three visual zones matching the Ship page exactly:

1. **Surface section** — `linear-gradient(180deg, #061826 0%, #0B3558 100%)` wraps the header, stats row, heatmap, and Pomodoro timer. Top padding changed to `pt-20` (80px) so content clears the fixed navbar.
2. **Abyss transition** — 100px `div` with `linear-gradient(180deg, #0B3558 0%, #020810 100%)` — the "going underwater" moment.
3. **Deep waters section** — `background: #020810` (near-black) for the tasks list, action buttons, and forms. Opens with the same `— deep waters —` divider used in the Ship page.

The outer wrapper is `background: #020810` so there is no white flash if content overflows.

**Files changed:** `src/app/teammate/[teammateId]/page.tsx`

---

### Navbar — countdown visible through dropdown / z-index fix

**Problem:** The countdown chip (`fixed`, `z-40`) in `src/app/page.tsx` was bleeding through the avatar dropdown menu and (originally) the mobile drawer.

**Root cause:** The nav bar was `z-30`. A child's `z-index` is scoped to its parent's stacking context, so the dropdown's inline `z-index: 50` had no effect against the `z-40` countdown which lived in a different stacking context.

**Fix:** Raised the `<nav>` itself from `z-30` to `z-50` in `src/components/NavBar.tsx`. Now the entire nav stacking context (bar + dropdown + drawer) sits above the countdown.

---

### Navbar menus — icy frosted-glass appearance

**Problem:** Both the avatar dropdown and the mobile drawer had opaque dark backgrounds (`rgba(6,24,38,0.95/0.97)`) that looked heavy and out of theme.

**Fix:** Both menus restyled to a translucent icy look:
- `background: rgba(14,55,90,0.82)` — dark navy-blue at 82% opacity
- `backdropFilter: blur(24px) saturate(1.4)` + `WebkitBackdropFilter` — frosted-glass blur
- `border: 1px solid rgba(157,216,247,0.30)` — ice-blue edge
- Dropdown: `boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(157,216,247,0.15)'`
- Drawer: matching bottom border + inset shadow

**Files changed:** `src/components/NavBar.tsx`

---

### Teammate dashboard — hidden logout button above stats row

**Problem:** The page header (name + logout button) was rendering at the very top of the surface section with only `py-6` (24px) top padding, which placed it directly behind the 56px fixed navbar. The button was invisible but clickable — a phantom logout trigger.

**Fix:** Changed `py-6` → `pt-20 pb-6` on the surface section `div` so the header clears the navbar with comfortable breathing room.

**Files changed:** `src/app/teammate/[teammateId]/page.tsx`

---

## ✅ Task 16 — Ship Animations & Visual Polish (2026-06-07)

Implemented in worktree `feature/task-16-ship-animations` via 4 sub-tasks. All passed spec compliance + code quality review (two-stage review per sub-task, plus a final cross-cutting review).

### Sub-task D — Alarm Sound Asset

- `public/sounds/alarm.mp3` created as a minimal valid silent MP3 placeholder (431 bytes).
- **Action required before production:** replace with a real short alarm/klaxon clip (<3s). The code handles missing/broken audio silently via `.catch(() => {})`.

### Sub-task A — Sinking / Failure Animation & Overlay

**New file:** `src/components/SunkOverlay.tsx`
- Full-screen `position: fixed` overlay, `zIndex: 60`, fades in after a 3s delay (`overlay-fade-in` keyframe with `animation-fill-mode: both`)
- Contents: "🌊 The ship has sunk." heading, list of teammates with `missedRequired > 0`, prominent Chud callout (name, tasks missed, points), dismiss `×` button (`zIndex: 65`)
- Dismissal written to `sessionStorage` key `ss_barakah_sunk_dismissed_${today}` — auto-expires at midnight
- `role="dialog"`, `aria-modal="true"`, `aria-label="Ship has sunk"` for accessibility

**Modified:** `src/app/page.tsx`
- 3 new states: `sinkingWorkers`, `deepSunk`, `failureOverlayDismissed`
- `sinkTriggeredRef` prevents re-fire on 15s polls
- `isSunk` trigger effect (deps: `[todayResult]`): sets `sinkingWorkers = true` immediately; sets `deepSunk = true` after 2000ms via `setTimeout` (cleaned up on unmount)
- Workers: `animate-worker-sink` class when `sinkingWorkers`, `animationDelay: ${i * 0.5}s`, `animationFillMode: 'forwards'`
- Tilt wrapper: `deepSunk ? 'translateY(300px)' : isSunk ? 'translateY(140px)' : ''`; transition overrides to `4s ease-in` when deepSunk
- `today` changed to `useMemo(() => todayString(), [])` (prevents midnight re-render key shift)
- `<SunkOverlay>` rendered when `isSunk && !failureOverlayDismissed`

**New CSS in `globals.css`:**
- `@keyframes worker-sink`: 0%–80% fast panic jitter, 80%–100% fade to `opacity: 0; translateY(30px)`
- `.animate-worker-sink`: `animation: worker-sink 2s ease-in forwards`
- `@keyframes overlay-fade-in`: opacity 0 → 1 (shared with other overlays)

### Sub-task B — Success Overlay ("The ship survived!")

**Modified:** `src/app/page.tsx`
- `successBannerDismissed` state; sessionStorage key `ss_barakah_survived_dismissed_${today}`
- `CONFETTI_PARTICLES`: 8 pre-computed items (no `Math.random()`), varied colors + left positions
- Success banner: `position: fixed`, `top: 56px`, `zIndex: 49`, `role="alert"`, frosted green-accented panel, `slide-down 0.6s` animation
- Contents: "⛵ The ship survived!" in green, Chad callout in amber, 8 confetti particles, 44×44px dismiss button
- Shown when: `progress === 100 && !isSunk && !successBannerDismissed`

**Modified:** `src/components/NavBar.tsx`
- Avatar dropdown `zIndex` raised `50` → `56` (prevents success banner at z:49 + progress bar at z:50 from blocking dropdown)

**New CSS in `globals.css`:**
- `@keyframes slide-down`: translateY(-100%) → translateY(0)
- `@keyframes confetti-rise`: translateY + rotate + scale(0) with opacity fade
- `.confetti-particle`: `animation: confetti-rise 1.5s ease-out forwards`

### Sub-task C — Daily Intro Crash Animation

**New file:** `src/components/IntroAnimation.tsx`
- `'use client'`, props: `{ onDone: () => void }`
- Phase state machine (0–8) driven by `setTimeout` array (`timeoutsRef`); all timeouts cleared on unmount
- `doneRef` guard — `onDone` called exactly once regardless of skip/complete race
- **On complete or skip:** `localStorage.setItem('ss_barakah_last_intro', todayString())` → `onDone()`
- `INTRO_STARS`: 20 pre-computed entries, no `Math.random()`
- `role="dialog"`, `aria-modal="true"`, `aria-label="Ship intro animation"`; decorative children have `aria-hidden="true"` individually
- Skip button: `position: absolute`, bottom/right 24px, `zIndex: 100`, ice-blue pill

**Animation sequence:**

| Phase | Timing | Event |
|-------|--------|-------|
| 1 | 400ms | Ship sails in from left (inline transform + transition) |
| 2 | 2800ms | Araf dialog bubble |
| 3 | 4200ms | Dawoud dialog bubble |
| 4 | 5400ms | Everyone dialog bubble (red tint, larger) |
| 5 | 6200ms | Iceberg slams in from right |
| 6 | 6800ms | Screen shake + red alarm flash + crack SVG draws + alarm sound plays |
| 7 | 8200ms | Alarm fades, ship tilts −20°, workers appear (animate-panic) |
| 8 | 10000ms | Full scene fades out |
| done | 11500ms | `onDone()` called |

**Modified:** `src/app/page.tsx`
- `introPlayed` state: initialized to `false` — animation plays on every page load (no localStorage gate)
- `<IntroAnimation>` rendered as first child of a single `<>` fragment return, outside both loading/main branches — one React instance for the full 18s sequence

**New CSS in `globals.css`:**
- `@keyframes pulse-red`: opacity pulse for red alarm overlay
- `@keyframes screen-shake`: rapid translateX jitter
- `@keyframes intro-fade-out`: opacity 1 → 0
- `.animate-pulse-red`, `.animate-screen-shake`, `.animate-intro-fade-out`

### Post-completion fixes (2026-06-07)

**Bug fix — frozen frame on reload + skip not working:**
Original implementation used a `useState` lazy initializer to read `localStorage`. In Next.js App Router, SSR renders the component with `window = undefined` (lazy init returns `false`), and React hydration must match the server value — so the localStorage check never ran on reload. The result: IntroAnimation always mounted with a stale hydrated DOM, frozen at frame 0, with no live React events (skip button dead). Fixed by using a `useEffect` instead.

**"Play on every reload":** User requested the animation play on every page load rather than once per day. Removed the localStorage gate entirely — `introPlayed` is now simply `useState(false)`. Also removed the `localStorage.setItem` call from `IntroAnimation.tsx` and the unused `todayString` import.

**Animation extended to 18s:** Phase timings stretched so each dialog bubble has ~2s of reading time; aftermath (tilted ship + panicking workers) extended to 3s before fade.

### Final timing (PHASE_TIMINGS in IntroAnimation.tsx)

| Phase | Timing | Event |
|-------|--------|-------|
| 1 | 400ms | Ship sails in from left |
| 2 | 3500ms | Araf bubble: "Yo, word on the street..." |
| 3 | 6000ms | Dawoud bubble: "Wdym bro?" |
| 4 | 8200ms | Everyone bubble: "AHHHHHHHHHHH" — red alarm lights + `alarm1.mp3` starts |
| 5 | 12700ms | Iceberg slams in (~4.5s of alarm before crash) |
| 6 | 13700ms | Screen shake + crack draws; audio paused (first ~4.5s of clip used) |
| 7 | 15700ms | Red fades, ship tilts −20°, workers appear & panic |
| 8 | 17200ms | Scene fades to black (1.5s after tilt — was 3.3s, trimmed per UX feedback) |
| done | 19200ms | `onDone()` called |

**Post-completion changes (2026-06-07):**
- **alarm1.mp3**: replaced silent `alarm.mp3` placeholder with `public/sounds/alarm1.mp3` (13s clip). Only the first ~4.5s is used — audio starts at phase 4 and is paused at phase 6 (the crash). Chrome blocks autoplay without a user gesture; audio is unlocked via `mousedown`/`touchstart`/`keydown`/`pointerdown` document listeners registered on mount. Works on Safari; Chrome requires user to interact before phase 4.
- **Alarm timing moved to phase 4**: alarm + red overlay now start when "AHHHHHHHHHHH" appears, not at the crash. Red overlay pulses through phases 4–6, then fades at phase 7.
- **Background matched to main page**: gradient changed from 3-stop (`#020810 → #061826 → #0B3558`) to the same 2-stop as the ship scene (`#061826 → #0B3558`).
- **Animated waves added**: replaced static `#041220` ocean strip with the same `wave-back` (44% height, z:1) and `wave-front` (40% height, z:3) animated layers from the main page. Ship and iceberg sit at z:2 — between the two wave layers — so the front wave partially submerges their hulls.
- **Speaker names on bubbles**: each dialog bubble now shows the speaker's name (Araf / Dawoud / Everyone) as a small uppercase label above the message text.
- **Faster ending**: phase 8 (fade out) moved from 19000ms → 17200ms, trimming the tilted-ship hold from 3.3s to 1.5s.

### Final z-index Stack (page.tsx dashboard)

| z-index | Element |
|---------|---------|
| 200 | IntroAnimation (full-screen, every page load) |
| 65 | SunkOverlay dismiss button |
| 60 | SunkOverlay (sunk day failure) |
| 56 | NavBar avatar dropdown |
| 50 | NavBar `<nav>` + progress bar |
| 49 | Success banner |
| 40 | Mission status chip + countdown |

### IntroAnimation internal z-index layering

| z-index | Element |
|---------|---------|
| 100 | Skip button |
| 50 | Red alarm overlay |
| 6 | Dialog bubbles |
| 5 | Iceberg |
| 4 | Ship |
| 3 | Front wave (`wave-front`) |
| 2 | (ship + iceberg sit here — between waves) |
| 1 | Back wave (`wave-back`) |

### ⚠️ alarm sound
`public/sounds/alarm1.mp3` is the active alarm clip (13s). Only the first ~4.5s plays. Chrome autoplay policy requires a user gesture before phase 4 (8.2s) — the animation registers document-level listeners to unlock on first interaction. If Chrome support is critical, consider a short looping clip triggered on a user-visible "tap to start" prompt.
