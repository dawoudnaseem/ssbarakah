# S.S. Barakah — Task List

> Build order follows Section 27 of the requirements document (updated 2026-06-05).
> After completing each task, append a summary to `handoff.md`.
> Tasks marked ✅ are complete — see `handoff.md` for details.

---

## ✅ Task 1 — Project Setup & Supabase Schema

### 1.1 Initialize Next.js project
- [ ] Run `npx create-next-app@latest` with TypeScript, Tailwind CSS, App Router
- [ ] Install dependencies: `@supabase/supabase-js`, `framer-motion` (optional)
- [ ] Set up `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `.env.local` to `.gitignore`

### 1.2 Set up Supabase project
- [ ] Create a new Supabase project
- [ ] Note down project URL and anon key

### 1.3 Create database tables
- [ ] Create `teammates` table (id, name, password_hash, plain_password, is_active, current_chad, current_chud, created_at, updated_at)
- [ ] Create `preset_tasks` table (id, name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring, created_at, updated_at)
- [ ] Create `daily_tasks` table (id, teammate_id, preset_task_id, name, description, category, points, is_required, is_completed, is_repeatable, max_completions, completion_count, task_date, created_at, updated_at)
- [ ] Create `recurring_tasks` table (id, teammate_id, preset_task_id, name, description, category, points, is_required, is_repeatable, max_completions, recurrence_type, recurrence_days, is_active, created_at, updated_at)
- [ ] Create `task_completions` table (id, daily_task_id, teammate_id, points_awarded, completed_at, task_date)
- [ ] Create `daily_results` table (id, result_date, outcome, completion_percentage, total_required_tasks, completed_required_tasks, missed_required_tasks, chad_teammate_id, chud_teammate_id, created_at)
- [ ] Create `teammate_daily_stats` table (id, teammate_id, stat_date, points_earned, total_required_tasks, completed_required_tasks, missed_required_tasks, completed_all_required, is_chad, is_chud, created_at) with unique constraint on (teammate_id, stat_date)

### 1.4 Seed initial data
- [ ] Insert initial teammates: Dawoud, Araf, Sufiyan, Nouho (with plain_password for MVP)
- [ ] Insert preset Islamic tasks from Section 10.5 (Read Quran, Seek Ilm, Pray at mosque, Morning adhkar, Evening adhkar, Memorize Quran, Review Quran, Attend Islamic class, Give sadaqah)

### 1.5 Update handoff.md
- [ ] Append summary of Task 1 to `handoff.md`

---

## ✅ Task 2 — Supabase Client & Project Structure

### 2.1 Create folder structure
- [ ] Set up `src/app/` directory with page files for `/`, `/login`, `/teammate/[teammateId]`, `/admin`, `/history`
- [ ] Create `src/components/` subdirectories: `ship/`, `tasks/`, `leaderboard/`, `stats/`, `admin/`, `pomodoro/`
- [ ] Create `src/lib/` directory

### 2.2 Create Supabase client
- [ ] Create `src/lib/supabaseClient.ts` reading from env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2.3 Create auth utilities
- [ ] Create `src/lib/auth.ts` with:
  - `loginTeammate(name, password)` — query teammates table, compare password
  - `logoutTeammate()` — clear session/local storage
  - `getCurrentTeammate()` — read from storage
  - `validateAdminCode(code)` — compare against "Dawoud Sink"
  - `changeTeammatePassword(teammateId, newPassword)` — update in Supabase

### 2.4 Create calculations utilities
- [ ] Create `src/lib/calculations.ts` with:
  - `calculateTeamProgress(dailyTasks)` — completed / total required * 100
  - `calculateDailyPoints(teammateId, date)` — sum from task_completions
  - `calculateChad(teammateDailyStats)` — highest points_earned
  - `calculateChud(teammateDailyStats)` — lowest points among those with missed tasks
  - `calculateStreaks(teammateId)` — consecutive days with completed_all_required = true
  - `calculateHeatmapValues(teammateId)` — points per day over time

### 2.5 Create finalization utilities
- [ ] Create `src/lib/finalization.ts` with:
  - `finalizeDay(date)` — orchestrates all finalization steps
  - `createDailyResult(date, outcome, stats)` — insert into daily_results
  - `createTeammateDailyStats(date)` — insert per-teammate stats
  - `assignDailyBadges(date)` — determine and store Chad/Chud
  - `createNextDayRecurringTasks(date)` — generate recurring tasks for next day

### 2.6 Create date utilities
- [ ] Create `src/lib/dateUtils.ts` with helpers for today's date, date comparisons, and day boundaries

### 2.7 Update handoff.md
- [ ] Append summary of Task 2 to `handoff.md`

---

## ✅ Task 3 — Login Page (v1 complete; redesign required — see Task 3b)

> Original build complete. Design changed per 2026-06-05 UI overhaul spec. Task 3b below covers the rebuild.

### 3.1 Build login page UI (`/login`) ✅
### 3.2 Apply Arctic visual theme to login page ✅
### 3.3 Wire up login logic ✅
### 3.4 Update handoff.md ✅

---

## Task 3b — Login Page Redesign & Auth Persistence

> Spec: `docs/superpowers/specs/2026-06-05-ui-overhaul-design.md`

### 3b.1 Auth persistence
- [ ] Switch teammate session from `sessionStorage` to `localStorage` in `src/lib/auth.ts`
- [ ] Update admin code constant from `"Dawoud Sink"` to the new code in `src/lib/auth.ts`
- [ ] Confirm `logoutTeammate()` and `getCurrentTeammate()` use `localStorage`
- [ ] Admin session remains in `sessionStorage` (no change)

### 3b.2 Redesign `/login` page (full-screen Arctic scene)
- [ ] Remove centered frosted-glass card layout
- [ ] Add "S.S. Barakah" title + tagline at the top of the page
- [ ] Large ship SVG centered, slightly tilted (~5°)
- [ ] Massive threatening iceberg on one side, smaller iceberg on the other
- [ ] Stars scattered in upper portion
- [ ] Animated wave layer covering bottom ~25% of screen
- [ ] Full-width frosted "Crew Access" panel docked to the bottom edge
  - Label: "Crew Access" + "Board the ship to begin" subtext
  - Name input · Password input · "Board →" button — horizontal row on desktop
  - On mobile: inputs stack vertically within the panel

### 3b.3 Icy error modal
- [ ] Create `src/components/IcyErrorModal.tsx` — frosted glass, red-tinted border (`#DC2626` accent), dismiss on click or outside tap
- [ ] Replace inline error message on login page with `IcyErrorModal`

