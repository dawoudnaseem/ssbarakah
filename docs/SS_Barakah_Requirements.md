# S.S. Barakah — Product Requirements Document

## 1. Project Overview

**S.S. Barakah** is a minimalistic but interactive team productivity web application designed to help a small friend group stay productive during the summer.

The app turns daily productivity into a shared survival mission. The team is represented by a ship in the Arctic Ocean that has collided with an iceberg and is slowly sinking. Each teammate must complete their chosen daily tasks to help repair the ship. If every teammate completes all required tasks before the end of the day, the ship survives. If even one required task is missed, the ship sinks.

The app combines:

- Team accountability
- Daily productivity tracking
- Friendly competition
- Islamic habit-building
- Pomodoro-based focus sessions
- Animated visual feedback
- Daily badges and leaderboards
- Long-term progress statistics

The tone of the app should be playful, motivating, and slightly dramatic, while still remaining clean, simple, and useful.

---

## 2. Application Name

The application name is:

# S.S. Barakah

The name should appear in the navbar, landing/dashboard page, and app metadata.

Optional tagline:

> Complete your tasks. Save the ship. Earn the barakah.

---

## 3. Core Concept

Each day is a new mission.

The team’s ship has been damaged after hitting an iceberg. Every teammate chooses or receives daily tasks. These tasks represent repairs to the ship.

The team succeeds only if **every teammate completes all of their required daily tasks** before the daily deadline.

Points, leaderboard rankings, and badges are important, but they do **not** determine whether the ship survives. The ship survives based on task completion, not point totals.

### Key Rule

The ship survives only if all required tasks from all teammates are completed by the end of the day.

If even one required task is incomplete, the ship sinks.

---

## 4. MVP Scope

The first version of the app should include the following features:

1. Simple teammate login system
2. Main animated ship dashboard
3. Teammate task page
4. Admin dashboard
5. Daily task selection and completion
6. Preset tasks
7. Recurring tasks
8. Repeatable tasks
9. Pomodoro timer
10. Daily progress bar
11. Daily leaderboard
12. Chad and Chud badge system
13. Ship survival/sinking logic
14. Ship success and failure animations
15. History/Stats page
16. Individual consistency heatmaps
17. Supabase backend
18. Arctic/ocean/iceberg visual theme

---

## 5. Tech Stack

Use the following stack:

### Frontend

- Next.js
- React
- Tailwind CSS

### Backend and Database

- Supabase
- Supabase PostgreSQL database

### Authentication

Use a custom simple authentication system built with Supabase tables.

Do **not** use Supabase Auth for the MVP unless absolutely necessary.

The login system should use:

- Teammate name
- Simple password

Each teammate has their own password.

Passwords can be changed from the admin dashboard.

### Deployment

- Vercel for frontend deployment
- Supabase free tier for backend/database

### Animation

Start with simple frontend animations:

- CSS animations
- Tailwind transitions
- Optional Framer Motion for smoother animations

Avoid complex 3D libraries for MVP.

---

## 6. Authentication Requirements

### 6.1 Teammate Login

The login page should be simple.

Fields:

- Name
- Password

Flow:

1. User enters their name.
2. User enters their password.
3. App checks Supabase `teammates` table.
4. If name and password match, user is logged in locally.
5. Store the active teammate ID in local storage or session storage.
6. Redirect to that teammate’s dashboard page.

### 6.2 Password Simplicity

This app is for a trusted friend group, so the authentication system can be simple.

However, passwords should still not be stored in plain text if possible.

Recommended implementation:

- Store a password hash in the database.
- Compare the entered password against the stored hash through a server-side API route.

If building quickly for MVP, plain text passwords can be temporarily used, but this should be clearly marked as a temporary shortcut and replaced with hashing later.

### 6.3 Admin Access

The admin dashboard is protected by a simple admin code.

Admin code:

```txt
Dawoud Sink
```

Admin access flow:

1. User navigates to `/admin`.
2. App shows an admin code input.
3. User enters the code.
4. If the code matches `Dawoud Sink`, admin dashboard is unlocked.
5. Admin access can be stored in session storage for the current browser session.

The admin dashboard must not be publicly accessible without entering the code.

---

## 7. Initial Teammates

The app should support adding and removing teammates dynamically.

Initial teammates:

- Dawoud
- Araf
- Sufiyan
- Nouho

