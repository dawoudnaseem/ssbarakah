# S.S. Barakah — Task List

> Build order follows Section 27 of the requirements document (updated 2026-06-05).
> After completing each task, append a summary to `handoff.md`.
> Tasks marked ✅ are complete — see `handoff.md` for details.

---

## ✅ Task 1 — Project Setup & Supabase Schema

### 1.1 Initialize Next.js project
- [x] Run `npx create-next-app@latest` with TypeScript, Tailwind CSS, App Router
- [x] Install dependencies: `@supabase/supabase-js`, `framer-motion` (optional)
- [x] Set up `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Add `.env.local` to `.gitignore`

### 1.2 Set up Supabase project
- [x] Create a new Supabase project
- [x] Note down project URL and anon key

### 1.3 Create database tables
- [x] Create `teammates` table
- [x] Create `preset_tasks` table
- [x] Create `daily_tasks` table
- [x] Create `recurring_tasks` table
- [x] Create `task_completions` table
- [x] Create `daily_results` table
- [x] Create `teammate_daily_stats` table

### 1.4 Seed initial data
- [x] Insert initial teammates: Dawoud, Araf, Sufiyan, Nouho
- [x] Insert preset Islamic tasks

### 1.5 Update handoff.md
- [x] Append summary of Task 1 to `handoff.md`

---

## ✅ Task 2 — Supabase Client & Project Structure

### 2.1 Create folder structure
- [x] Set up `src/app/` directory with page files
- [x] Create `src/components/` subdirectories
- [x] Create `src/lib/` directory

### 2.2 Create Supabase client
- [x] Create `src/lib/supabaseClient.ts`

### 2.3 Create auth utilities
- [x] Create `src/lib/auth.ts` with `loginTeammate`, `logoutTeammate`, `getCurrentTeammate`, `validateAdminCode`, `changeTeammatePassword`

### 2.4 Create calculations utilities
- [x] Create `src/lib/calculations.ts`

### 2.5 Create finalization utilities
- [x] Create `src/lib/finalization.ts`

### 2.6 Create date utilities
- [x] Create `src/lib/dateUtils.ts`

### 2.7 Update handoff.md
- [x] Append summary of Task 2 to `handoff.md`

---

## ✅ Task 3 — Login Page (v1 complete; redesigned in Task 3b)

### 3.1 Build login page UI (`/login`) ✅
### 3.2 Apply Arctic visual theme to login page ✅
### 3.3 Wire up login logic ✅
### 3.4 Update handoff.md ✅

---

## ✅ Task 3b — Login Page Redesign & Auth Persistence

### 3b.1 Auth persistence
- [x] Switch teammate session from `sessionStorage` to `localStorage` in `src/lib/auth.ts`
- [x] Update admin code constant in `src/lib/auth.ts`
- [x] Confirm `logoutTeammate()` and `getCurrentTeammate()` use `localStorage`
- [x] Admin session remains in `sessionStorage` (no change)

### 3b.2 Redesign `/login` page (full-screen Arctic scene)
- [x] Remove centered frosted-glass card layout
- [x] Add "S.S. Barakah" title + tagline at the top of the page
- [x] Large ship SVG centered, slightly tilted (~5°)
- [x] Massive threatening iceberg on one side, smaller iceberg on the other
- [x] Stars scattered in upper portion
- [x] Animated wave layer covering bottom ~25% of screen
- [x] Full-width frosted "Crew Access" panel docked to the bottom edge

### 3b.3 Icy error modal
- [x] Create `src/components/IcyErrorModal.tsx`
- [x] Replace inline error message on login page with `IcyErrorModal`

### 3b.4 Update handoff.md
- [x] Append summary of Task 3b to `handoff.md`

---

## ✅ Task 3c — Nav Bar & Login Modal

### 3c.1 ConditionalNav wrapper
- [x] Create `src/components/ConditionalNav.tsx`
- [x] Add `<ConditionalNav />` to `src/app/layout.tsx`

### 3c.2 NavBar component (`src/components/NavBar.tsx`)
- [x] Fixed top bar with Arctic styling
- [x] Left: `⚓ S.S. Barakah` logo linking to `/`
- [x] Center: Ship · History · Admin links — active page underlined
- [x] Right (logged out): `Board Ship →` button — opens login modal on click
- [x] Right (logged in): teammate initial circle + name + `▾` — dropdown with "My Dashboard" and "Log Out"
- [x] Dropdown closes on outside click
- [x] Read current teammate from `localStorage` on mount

### 3c.3 Mobile hamburger
- [x] Center links collapse into `☰` button on mobile
- [x] Hamburger opens a frosted dark drawer
- [x] Drawer closes on outside tap or link click

### 3c.4 Login modal (`src/components/LoginModal.tsx`)
- [x] Modal overlay on current page
- [x] Ship silhouette, title, name input, password input, "Board →" button
- [x] On failure: show `IcyErrorModal`
- [x] On success: store in `localStorage`, redirect to `/teammate/[id]`
- [x] Dismissible by clicking outside the modal

### 3c.5 Clean up teammate dashboard
- [x] Remove bottom nav buttons from teammate dashboard

### 3c.6 Update handoff.md
- [x] Append summary of Task 3c to `handoff.md`

---

## ✅ Task 4 — Teammate Dashboard Page

### 4.1–4.6 Full dashboard built
- [x] Display teammate name, badge, today's tasks, points, streak
- [x] Auth guard: redirect to `/login` if no session
- [x] Task completion with optimistic UI
- [x] Repeatable tasks with counter
- [x] Add custom task form
- [x] Select from preset tasks modal
- [x] Recurring task toggle

### 4.7 Update handoff.md
- [x] Append summary of Task 4 to `handoff.md`

---

## ✅ Task 5 — Daily Task Creation & Completion Logic

### 5.1–5.4 All logic implemented
- [x] Recurring tasks seeded on page load with duplicate check
- [x] Repeatable task enforcement (disabled at max, shows count/max)
- [x] Optimistic UI update + Supabase re-fetch on error
- [x] Points recalculate after every completion
- [x] `calculateDisplayPoints` and `isTaskCompletable` added to `calculations.ts` (TDD)

### 5.5 Update handoff.md
- [x] Append summary of Task 5 to `handoff.md`

---

## ✅ Task 6 — Preset Task System

### 6.1–6.3
- [x] Created `src/components/tasks/PresetTaskSelector.tsx`
- [x] Exports `PresetTaskSelector`, `PresetRow`, `Field`, `Toggle`, `inputStyle`
- [x] Teammate dashboard imports from new file; dashboard file ~100 lines shorter

### 6.4 Update handoff.md
- [x] Append summary of Task 6 to `handoff.md`

---

## ✅ Task 7 — Main Ship Dashboard

### 7.1–7.5
- [x] Public page at `/` — no auth required
- [x] Arctic ocean background, 30 pre-computed stars
- [x] Ship SVG with three-wrapper pattern (centering + tilt + bob)
- [x] Ship tilt: −15° at 0% → 0° at 100%; −30° + translateY if sunk
- [x] 4 worker circles with panic/calm/celebrate animations
- [x] Two-layer animated waves (dark behind, light in front)
- [x] Two icebergs with float animation
- [x] Mission status chip (fixed top-left) + countdown (fixed top-right)
- [x] Progress bar (fixed bottom)
- [x] Scroll → deep abyss effect with data section below
- [x] Chad/Chud badge cards
- [x] Crew leaderboard
- [x] Recent repairs feed
- [x] Polls Supabase every 15 seconds
- [x] "No repairs assigned yet" state when no required tasks

### 7.6 Update handoff.md
- [x] Append summary of Task 7 to `handoff.md`

---

## ✅ Task 8 — Progress Calculation

### 8.1–8.3
- [x] `calculateTeamProgress` in `calculations.ts`
- [x] `getProgressState` in `calculations.ts`
- [x] Progress bar wired to live polled data
- [x] Mission status chip colour-coded to progress state
- [x] "No repairs assigned yet" message when `totalRequired === 0`

### 8.4 Update handoff.md
- [x] Append summary of Task 8 to `handoff.md`

---

## ✅ Icy Modal System & Delete Task (2026-06-06)

- [x] Created `src/components/IcyModal.tsx` — shared base wrapper with SVG icicles, glossy-ice card, backdrop blur, ESC key handler, role="dialog"
- [x] Retrofitted `IcyErrorModal` and `LoginModal` to use `IcyModal`
- [x] Created `DeleteConfirmModal` with today-only / forever variants for recurring tasks
- [x] Added red ✕ delete button to `TaskRow`; wired `deleteTask` handler in teammate dashboard

> **Note for all future tasks:** Any new modal must use `<IcyModal>` as its wrapper. Do not hand-roll backdrop/card styles.

---

## ✅ Recurring Task Detection Bugfix (2026-06-06)

- [x] Fixed `isRecurring` detection logic — custom tasks (preset_task_id=null) now matched by name, not excluded by null guard
- [x] Added `fetchRecurringTasks` callback; called after every insert into `recurring_tasks` so state stays fresh
- [x] Fixed `deleteTask` "forever" scope to delete `recurring_tasks` rule for custom tasks (was silently skipping them)

---

## ✅ "Repeatable (in a single day)" Label Rename (2026-06-06)

- [x] In `src/app/teammate/[teammateId]/page.tsx`: Toggle label `"Repeatable"` → `"Repeatable (in a single day)"`
- [x] In `src/app/teammate/[teammateId]/page.tsx`: Field label `"Max completions per day"` → `"How many times in a single day?"`
- [x] In `src/components/tasks/PresetTaskSelector.tsx`: checked — no matching labels found
- [x] Verified counter and `isTaskCompletable()` still work
- [x] All 47 tests passing
- [x] Committed and pushed

---

## ✅ Custom Task Points — Three Fixed Options (2026-06-06)

- [x] Replaced free-entry points input with three toggle buttons: Small (5 pts), Medium (10 pts, default), Large (15 pts)
- [x] Selected option highlights in ice-blue
- [x] No logic changes — `form.points` drives everything downstream identically
- [x] Committed and pushed

---

## ✅ Preset Task Fixes (2026-06-06)

- [x] Fixed recurring bug: removed `&& preset.can_be_recurring` guard in `addPresetTask` — any preset task can now be made recurring
- [x] Renamed "Attend Islamic class" → "Attend Halaqa/Dars in Person"
- [x] Renamed "Read 10 pages" → "Reading Regular Book" (20 pts, not repeatable in a single day)
- [x] Removed "Code for 1 hour"
- [x] Client-side sort in `PresetTaskSelector.tsx` enforces Islamic and Regular task display order
- [x] Migration `supabase/migrations/003_update_preset_tasks.sql` created (must be run in Supabase SQL editor)
- [x] Seed file `002_seed_data.sql` updated to match final state
- [x] Committed and pushed

---

## ✅ Task 9 — Leaderboard (2026-06-06)

### 9.1–9.3
- [x] Created `src/types/leaderboard.ts` — shared `LeaderboardEntry` and `RecentCompletion` interfaces
- [x] Created `src/components/leaderboard/Leaderboard.tsx` — approved row design: amber #1 glow, avatar circles, inline Chad/Chud badges, `✓ all X/X tasks done` status line
- [x] Created `src/components/leaderboard/RecentRepairsFeed.tsx` — recent repairs feed component
- [x] Wired both into `src/app/page.tsx`; removed 45 lines of inline markup
- [x] Fixed empty-name crash guard in avatar initial render
- [x] All 47 tests still passing

### 9.4 Update handoff.md
- [x] Append summary of Task 9 to `handoff.md`

---

## ✅ Task 10 — Chad/Chud Badge Logic

### 10.1 Implement Chad calculation
- [x] `calculateChad`: teammate with highest `points_earned` for the day
- [x] Handle ties: show first by teammate ID if needed

### 10.2 Implement Chud calculation
- [x] `calculateChud`: only eligible if `missed_required_tasks > 0`
- [x] Among eligible: lowest points first; tiebreak by most missed tasks; tiebreak by teammate ID
- [x] If nobody failed: Chud = null

### 10.3 Badge display components
- [x] Create `src/components/leaderboard/BadgeDisplay.tsx`
- [x] Show "Chad of the Day: [name]" on dashboard
- [x] Show "Chud of the Day: [name]" or "Chud: None. Everyone completed their tasks."

### 10.4 Persist current badge state
- [x] Update `current_chad` and `current_chud` on `teammates` table after finalization
- [x] Badges persist on dashboard until next finalization

### 10.5 Update handoff.md
- [x] Append summary of Task 10 to `handoff.md`

---

## ✅ Task 11 — Admin Dashboard

### 11.1 Build admin code gate
- [x] Create `src/components/admin/AdminCodeGate.tsx`
- [x] Show code input before revealing admin dashboard
- [x] Validate using `validateAdminCode()` from `src/lib/auth.ts`
- [x] Store admin access in `sessionStorage` for current session only

### 11.2 Teammate management UI
- [x] Create `src/components/admin/TeammateManager.tsx`
- [x] Add teammate (name, password)
- [x] Remove teammate (soft-delete via `is_active = false` or hard delete)
- [x] Edit teammate name
- [x] Change teammate password
- [x] Activate/deactivate teammate toggle

### 11.3 Preset task management UI
- [x] Create `src/components/admin/PresetTaskManager.tsx` (as `MissionsSection.tsx`)
- [x] Create / edit / delete preset task
- [x] Set Islamic category flag, point values, repeatable rules

### 11.4 Team status view in admin
- [x] Show today's team completion status
- [x] List all teammates and their current tasks + completion state

### 11.5 Manual day finalization trigger
- [x] Button to manually run `finalizeDay()` from admin dashboard
- [x] Confirmation prompt before triggering

### 11.6 Update handoff.md
- [x] Append summary of Task 11 to `handoff.md`

---

## ✅ Task 12 — Daily Finalization

### 12.1 Implement `finalizeDay` in `finalization.ts`
- [x] Steps 1–11: get teammates, calculate results, save daily_results, save teammate_daily_stats, update badges, generate next-day recurring tasks

### 12.2 Auto-trigger finalization on app open
- [x] Check if yesterday has been finalized; if not, call `finalizeDay(yesterday)`

### 12.3 Admin manual trigger
- [x] Wire "Manually trigger day finalization" button in admin dashboard to `finalizeDay`

### 12.4 Update handoff.md
- [x] Append summary of Task 12 to `handoff.md`

---

## ✅ Task 13 — History/Stats Page

Design approved 2026-06-06. Spec: `docs/superpowers/specs/2026-06-06-task-13-history-stats-page.md`

Single file: `src/app/history/page.tsx` — three sections:

### 13.1 Fleet Summary
- [x] 4-chip grid: Days Survived, Current Streak 🔥, Days Sunk, Survival Rate
- [x] Streak = consecutive survived days going backwards from latest finalized day

### 13.2 Crew All-Time Records
- [x] One card per active teammate, sorted by total all-time points desc
- [x] Large avatar (56px), name (22px), Chad/Chud count pills (13px)
- [x] Total Points + Tasks Done at 36px bold; top scorer amber, others ice-blue
- [x] 20×3 heatmap (60 cells, 14×14px) — warm colour scale, red = missed required

### 13.3 Daily Log
- [x] One card per `daily_results` row, newest first
- [x] Outcome icon (⛵/🌊), date, title, Chad/Chud/crew chips, completion %
- [x] Empty state: "No voyages recorded yet."

### 13.4 Update handoff.md
- [x] Append summary of Task 13 to `handoff.md`

---

## Task 14 — Heatmap on Teammate Dashboard

Heatmaps on `/history` are implemented as part of Task 13. Task 14 covers adding the same heatmap to the individual teammate dashboard page.

### 14.1–14.2
- [x] Add personal heatmap (20×3, same warm colour scale) to `src/app/teammate/[teammateId]/page.tsx`
- [x] Source data from `teammate_daily_stats` for the logged-in teammate only

### 14.3 Update handoff.md
- [x] Append summary of Task 14 to `handoff.md`

---

## Task 15 — Pomodoro Timer

### 15.1–15.3
- [ ] Create `src/components/pomodoro/PomodoroTimer.tsx`
- [ ] 25-min focus / 5-min break with auto-switch
- [ ] Start / Pause / Reset buttons; MM:SS display
- [ ] Embed on teammate dashboard

### 15.4 Update handoff.md
- [ ] Append summary of Task 15 to `handoff.md`

---

## Task 16 — Ship Animations & Visual Polish

### 16.1–16.8
- [ ] Ship tilt smooth CSS transition
- [ ] Wave animation keyframes
- [ ] Worker panic / repair / celebrate / sinking states
- [ ] Success overlay ("The ship survived!")
- [ ] Failure/sinking animation (translateY, not iceberg crash); failure overlay with Chud callout
- [ ] Daily intro crash animation (`IntroAnimation.tsx`) — once per day, skippable
- [ ] Alarm sound `public/sounds/alarm.mp3`

### 16.9 Update handoff.md
- [ ] Append summary of Task 16 to `handoff.md`

---

## Task 17 — Mobile Responsiveness

### 17.1–17.5
- [ ] Mobile-first layout pass on all pages
- [ ] Ship scene mobile adaptation (container-relative worker positions)
- [ ] Pomodoro background timer fix (visibilitychange)
- [ ] Touch interaction audit (44px tap targets, no hover-only states)
- [ ] No horizontal scroll at 320px / 375px / 390px

### 17.6 Update handoff.md
- [ ] Append summary of Task 17 to `handoff.md`

---

## Task 18 — Final QA & MVP Verification

### 18.1 Test all Definition of Done criteria (Section 28)
- [ ] Each teammate can log in and stay logged in across browser restarts
- [ ] Login modal works from the nav bar on any page
- [ ] Admin can unlock admin dashboard with the admin code
- [ ] Admin can add/remove teammates and change passwords
- [ ] Teammates can select, complete, and delete daily tasks
- [ ] Preset Islamic tasks exist and are selectable
- [ ] Recurring tasks auto-populate next day
- [ ] Repeatable tasks work with max completion limits
- [ ] Points are awarded correctly
- [ ] Progress bar updates correctly
- [ ] Main ship dashboard reflects progress
- [ ] Ship survives at 100% / sinks if day ends with incomplete required tasks
- [ ] Chad and Chud badges assigned and displayed correctly
- [ ] History/stats page shows past results
- [ ] Heatmaps show individual consistency
- [ ] Pomodoro timer works and continues when tab is in background
- [ ] Daily intro crash animation plays once per day and can be skipped
- [ ] Failure overlay shows ship sinking (not crashing) with Chud badge
- [ ] Consistent Arctic/ocean/iceberg theme throughout
- [ ] All pages render correctly at 320px, 375px, and 768px — no horizontal scroll
- [ ] Ship animations run on mobile Safari and Chrome without overflow
- [ ] All buttons have minimum 44px tap target on mobile

### 18.2 Edge case verification
- [ ] No tasks selected: 0% progress bar with correct message
- [ ] Lowest points but completed everything: no Chud assigned
- [ ] Everyone completes: ship survives, no Chud
- [ ] Multiple Chud candidates: correct tiebreaker logic
- [ ] Repeatable task at max completions: button disabled
- [ ] Recurring task duplicate prevention

### 18.3 Update handoff.md
- [ ] Append final summary of Task 18 to `handoff.md`