### 3b.4 Update handoff.md
- [ ] Append summary of Task 3b to `handoff.md`

---

## Task 3c — Nav Bar & Login Modal

> Spec: `docs/superpowers/specs/2026-06-05-ui-overhaul-design.md`

### 3c.1 ConditionalNav wrapper
- [ ] Create `src/components/ConditionalNav.tsx` — client component that uses `usePathname()` to render `<NavBar />` on all pages except `/login`
- [ ] Add `<ConditionalNav />` to `src/app/layout.tsx`

### 3c.2 NavBar component (`src/components/NavBar.tsx`)
- [ ] Fixed top bar with Arctic styling (dark background, `#9DD8F7` accents)
- [ ] Left: `⚓ S.S. Barakah` logo linking to `/`
- [ ] Center: Ship · History · Admin links — active page underlined
- [ ] Right (logged out): `Board Ship →` button — opens login modal on click
- [ ] Right (logged in): teammate initial circle + name + `▾` — opens dropdown with "My Dashboard" and "Log Out"
- [ ] Dropdown closes on outside click
- [ ] Read current teammate from `localStorage` via `getCurrentTeammate()` on mount

### 3c.3 Mobile hamburger
- [ ] Center links collapse into `☰` button on mobile
- [ ] Hamburger opens a frosted dark drawer sliding down with stacked links: Ship · History · Admin
- [ ] Drawer closes on outside tap or link click