Each teammate should have:

- ID
- Name
- Password or password hash
- Created date
- Active status
- Current Chad/Chud badge state

---

## 8. Pages and Routes

## 8.1 Login Page

Suggested route:

```txt
/login
```

Purpose:

Allow teammates to log in using their name and password.

Content:

- App name: S.S. Barakah
- Short mission intro
- Name input
- Password input
- Login button
- Error message for invalid login

Visual theme:

- Arctic background
- Floating ship silhouette
- Iceberg illustration
- Dark blue ocean tones

---

## 8.2 Main Ship Dashboard

Suggested route:

```txt
/
```

Purpose:

This is the shared team mission page.

It shows the current state of the ship, team progress, leaderboard, daily badges, and daily mission outcome.

### Required Elements

1. Animated ship scene
2. Arctic ocean background
3. Iceberg near the ship
4. Damaged ship state
5. Faceless worker characters running around the ship
6. Overall task progress bar
7. Daily countdown timer
8. Team leaderboard
9. Daily Chad display
10. Daily Chud display
11. Recent task completions feed
12. Current mission status

### Mission Status Labels

Possible statuses:

- Stable
- Damaged
- Critical
- Survived
- Sunk

### Top Progress Bar

The progress bar should show the percentage of required daily tasks completed across the whole team.

Formula:

```txt
completed_required_tasks / total_required_tasks * 100
```

If total required tasks is zero, display 0% and show a message encouraging teammates to add tasks.

### Progress States

- 0% to 25%: Ship is heavily tilted and panic is high.
- 26% to 50%: Ship is still damaged but improving.
- 51% to 75%: Ship is stabilizing.
- 76% to 99%: Ship is almost repaired.
- 100%: Ship survives.

### Successful Day Animation

When all required tasks are completed:

- Ship stabilizes.
- Workers stop panicking.
- Workers bounce or celebrate.
- Display success message:

```txt
Success! The ship survived.
Good job everyone!
```

### Failed Day Animation

If the deadline passes and at least one required task is incomplete:

- Ship tilts more dramatically.
- Workers panic faster.
- Ship slowly sinks below the ocean.
- Display failure message:

```txt
The ship has sunk.
Some repairs were left unfinished.
```

Then show which teammates missed tasks.

---

## 8.3 Teammate Dashboard Page

Suggested route:

```txt
/teammate/[teammateId]
```

Purpose:

This page is where each teammate manages and completes their own daily tasks.

### Required Elements

1. Teammate name
2. Current badge display
3. Today’s required tasks
4. Completed tasks
5. Points earned today
6. Add task button
7. Select preset task button
8. Repeat every day toggle
9. Pomodoro timer
10. Personal heatmap
11. Current streak
12. Task completion buttons

### Task Completion

Each task should have:

- Task name
- Description, optional
- Point value
- Category
- Required status
- Completed status
- Repeatable status
- Max completions per day, if repeatable
- Current completion count

### Pomodoro Timer

The teammate page should include a Pomodoro timer.

MVP Pomodoro settings:

- 25-minute focus session
- 5-minute break
- Start button
- Pause button
- Reset button

Optional later improvement:

- Let users customize focus and break length.
- Award points for completed Pomodoro sessions.

---

## 8.4 Admin Dashboard

Suggested route:

```txt
/admin
```

Purpose:

Allow management of teammates, passwords, tasks, presets, and basic app settings.

### Admin Access

Before showing the admin dashboard, ask for the admin code.

Correct code:

```txt
Dawoud Sink
```

### Required Admin Features

1. Add teammate
2. Remove teammate
3. Edit teammate name
4. Change teammate password
5. Activate/deactivate teammate
6. Create preset task
7. Edit preset task
8. Delete preset task
9. Set task point values
10. Mark task as Islamic category
11. Set repeatable task rules
12. View today’s team status
13. View all teammates and their current tasks
14. Manually trigger day finalization, if needed

### Password Change

Admin should be able to change a teammate password.

Fields:

- Select teammate
- New password
- Confirm new password
- Save button

---

## 8.5 History/Stats Page

Suggested route:

```txt
/history
```

Purpose:

Show historical productivity, badge records, team outcomes, and individual progress over time.

This page is part of the MVP.

### Required Stats

1. Past ship outcomes
2. Daily winners
3. Daily Chud badge history
4. Individual consistency heatmaps
5. Total points over time
6. Longest streaks
7. Most completed Islamic tasks

### Past Ship Outcomes

Show a timeline or list of past days.

Each day should display:

- Date
- Outcome: Survived or Sunk
- Completion percentage
- Number of completed tasks
- Number of missed tasks

### Daily Winners

Show the Chad of each day.

Fields:

- Date
- Chad name
- Points earned that day

### Daily Chud Badge History

Show who received the Chud badge each day.

Fields:

- Date
- Chud name
- Missed task count

Important:

If everyone completed their tasks, no Chud should be assigned for that day.

### Individual Consistency Heatmaps

Each teammate should have a heatmap showing daily activity.

The heatmap should represent points or task completions.

- More completed tasks or more points = stronger/darker/brighter cell
- No tasks completed = empty or very faint cell
- Successful full completion day can have a distinct visual state

Because the user may have difficulty distinguishing some colors, do not rely on color alone. Also use opacity, borders, symbols, or labels where helpful.

### Total Points Over Time

Show a simple chart for each teammate.

Options:

- Line chart
- Bar chart
- Simple table for MVP if charting takes too long

Data:

- Date
- Teammate
- Points earned

### Longest Streaks

Track the longest streak for each teammate.

A streak means consecutive days where the teammate completed all required tasks.

Display:

- Teammate name
- Current streak
- Longest streak

### Most Completed Islamic Tasks

Show which Islamic tasks were completed the most across the team.

Examples:

- Quran reading
- Seeking ilm
- Praying at the mosque
- Morning adhkar
- Evening adhkar

Display:

- Task name
- Completion count
- Teammate breakdown, optional

---

## 9. Theme and Visual Design

## 9.1 Main Theme

The entire application should use an Arctic/ocean/iceberg theme.

Visual keywords:

- Arctic Ocean
- Icebergs
- Cold water
- Deep navy blue
- Frosted glass UI
- Snowy atmosphere
- Damaged ship
- Floating ice
- Subtle waves
- Night or twilight sky

## 9.2 Style Direction

The app should feel:

- Minimalistic
- Playful
- Dramatic
- Clean
- Slightly cinematic
- Easy to use

Avoid cluttered game UI.

The app should look like a productivity dashboard with a fun animated layer, not like a full video game.

## 9.3 Suggested Color Palette

Use accessible contrast.

Suggested colors:

- Deep navy: `#061826`
- Ocean blue: `#0B3558`
- Ice blue: `#9DD8F7`
- Frost white: `#F2FBFF`
- Warning orange: `#F59E0B`
- Danger red: `#DC2626`
- Success green: `#22C55E`

Because color distinction may be difficult for some users, include icons, labels, and text states instead of relying only on color.

## 9.4 Worker Character Design

Workers should respect Islamic values by avoiding facial features or realistic human representation.

Represent workers as:

- Blacked-out silhouettes
- Simple spheres
- Small shadow characters
- No faces
- No eyes
- No detailed bodies

Workers should move around the ship to show panic or celebration.

Worker states:

- Panicking: quick back-and-forth movement
- Repairing: moving near damaged section
- Celebrating: bouncing or jumping
- Sinking state: running faster or disappearing safely before ship sinks

---

## 10. Task System

## 10.1 Task Types

The app should support different task types.

### Regular Tasks

Examples:

- Workout
- Code for 1 hour
- Study
- Read 10 pages
- Clean room
- Apply to jobs
- Journal

### Islamic Tasks

These are preset tasks related to Islamic growth and should generally be worth more points.

Examples:

- Read Quran
- Seek ilm
- Pray at the mosque
- Morning adhkar
- Evening adhkar
- Memorize Quran
- Review Quran
- Attend Islamic class
- Give sadaqah

### Recurring Tasks

Recurring tasks automatically appear on future days.

Examples:

- Read Quran every day
- Morning adhkar every day
- Seek ilm every Sunday
- Gym every Monday, Wednesday, Friday

### Repeatable Tasks

Repeatable tasks can be completed multiple times in the same day.

Examples:

- Pray at the mosque, max 5 times per day
- Pomodoro session
- Read 10 pages

Important distinction:

- Recurring task = appears again on future days.
- Repeatable task = can be completed multiple times on the same day.

---