### 3c.4 Login modal (`src/components/LoginModal.tsx`)
- [ ] Modal overlay on current page (no navigation)
- [ ] Ship silhouette, "S.S. Barakah" title, name input, password input, "Board →" button
- [ ] Calls `loginTeammate()` on submit
- [ ] On failure: show `IcyErrorModal`
- [ ] On success: store in `localStorage`, close modal, update NavBar right side, redirect to `/teammate/[id]`
- [ ] Dismissible by clicking outside the modal

### 3c.5 Clean up teammate dashboard
- [ ] Remove bottom nav buttons from `src/app/teammate/[teammateId]/page.tsx` (now handled by NavBar)

### 3c.6 Update handoff.md
- [ ] Append summary of Task 3c to `handoff.md`

---

## ✅ Task 4 — Teammate Dashboard Page

### 4.1 Build teammate dashboard UI (`/teammate/[teammateId]`)
- [ ] Display teammate name
- [ ] Display current badge (Chad/Chud) if assigned
- [ ] Show today's required tasks list
- [ ] Show completed tasks list
- [ ] Show points earned today
- [ ] Add task button
- [ ] Select preset task button
- [ ] Repeat every day toggle
- [ ] Personal heatmap (placeholder for now)
- [ ] Current streak display
- [ ] Task completion buttons

### 4.2 Load teammate and task data
- [ ] Fetch teammate info from Supabase on page load
- [ ] Fetch today's daily_tasks for the teammate
- [ ] Guard: redirect to `/login` if no active session

### 4.3 Task completion interaction
- [ ] Mark task as complete (update `is_completed = true` in `daily_tasks`)
- [ ] Insert record into `task_completions`
- [ ] For repeatable tasks: increment `completion_count`, block if at `max_completions`
- [ ] Update displayed points after completion

### 4.4 Add custom task
- [ ] Form: name, description (optional), category, points, is_required, is_repeatable, max_completions, is_recurring
- [ ] Insert into `daily_tasks` for today

### 4.5 Select from preset tasks
- [ ] Show modal or dropdown with preset_tasks from Supabase
- [ ] On selection, insert into `daily_tasks` for today with preset defaults

### 4.6 Recurring task toggle
- [ ] When creating or selecting a task, allow "repeat every day" toggle
- [ ] If toggled, also insert into `recurring_tasks`

### 4.7 Update handoff.md
- [ ] Append summary of Task 4 to `handoff.md`

---

## Task 5 — Daily Task Creation & Completion Logic

### 5.1 Daily task initialization
- [ ] On login or page load, check if recurring tasks need to be generated for today
- [ ] Call `createNextDayRecurringTasks` if needed (prevent duplicates — check by teammate_id + task_date before inserting)

### 5.2 Repeatable task enforcement
- [ ] Ensure completion button is disabled when `completion_count >= max_completions`
- [ ] Display current completions vs max (e.g., "3 / 5")

### 5.3 Task completion state sync
- [ ] Optimistic UI update on complete click
- [ ] Re-fetch or update local state after Supabase write

### 5.4 Points real-time update
- [ ] Recalculate and re-display daily points after each completion

### 5.5 Update handoff.md
- [ ] Append summary of Task 5 to `handoff.md`

---

## Task 6 — Preset Task System

### 6.1 Build preset task selector component
- [ ] Create `src/components/tasks/PresetTaskSelector.tsx`
- [ ] Fetch all preset_tasks from Supabase
- [ ] Display tasks grouped by category (Islamic vs Regular)
- [ ] Show default points and repeatable info for each

### 6.2 Preset task fields display
- [ ] Name, description, category, default_points
- [ ] Islamic badge indicator for `is_islamic = true`
- [ ] Repeatable indicator and max completions

### 6.3 Admin preset task management (placeholder; full UI in Task 11)
- [ ] Ensure CRUD operations on preset_tasks are wired in admin section

### 6.4 Update handoff.md
- [ ] Append summary of Task 6 to `handoff.md`

---

## Task 7 — Main Ship Dashboard

### 7.1 Build main dashboard page (`/`)
- [ ] Arctic ocean background
- [ ] Animated ship scene (ShipScene component)
- [ ] Iceberg element
- [ ] Overall team progress bar
- [ ] Daily countdown timer (time remaining until end of day)
- [ ] Team leaderboard section
- [ ] Daily Chad display
- [ ] Daily Chud display
- [ ] Recent task completions feed
- [ ] Current mission status label (Stable / Damaged / Critical / Survived / Sunk)