## 10.2 Daily Task Selection

Each teammate should be able to select tasks at the beginning of the day.

They can:

1. Select from preset tasks
2. Create a custom task
3. Mark a task as recurring
4. Set a task as repeatable
5. Set max completions per day, if repeatable
6. Set point value, within allowed rules

Tasks selected for the day become required unless marked as optional.

For MVP, all selected daily tasks should be treated as required by default.

---

## 10.3 Task Fields

Each task should include:

- ID
- Teammate ID
- Name
- Description, optional
- Category
- Point value
- Required boolean
- Completed boolean
- Completion count
- Repeatable boolean
- Max completions per day
- Recurring boolean
- Recurrence rule
- Date assigned
- Created at
- Updated at

---

## 10.4 Preset Task Fields

Preset tasks should include:

- ID
- Name
- Description
- Category
- Default point value
- Islamic category boolean
- Repeatable boolean
- Default max completions per day
- Can be recurring boolean
- Created at
- Updated at

---

## 10.5 Suggested Preset Islamic Tasks

| Task | Points | Repeatable | Max Per Day | Notes |
|---|---:|---|---:|---|
| Read Quran | 50 | No | 1 | Can be recurring daily |
| Seek Ilm | 60 | No | 1 | Lecture, class, reading, notes |
| Pray at the mosque | 40 per completion | Yes | 5 | If selected, minimum required is 1 |
| Morning adhkar | 30 | No | 1 | Can be recurring daily |
| Evening adhkar | 30 | No | 1 | Can be recurring daily |
| Memorize Quran | 70 | No | 1 | Strong reward |
| Review Quran | 50 | No | 1 | Useful for consistency |
| Attend Islamic class | 80 | No | 1 | Higher effort |
| Give sadaqah | 50 | No | 1 | Optional preset |

---

## 11. Points System

Points are awarded when a teammate completes tasks.

Points affect:

- Daily leaderboard
- Chad badge
- Heatmap intensity
- Total points over time
- Stats page

Points do **not** determine whether the ship survives.

The ship survives only when all required tasks are complete.

### Important Rule

Doing more tasks gives more points, but it does not make someone automatically better in the core mission.

The core mission is consistency and completing what was committed to.

---

## 12. Badge System

## 12.1 Chad Badge

The Chad badge is given to the teammate with the most points accumulated that day.

Rules:

- Awarded daily.
- Based on total daily points.
- Can be earned even if the ship sinks, unless the team decides otherwise later.
- Displayed on the dashboard the next day.

Example display:

```txt
Chad of the Day: Sufiyan
```

The next day, Sufiyan should still be displayed next to the `Chad` badge until a new daily finalization happens.

---

## 12.2 Chud Badge

The Chud badge is the opposite of Chad.

It is given only if a teammate fails at least one required task.

Rules:

- The Chud badge can only be assigned to someone who missed at least one required task.
- If everyone completed all required tasks, nobody gets Chud.
- If multiple people failed tasks, Chud goes to the failed teammate with the lowest points that day.
- If there is a tie, use the highest missed task count as tiebreaker.
- If still tied, show all tied users or choose the first consistently based on teammate ID.

Example display:

```txt
Chud of the Day: Dawoud
```

The next day, Dawoud should still be displayed next to the `Chud` badge until a new daily finalization happens.

### Important Chud Rule

If a person has the lowest points but did not fail any required tasks, they do **not** receive Chud.

Chud is failure-based, not leaderboard-based.

---

## 12.3 Daily Badge Display

The main dashboard should clearly show both daily badges.

Example:

```txt
Yesterday’s Chad: Sufiyan
Yesterday’s Chud: Dawoud
```

Or:

```txt
Current Badges
Chad: Sufiyan
Chud: Dawoud
```

If there was no Chud:

```txt
Chud: None. Everyone completed their tasks.
```

---

## 13. Daily Finalization Logic

At the end of each day, the app should finalize the mission.

The app needs a daily finalization function.

This can be triggered:

1. Automatically when a user opens the app after the day has ended
2. Manually from the admin dashboard
3. Eventually through a scheduled cron job, optional later

### Finalization Steps

1. Get all active teammates.
2. Get all required tasks for the day.
3. Calculate completed required tasks.
4. Calculate total required tasks.
5. Determine if the ship survived.
6. Calculate each teammate’s daily points.
7. Determine Chad.
8. Determine Chud, only if at least one teammate failed a required task.
9. Save daily result to `daily_results` table.
10. Save badge results.
11. Update teammate current badge fields.
12. Prepare next day recurring tasks.

### Ship Outcome

```txt
If all required tasks are complete:
  outcome = "survived"
Else:
  outcome = "sunk"
```

---

## 14. Supabase Database Schema

## 14.1 teammates

Stores app users.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
name text not null unique,
password_hash text,
plain_password text,
is_active boolean default true,
current_chad boolean default false,
current_chud boolean default false,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

Notes:

- Use either `password_hash` or `plain_password`.
- Prefer `password_hash` for better security.
- `plain_password` should only be used as a temporary MVP shortcut.

---

## 14.2 preset_tasks

Stores reusable task templates.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
name text not null,
description text,
category text not null,
default_points integer not null,
is_islamic boolean default false,
is_repeatable boolean default false,
default_max_completions integer default 1,
can_be_recurring boolean default true,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

---

## 14.3 daily_tasks

Stores actual assigned tasks for a teammate on a specific day.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
teammate_id uuid references teammates(id) on delete cascade,
preset_task_id uuid references preset_tasks(id),
name text not null,
description text,
category text not null,
points integer not null,
is_required boolean default true,
is_completed boolean default false,
is_repeatable boolean default false,
max_completions integer default 1,
completion_count integer default 0,
task_date date not null,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

---

## 14.4 recurring_tasks

Stores tasks that should automatically appear on future days.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
teammate_id uuid references teammates(id) on delete cascade,
preset_task_id uuid references preset_tasks(id),
name text not null,
description text,
category text not null,
points integer not null,
is_required boolean default true,
is_repeatable boolean default false,
max_completions integer default 1,
recurrence_type text not null,
recurrence_days text[],
is_active boolean default true,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

Possible `recurrence_type` values:

- daily
- weekly
- custom_days

---

## 14.5 task_completions

Stores each completion event.

This is useful for repeatable tasks and detailed history.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
daily_task_id uuid references daily_tasks(id) on delete cascade,
teammate_id uuid references teammates(id) on delete cascade,
points_awarded integer not null,
completed_at timestamp with time zone default now(),
task_date date not null
```

---

## 14.6 daily_results

Stores the team result for each day.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
result_date date not null unique,
outcome text not null,
completion_percentage numeric not null,
total_required_tasks integer not null,
completed_required_tasks integer not null,
missed_required_tasks integer not null,
chad_teammate_id uuid references teammates(id),
chud_teammate_id uuid references teammates(id),
created_at timestamp with time zone default now()
```

Possible `outcome` values:

- survived
- sunk

If no Chud exists, `chud_teammate_id` should be null.

---

## 14.7 teammate_daily_stats