### 7.2 Create ShipScene component
- [ ] Create `src/components/ship/ShipScene.tsx`
- [ ] Ship SVG or CSS illustration
- [ ] CSS tilt transform tied to progress percentage
- [ ] Iceberg (`src/components/ship/Iceberg.tsx`)
- [ ] Wave animation (`src/components/ship/Waves.tsx`)
- [ ] Worker characters (`src/components/ship/Worker.tsx`) — faceless silhouettes/spheres only

### 7.3 Worker animation states
- [ ] Panicking state: quick back-and-forth CSS keyframe
- [ ] Repairing state: slow movement near damaged area
- [ ] Celebrating state: bounce/jump animation
- [ ] Sinking state: run faster then fade out

### 7.4 Progress states driving ship visuals
- [ ] 0–25%: heavy tilt, high panic workers
- [ ] 26–50%: tilted, moderate workers
- [ ] 51–75%: reducing tilt, calmer
- [ ] 76–99%: nearly stable, calm repair workers
- [ ] 100%: stable, celebrating workers, success message
- [ ] End-of-day sunk: sink animation, failure message listing missed teammates

### 7.5 Recent activity feed
- [ ] Create `src/components/leaderboard/RecentActivityFeed.tsx` (or similar)
- [ ] Poll or subscribe to latest task_completions in real-time (Supabase realtime or periodic fetch)
- [ ] Display: teammate name, task name, time

### 7.6 Update handoff.md
- [ ] Append summary of Task 7 to `handoff.md`

---

## Task 8 — Progress Calculation

### 8.1 Team completion percentage
- [ ] Implement `calculateTeamProgress` in `calculations.ts`
- [ ] Formula: `completed_required_tasks / total_required_tasks * 100`
- [ ] Handle edge case: 0 total tasks → show 0% with "No repairs assigned yet" message

### 8.2 Wire progress bar to live data
- [ ] Progress bar fetches today's daily_tasks across all teammates
- [ ] Updates in near real-time (polling or Supabase subscription)

### 8.3 Mission status label logic
- [ ] Map percentage ranges to status labels: Stable, Damaged, Critical, Survived, Sunk

### 8.4 Update handoff.md
- [ ] Append summary of Task 8 to `handoff.md`

---

## Task 9 — Leaderboard

### 9.1 Build leaderboard component
- [ ] Create `src/components/leaderboard/Leaderboard.tsx`
- [ ] Display: rank, name, points today, completed required tasks, missed required tasks, badge

### 9.2 Leaderboard data fetching
- [ ] Query `task_completions` grouped by `teammate_id` for today
- [ ] Sort by `points_earned` descending

### 9.3 Daily reset
- [ ] Leaderboard only shows today's data (filtered by `task_date = today`)
- [ ] Historical points viewable in `/history` only

### 9.4 Update handoff.md
- [ ] Append summary of Task 9 to `handoff.md`

---

## Task 10 — Chad/Chud Badge Logic

### 10.1 Implement Chad calculation
- [ ] `calculateChad`: teammate with highest `points_earned` for the day
- [ ] Handle ties: show first by teammate ID if needed

### 10.2 Implement Chud calculation
- [ ] `calculateChud`: only eligible if `missed_required_tasks > 0`
- [ ] Among eligible: lowest points first; tiebreak by most missed tasks; tiebreak by teammate ID
- [ ] If nobody failed: Chud = null

### 10.3 Badge display components
- [ ] Create `src/components/leaderboard/BadgeDisplay.tsx`
- [ ] Show "Chad of the Day: [name]" on dashboard
- [ ] Show "Chud of the Day: [name]" or "Chud: None. Everyone completed their tasks."

### 10.4 Persist current badge state
- [ ] Update `current_chad` and `current_chud` on `teammates` table after finalization
- [ ] Badges persist on dashboard until next finalization

### 10.5 Update handoff.md
- [ ] Append summary of Task 10 to `handoff.md`

---

## Task 11 — Admin Dashboard

### 11.1 Build admin code gate
- [ ] Create `src/components/admin/AdminCodeGate.tsx`
- [ ] Show code input before revealing admin dashboard
- [ ] Validate using `validateAdminCode()` from `src/lib/auth.ts` (code is hardcoded there, not in this component)
- [ ] Store admin access in `sessionStorage` for current session only

### 11.2 Teammate management UI
- [ ] Create `src/components/admin/TeammateManager.tsx`
- [ ] Add teammate (name, password)
- [ ] Remove teammate (soft-delete via `is_active = false` or hard delete)
- [ ] Edit teammate name
- [ ] Change teammate password (select teammate, new password, confirm, save)
- [ ] Activate/deactivate teammate toggle

### 11.3 Preset task management UI
- [ ] Create `src/components/admin/PresetTaskManager.tsx`
- [ ] Create preset task (all fields from schema)
- [ ] Edit preset task
- [ ] Delete preset task
- [ ] Set Islamic category flag
- [ ] Set point values
- [ ] Set repeatable rules and max completions

### 11.4 Team status view in admin
- [ ] Show today's team completion status
- [ ] List all teammates and their current tasks + completion state

### 11.5 Manual day finalization trigger
- [ ] Button to manually run `finalizeDay()` from admin dashboard
- [ ] Confirmation prompt before triggering

### 11.6 Update handoff.md
- [ ] Append summary of Task 11 to `handoff.md`

---

## Task 12 — Daily Finalization

### 12.1 Implement `finalizeDay` in `finalization.ts`
- [ ] Step 1: Get all active teammates
- [ ] Step 2: Get all required tasks for the day
- [ ] Step 3: Calculate completed vs total required tasks
- [ ] Step 4: Determine ship outcome (survived / sunk)
- [ ] Step 5: Calculate each teammate's daily points
- [ ] Step 6: Determine Chad
- [ ] Step 7: Determine Chud (only if someone failed)
- [ ] Step 8: Save daily result to `daily_results`
- [ ] Step 9: Save per-teammate stats to `teammate_daily_stats`
- [ ] Step 10: Update `current_chad` and `current_chud` on `teammates`
- [ ] Step 11: Generate next day recurring tasks (de-duplicate check)

### 12.2 Auto-trigger finalization on app open
- [ ] On app load, check if yesterday has been finalized (no record in `daily_results` for yesterday)
- [ ] If not, call `finalizeDay(yesterday)`

### 12.3 Admin manual trigger
- [ ] Wire "Manually trigger day finalization" button in admin dashboard to `finalizeDay`

### 12.4 Update handoff.md
- [ ] Append summary of Task 12 to `handoff.md`

---

## Task 13 — History/Stats Page

### 13.1 Build history page (`/history`)
- [ ] Page layout with sections: Past Ship Outcomes, Daily Winners, Chud History, Individual Heatmaps, Points Over Time, Longest Streaks, Most Completed Islamic Tasks

### 13.2 Past ship outcomes
- [ ] Create `src/components/stats/DailyResultCard.tsx`
- [ ] Fetch all records from `daily_results` ordered by date
- [ ] Display: date, outcome (Survived/Sunk), completion %, completed tasks count, missed tasks count

### 13.3 Daily winners list
- [ ] For each day in `daily_results`, show Chad name and points earned

### 13.4 Chud history
- [ ] For each day in `daily_results`, show Chud name and missed task count
- [ ] If no Chud, show "None — everyone completed tasks"

### 13.5 Total points over time
- [ ] Create `src/components/stats/StatsChart.tsx`
- [ ] Fetch `teammate_daily_stats` grouped by teammate and date
- [ ] Render as simple table for MVP (or bar/line chart if time allows)

### 13.6 Longest streaks
- [ ] Use `calculateStreaks` from `calculations.ts`
- [ ] Display: teammate name, current streak, longest streak

### 13.7 Most completed Islamic tasks
- [ ] Query `task_completions` joined with `daily_tasks` where `category = 'islamic'` or `preset_tasks.is_islamic = true`
- [ ] Aggregate by task name, sort by count descending
- [ ] Display: task name, total completions, optional teammate breakdown