Stores individual daily stats.

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
teammate_id uuid references teammates(id) on delete cascade,
stat_date date not null,
points_earned integer default 0,
total_required_tasks integer default 0,
completed_required_tasks integer default 0,
missed_required_tasks integer default 0,
completed_all_required boolean default false,
is_chad boolean default false,
is_chud boolean default false,
created_at timestamp with time zone default now(),
unique(teammate_id, stat_date)
```

---

## 15. Main Calculations

## 15.1 Team Completion Percentage

```txt
completed_required_tasks / total_required_tasks * 100
```

## 15.2 Teammate Daily Points

```txt
sum(points_awarded from task_completions where teammate_id = current user and task_date = today)
```

For non-repeatable tasks, points are awarded once.

For repeatable tasks, points are awarded per completion until max completions is reached.

## 15.3 Chad Calculation

```txt
teammate with highest points_earned for the day
```

## 15.4 Chud Calculation

Only calculate Chud if at least one teammate missed a required task.

```txt
eligible_chuds = teammates where missed_required_tasks > 0
chud = eligible_chuds sorted by points_earned ascending, missed_required_tasks descending
```

If no teammate missed a required task:

```txt
chud = null
```

## 15.5 Streak Calculation

A teammate’s streak increases when they complete all required tasks for a day.

If they miss at least one required task, their current streak resets to 0.

---

## 16. Heatmap Requirements

Each teammate should have a heatmap that shows their consistency over time.

The heatmap should be visible:

- On teammate dashboard
- On history/stats page

Each cell represents one day.

Cell intensity can be based on:

- Points earned that day
- Number of tasks completed that day
- Completion percentage that day

Recommended MVP approach:

Use points earned as the main value.

Intensity levels:

- 0 points: empty/faint
- Low points: light
- Medium points: medium
- High points: strong
- Very high points: strongest

Accessibility note:

Do not rely on color only. Use tooltips, labels, borders, or intensity differences.

Tooltip should show:

- Date
- Points earned
- Tasks completed
- Whether all required tasks were completed

---

## 17. Leaderboard Requirements

The leaderboard should reset daily.

It should show:

- Teammate rank
- Name
- Points earned today
- Completed required tasks
- Missed required tasks
- Badge, if any

Important:

Daily leaderboard points reset every day, but historical points are saved in the stats page.

---

## 18. Ship Animation Requirements

## 18.1 Animation States

The ship should visually respond to team progress.

### State 1: Critical Damage

Progress: 0% to 25%

- Ship heavily tilted
- Water splashing
- Workers panicking quickly
- Damage/smoke visible

### State 2: Damaged

Progress: 26% to 50%

- Ship still tilted
- Workers moving quickly
- Damage visible but slightly reduced

### State 3: Stabilizing

Progress: 51% to 75%

- Ship tilt reduced
- Workers less panicked
- Fewer damage effects

### State 4: Almost Repaired

Progress: 76% to 99%

- Ship nearly stable
- Workers repairing calmly
- Water calmer

### State 5: Success

Progress: 100%

- Ship stable
- Workers celebrate
- Success message appears

### State 6: Sunk

End of day failure

- Ship tilts downward
- Ship sinks below water line
- Failure message appears

---

## 18.2 Animation Implementation Notes

For MVP:

- Use CSS transforms for ship tilt.
- Use CSS keyframes for waves.
- Use absolutely positioned divs for workers.
- Use simple circles/spheres for workers.
- Use Framer Motion only if helpful.

Avoid overbuilding the animation system.

The ship animation should be impressive enough to feel fun, but simple enough to build quickly.

---

## 19. UI Components

Suggested reusable components:

- `ShipScene`
- `ProgressBar`
- `Leaderboard`
- `BadgeDisplay`
- `TaskCard`
- `TaskForm`
- `PresetTaskSelector`
- `PomodoroTimer`
- `Heatmap`
- `StatsChart`
- `AdminCodeGate`
- `TeammateManager`
- `PresetTaskManager`
- `DailyResultCard`
- `RecentActivityFeed`

---

## 20. Suggested Folder Structure

```txt
src/
  app/
    page.tsx
    login/
      page.tsx
    teammate/
      [teammateId]/
        page.tsx
    admin/
      page.tsx
    history/
      page.tsx
  components/
    ship/
      ShipScene.tsx
      Worker.tsx
      Iceberg.tsx
      Waves.tsx
    tasks/
      TaskCard.tsx
      TaskForm.tsx
      PresetTaskSelector.tsx
    leaderboard/
      Leaderboard.tsx
      BadgeDisplay.tsx
    stats/
      Heatmap.tsx
      StatsChart.tsx
      DailyResultCard.tsx
    admin/
      AdminCodeGate.tsx
      TeammateManager.tsx
      PresetTaskManager.tsx
    pomodoro/
      PomodoroTimer.tsx
  lib/
    supabaseClient.ts
    auth.ts
    dateUtils.ts
    calculations.ts
    finalization.ts
  styles/
    globals.css