### 13.8 Update handoff.md
- [ ] Append summary of Task 13 to `handoff.md`

---

## Task 14 — Heatmaps

### 14.1 Build heatmap component
- [ ] Create `src/components/stats/Heatmap.tsx`
- [ ] Grid layout: each cell = one day
- [ ] Intensity levels based on `points_earned`: 0 (empty/faint), low, medium, high, very high

### 14.2 Accessibility
- [ ] Do not rely on color alone — use opacity, border, or symbols in addition
- [ ] Add tooltip on hover showing: date, points, tasks completed, whether all required tasks completed

### 14.3 Heatmap placement
- [ ] Include personal heatmap on teammate dashboard (`/teammate/[teammateId]`)
- [ ] Include all teammate heatmaps on history page (`/history`)

### 14.4 Data source
- [ ] Use `calculateHeatmapValues(teammateId)` from `calculations.ts`
- [ ] Source data from `teammate_daily_stats`

### 14.5 Update handoff.md
- [ ] Append summary of Task 14 to `handoff.md`

---

## Task 15 — Pomodoro Timer

### 15.1 Build Pomodoro timer component
- [ ] Create `src/components/pomodoro/PomodoroTimer.tsx`
- [ ] 25-minute focus session countdown
- [ ] 5-minute break countdown
- [ ] Start button
- [ ] Pause button
- [ ] Reset button
- [ ] Visual timer display (MM:SS)

### 15.2 Timer states
- [ ] Focus state (25 min countdown)
- [ ] Break state (5 min countdown)
- [ ] Auto-switch from focus to break on completion

### 15.3 Embed on teammate dashboard
- [ ] Include `PomodoroTimer` component on `/teammate/[teammateId]` page

### 15.4 Update handoff.md
- [ ] Append summary of Task 15 to `handoff.md`

---

## Task 16 — Ship Animations & Visual Polish

### 16.1 Ship tilt animation
- [ ] CSS `transform: rotate()` driven by progress percentage
- [ ] Smooth transition as progress changes

### 16.2 Wave animation
- [ ] CSS keyframes for repeating wave motion on `Waves.tsx`

### 16.3 Worker animations
- [ ] Panic: fast back-and-forth keyframe
- [ ] Repair: slow lateral movement
- [ ] Celebrate: bounce keyframe
- [ ] Sinking state: speed up then fade/disappear

### 16.4 Success animation
- [ ] Ship straightens to 0 tilt
- [ ] Workers switch to celebrate state
- [ ] Overlay success message: "Success! The ship survived. Good job everyone!"

### 16.5 Failure/sinking animation
- [ ] Ship tilts further then translates downward into the ocean (CSS `translateY`) — does NOT crash into iceberg
- [ ] Workers speed up then disappear one by one
- [ ] Iceberg remains as static background element
- [ ] Failure overlay fades in with:
  - "The ship has sunk."
  - List of teammates who missed required tasks
  - Chud badge callout: "💀 Chud of the Day: [name] — [X] tasks missed, [Y] points"

### 16.6 Daily intro crash animation (`src/components/IntroAnimation.tsx`)
- [ ] Check `localStorage` key `ss_barakah_last_intro` on app load — play if stored date ≠ today
- [ ] "Skip ›" button fixed at bottom-right throughout entire sequence
- [ ] Sequence:
  1. Dark fade-in → ocean + stars + large ship sailing left to right (ship takes ~75% of screen width)
  2. Dialog bubble — Araf: "Yo, word on the street is there's an iceberg in front of us."
  3. ~1s pause → Dawoud: "Wdym bro?"
  4. ~1s pause → Everyone: "AHHHHHHHHHHH"
  5. Large iceberg slides in fast from right edge
  6. Full-screen pulsing red alarm overlay — play alarm sound from `public/sounds/alarm.mp3` (silent if autoplay blocked)
  7. Screen shake keyframe + crack SVG animates onto hull
  8. Alarm fades, ship settles tilted with crack
  9. Crossfade → main dashboard
- [ ] On complete or skip: write `ss_barakah_last_intro = todayString()` to `localStorage`
- [ ] Dialog bubbles positioned relative to ship container (not viewport) for mobile correctness
- [ ] Source a short royalty-free alarm sound and place in `public/sounds/alarm.mp3`