```

---

## 21. Supabase Client

Create a Supabase client file.

Suggested file:

```txt
src/lib/supabaseClient.ts
```

The app should read these environment variables:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not expose service role keys on the frontend.

---

## 22. Important Business Logic Files

## 22.1 calculations.ts

Should contain:

- calculateTeamProgress
- calculateDailyPoints
- calculateChad
- calculateChud
- calculateStreaks
- calculateHeatmapValues

## 22.2 finalization.ts

Should contain:

- finalizeDay
- createDailyResult
- createTeammateDailyStats
- assignDailyBadges
- createNextDayRecurringTasks

## 22.3 auth.ts

Should contain:

- loginTeammate
- logoutTeammate
- getCurrentTeammate
- validateAdminCode
- changeTeammatePassword

---

## 23. MVP User Stories

### Teammate Login

As a teammate, I want to log in with my name and password so I can access my task dashboard.

### View Ship Status

As a teammate, I want to view the ship dashboard so I know whether the team is on track.

### Select Tasks

As a teammate, I want to select my daily tasks so I can commit to what I will complete today.

### Complete Tasks

As a teammate, I want to mark tasks as complete so I can earn points and help save the ship.

### Use Pomodoro

As a teammate, I want to use a Pomodoro timer so I can focus on my tasks.

### View Leaderboard

As a teammate, I want to see the daily leaderboard so I know who is leading that day.

### See Chad and Chud

As a teammate, I want to see who is the Chad and Chud of the day so the team has a funny daily accountability system.

### Manage Teammates

As an admin, I want to add, remove, and edit teammates so the team can change over time.

### Change Passwords

As an admin, I want to change teammate passwords so each person can have a simple private login.

### View Stats

As a teammate, I want to see history and stats so I can track long-term consistency.

---

## 24. Edge Cases

### No Tasks Selected

If no teammates have selected tasks yet:

- Progress bar should show 0%.
- Ship should be in idle damaged state.
- Show message:

```txt
No repairs assigned yet. Choose your tasks to begin today’s mission.
```

### Someone Has Lowest Points But Completed Everything

They should not get Chud.

Chud requires failure.

### Everyone Completes Their Tasks

- Ship survives.
- Chad is assigned to highest points.
- Chud is null.
- Dashboard says everyone completed their tasks.

### Multiple Chud Candidates

If multiple people failed:

1. Choose the failed person with the lowest points.
2. If tied, choose the one with the most missed tasks.
3. If still tied, either show multiple Chuds or choose deterministically by teammate ID.

### Repeatable Task Completion Limit

If a task has max completions of 5, the user cannot complete it a 6th time.

### Recurring Task Duplicate Prevention

When generating recurring tasks for the day, do not create duplicates if the task already exists for that teammate and date.

---

## 25. Future Features After MVP

Possible future features:

1. Emergency repair shield if the team has a long streak
2. Push notifications
3. Mobile app version
4. Weekly team recap
5. Islamic reminder quotes
6. Team duaa of the day
7. Custom ship skins
8. Difficulty modes
9. Friend groups/multiple crews
10. Public shareable stats
11. Better animated cutscenes
12. Sound effects, optional and muted by default
13. Prayer time API integration
14. Automatic Islamic task reminders

---

## 26. Development Priorities

Build in this order:

1. Supabase schema
2. Supabase client setup
3. Login page
4. Teammate dashboard
5. Daily task creation and completion
6. Preset task system
7. Main ship dashboard
8. Progress calculation
9. Leaderboard
10. Chad/Chud badge logic
11. Admin dashboard
12. Daily finalization
13. History/stats page
14. Heatmaps
15. Pomodoro timer
16. Ship animations and polish

---

## 27. Definition of Done for MVP

The MVP is complete when:

1. Each teammate can log in with name and password.
2. Admin can unlock admin dashboard with `Dawoud Sink`.
3. Admin can add/remove teammates.
4. Admin can change teammate passwords.
5. Teammates can select daily tasks.
6. Teammates can complete daily tasks.
7. Preset Islamic tasks exist.
8. Recurring tasks can be created.
9. Repeatable tasks work with max completion limits.
10. Points are awarded correctly.
11. Progress bar updates correctly.
12. Main ship dashboard reflects progress.
13. Ship survives at 100% completion.
14. Ship sinks if the day ends with incomplete required tasks.
15. Chad badge is assigned to highest daily points.
16. Chud badge is assigned only to someone who failed a task.
17. Daily badges display clearly on the dashboard.
18. History/stats page shows past results.
19. Heatmaps show individual consistency.
20. Pomodoro timer works.
21. The app uses a consistent Arctic/ocean/iceberg theme.

---

## 28. Final Product Vision

S.S. Barakah is a team accountability app where productivity becomes a shared survival mission. Every day, the team boards a damaged ship in the Arctic Ocean. Every completed task repairs the ship. If everyone fulfills their commitments, the ship survives. If even one repair is left unfinished, the ship sinks.

The app should feel simple, funny, motivating, and meaningful. It should help teammates stay consistent, build better habits, compete lightly, and encourage Islamic growth through higher-value spiritual tasks.