### 16.7 Progress state visual transitions
- [ ] Smoothly interpolate ship tilt across 5 progress states
- [ ] Worker panic speed tied to state

### 16.8 Global theme polish
- [ ] Apply color palette throughout app (`#061826`, `#0B3558`, `#9DD8F7`, `#F2FBFF`, `#F59E0B`, `#DC2626`, `#22C55E`)
- [ ] Frosted glass card style for UI panels
- [ ] Consistent Arctic atmosphere across all pages

### 16.9 Update handoff.md
- [ ] Append summary of Task 16 to `handoff.md`

---

## Task 17 — Mobile Responsiveness

### 17.1 Mobile-first layout pass on all pages
- [ ] Apply Tailwind mobile-first breakpoints to Login page (full-width inputs, scaled ship silhouette)
- [ ] Apply responsive stacking to Main Ship Dashboard (status → ship scene → progress bar → badges → leaderboard → activity feed)
- [ ] Apply responsive stacking to Teammate Dashboard (name/badge → points/streak → task list → Pomodoro → add task → heatmap)
- [ ] Apply responsive layout to Admin Dashboard (stack all forms, make tables horizontally scrollable or card-collapsed)
- [ ] Apply responsive layout to History/Stats page (heatmaps scroll horizontally, charts fall back to table if needed)

### 17.2 Ship scene mobile adaptation
- [ ] Wrap ShipScene in a fixed-size container (300px × 200px on mobile, 600px × 350px on desktop via responsive class)
- [ ] Convert all worker positions from viewport-relative to container-percentage-relative
- [ ] Confirm no overflow at 320px viewport width

### 17.3 Pomodoro background timer fix
- [ ] Add `visibilitychange` event listener in `PomodoroTimer.tsx`
- [ ] On tab hidden: record `hiddenAt = Date.now()`
- [ ] On tab visible: compute `elapsed = Date.now() - hiddenAt`, subtract from remaining time
- [ ] Test on iOS Safari and Android Chrome (tab switching and screen lock)

### 17.4 Touch interaction audit
- [ ] Ensure all buttons and task completion controls are minimum 44px tall
- [ ] Remove any hover-only states (tooltip content must also be accessible on tap)
- [ ] Confirm modals and dropdowns dismiss on outside tap

### 17.5 No horizontal scroll check
- [ ] Test every page at 320px, 375px, and 390px widths
- [ ] Fix any element causing `overflow-x` on the page

### 17.6 Update handoff.md
- [ ] Append summary of Task 17 to `handoff.md`

---

## Task 18 — Final QA & MVP Verification

### 18.1 Test all Definition of Done criteria (Section 28)
- [ ] Each teammate can log in with name and password and stay logged in across browser restarts
- [ ] Login modal works from the nav bar on any page
- [ ] Admin can unlock admin dashboard with the admin code
- [ ] Admin can add/remove teammates
- [ ] Admin can change teammate passwords
- [ ] Teammates can select daily tasks
- [ ] Teammates can complete daily tasks
- [ ] Preset Islamic tasks exist and are selectable
- [ ] Recurring tasks are created and auto-populate next day
- [ ] Repeatable tasks work with max completion limits
- [ ] Points are awarded correctly
- [ ] Progress bar updates correctly
- [ ] Main ship dashboard reflects progress
- [ ] Ship survives at 100% completion
- [ ] Ship sinks if day ends with incomplete required tasks
- [ ] Chad badge assigned to highest daily points
- [ ] Chud badge assigned only to someone who failed a task
- [ ] Daily badges display clearly on dashboard
- [ ] History/stats page shows past results
- [ ] Heatmaps show individual consistency
- [ ] Pomodoro timer works and continues when tab is in background
- [ ] Daily intro crash animation plays once per day and can be skipped
- [ ] Failure overlay shows ship sinking (not crashing) with Chud badge displayed
- [ ] App uses consistent Arctic/ocean/iceberg theme
- [ ] All pages render correctly at 320px, 375px, and 768px with no horizontal scroll
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
