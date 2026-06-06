# Project Setup & Core Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the S.S. Barakah Next.js project with all Supabase SQL migrations, TypeScript database types, and all core library utilities (auth, calculations, finalization, dateUtils, supabaseClient).

**Architecture:** Next.js App Router with a `src/` directory. All Supabase interaction happens through a single typed client in `src/lib/supabaseClient.ts`. Business logic lives in focused single-responsibility files under `src/lib/`. Database types live in `src/types/database.ts` and are shared across the entire app. SQL migrations live in `supabase/migrations/` so they can be tracked in git and run manually in the Supabase dashboard.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, @supabase/supabase-js

---

## File Map

| File | Purpose |
|---|---|
| `package.json` | Created by create-next-app, extended with supabase-js |
| `.env.local.example` | Template for environment variables |
| `supabase/migrations/001_create_tables.sql` | All 7 table definitions |
| `supabase/migrations/002_seed_data.sql` | Initial teammates + preset Islamic tasks |
| `src/types/database.ts` | TypeScript interfaces matching every table row |
| `src/lib/supabaseClient.ts` | Singleton Supabase browser client |
| `src/lib/dateUtils.ts` | Date string helpers (no external dependencies) |
| `src/lib/calculations.ts` | Pure functions: progress, Chad, Chud, streaks, heatmap |
| `src/lib/auth.ts` | Login, logout, session storage, admin code |
| `src/lib/finalization.ts` | Daily finalization orchestrator + recurring task generator |
| `src/__tests__/dateUtils.test.ts` | Unit tests for dateUtils |
| `src/__tests__/calculations.test.ts` | Unit tests for calculations |

---

## Task 1: Next.js Project Scaffold

**Files:**
- Create: project root (via create-next-app)
- Create: `.env.local.example`
- Create: `supabase/migrations/001_create_tables.sql`
- Create: `supabase/migrations/002_seed_data.sql`

- [ ] **Step 1: Initialize Next.js project**

Run from the project directory (existing `docs/` folder is safe — create-next-app ignores non-conflicting directories):

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-import-alias --eslint --yes
```

Expected output ends with: `Success! Created ... inside ...`

- [ ] **Step 2: Install Supabase JS client**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npm install @supabase/supabase-js
```

Expected: `added N packages`

- [ ] **Step 3: Create environment variable template**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Also create `.env.local` (git-ignored) with the same keys as placeholders — the user will fill in real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
```

- [ ] **Step 4: Verify .gitignore covers .env.local**

Check that `.gitignore` (created by create-next-app) contains `.env.local`. It does by default — no action needed if present.

Run:
```bash
grep ".env.local" "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah/.gitignore"
```
Expected: `.env*.local`

- [ ] **Step 5: Create Supabase migrations directory and table definitions**

Create `supabase/migrations/001_create_tables.sql`:

```sql
-- teammates: app users with simple password auth
create table if not exists teammates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text,
  plain_password text,
  is_active boolean default true,
  current_chad boolean default false,
  current_chud boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- preset_tasks: reusable task templates managed by admin
create table if not exists preset_tasks (
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
);

-- daily_tasks: actual assigned tasks for a teammate on a specific day
create table if not exists daily_tasks (
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
);

-- recurring_tasks: tasks that auto-generate on future days
create table if not exists recurring_tasks (
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
  recurrence_type text not null check (recurrence_type in ('daily', 'weekly', 'custom_days')),
  recurrence_days text[],
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- task_completions: each individual completion event (supports repeatable tasks)
create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  daily_task_id uuid references daily_tasks(id) on delete cascade,
  teammate_id uuid references teammates(id) on delete cascade,
  points_awarded integer not null,
  completed_at timestamp with time zone default now(),
  task_date date not null
);

-- daily_results: finalized team outcome for each day
create table if not exists daily_results (
  id uuid primary key default gen_random_uuid(),
  result_date date not null unique,
  outcome text not null check (outcome in ('survived', 'sunk')),
  completion_percentage numeric not null,
  total_required_tasks integer not null,
  completed_required_tasks integer not null,
  missed_required_tasks integer not null,
  chad_teammate_id uuid references teammates(id),
  chud_teammate_id uuid references teammates(id),
  created_at timestamp with time zone default now()
);

-- teammate_daily_stats: per-teammate aggregated stats for each day
create table if not exists teammate_daily_stats (
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
);
```

- [ ] **Step 6: Create seed data**

Create `supabase/migrations/002_seed_data.sql`:

```sql
-- Initial teammates (plain_password used for MVP; replace with hashes later)
insert into teammates (name, plain_password, is_active) values
  ('Dawoud', 'dawoud123', true),
  ('Araf',   'araf123',   true),
  ('Sufiyan','sufiyan123',true),
  ('Nouho',  'nouho123',  true)
on conflict (name) do nothing;

-- Preset Islamic tasks (from requirements Section 10.5)
insert into preset_tasks (name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring) values
  ('Read Quran',          'Daily Quran reading session',                  'islamic', 50, true,  false, 1, true),
  ('Seek Ilm',            'Lecture, class, reading, or notes',            'islamic', 60, true,  false, 1, true),
  ('Pray at the mosque',  'Attending prayer at the masjid',               'islamic', 40, true,  true,  5, true),
  ('Morning adhkar',      'Morning remembrance routine',                  'islamic', 30, true,  false, 1, true),
  ('Evening adhkar',      'Evening remembrance routine',                  'islamic', 30, true,  false, 1, true),
  ('Memorize Quran',      'New memorization session',                     'islamic', 70, true,  false, 1, false),
  ('Review Quran',        'Review previously memorized portions',         'islamic', 50, true,  false, 1, true),
  ('Attend Islamic class','Formal Islamic class or halaqah',              'islamic', 80, true,  false, 1, false),
  ('Give sadaqah',        'Give voluntary charity',                       'islamic', 50, true,  false, 1, false)
on conflict do nothing;

-- Common regular preset tasks
insert into preset_tasks (name, description, category, default_points, is_islamic, is_repeatable, default_max_completions, can_be_recurring) values
  ('Workout',             'Any physical exercise session',                'health',  40, false, false, 1, true),
  ('Code for 1 hour',     'Focused coding session',                      'work',    30, false, false, 1, true),
  ('Study',               'Studying for school or self-improvement',      'work',    30, false, false, 1, true),
  ('Read 10 pages',       'Read 10 pages of any non-fiction book',        'growth',  20, false, true,  3, true),
  ('Clean room',          'Tidy and clean personal space',                'life',    20, false, false, 1, false),
  ('Apply to jobs',       'Submit job applications',                      'work',    35, false, false, 1, true),
  ('Journal',             'Write a journal entry',                        'growth',  20, false, false, 1, true)
on conflict do nothing;
```

- [ ] **Step 7: Commit Task 1**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
git add .
git commit -m "feat: scaffold Next.js project, add Supabase SQL migrations and seed data"
```

Expected: commit hash printed

---

## Task 2: TypeScript Types + Core Library Utilities

**Files:**
- Create: `src/types/database.ts`
- Create: `src/lib/supabaseClient.ts`
- Create: `src/lib/dateUtils.ts`
- Create: `src/lib/calculations.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/finalization.ts`
- Create: `src/__tests__/dateUtils.test.ts`
- Create: `src/__tests__/calculations.test.ts`

- [ ] **Step 1: Create database TypeScript types**

Create `src/types/database.ts`:

```typescript
export interface Teammate {
  id: string
  name: string
  password_hash: string | null
  plain_password: string | null
  is_active: boolean
  current_chad: boolean
  current_chud: boolean
  created_at: string
  updated_at: string
}

export interface PresetTask {
  id: string
  name: string
  description: string | null
  category: string
  default_points: number
  is_islamic: boolean
  is_repeatable: boolean
  default_max_completions: number
  can_be_recurring: boolean
  created_at: string
  updated_at: string
}

export interface DailyTask {
  id: string
  teammate_id: string
  preset_task_id: string | null
  name: string
  description: string | null
  category: string
  points: number
  is_required: boolean
  is_completed: boolean
  is_repeatable: boolean
  max_completions: number
  completion_count: number
  task_date: string
  created_at: string
  updated_at: string
}

export interface RecurringTask {
  id: string
  teammate_id: string
  preset_task_id: string | null
  name: string
  description: string | null
  category: string
  points: number
  is_required: boolean
  is_repeatable: boolean
  max_completions: number
  recurrence_type: 'daily' | 'weekly' | 'custom_days'
  recurrence_days: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: string
  daily_task_id: string
  teammate_id: string
  points_awarded: number
  completed_at: string
  task_date: string
}

export interface DailyResult {
  id: string
  result_date: string
  outcome: 'survived' | 'sunk'
  completion_percentage: number
  total_required_tasks: number
  completed_required_tasks: number
  missed_required_tasks: number
  chad_teammate_id: string | null
  chud_teammate_id: string | null
  created_at: string
}

export interface TeammateDailyStat {
  id: string
  teammate_id: string
  stat_date: string
  points_earned: number
  total_required_tasks: number
  completed_required_tasks: number
  missed_required_tasks: number
  completed_all_required: boolean
  is_chad: boolean
  is_chud: boolean
  created_at: string
}
```

- [ ] **Step 2: Create Supabase client**

Create `src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Write failing tests for dateUtils**

Create `src/__tests__/dateUtils.test.ts`:

```typescript
import {
  toDateString,
  todayString,
  yesterdayString,
  tomorrowString,
  dayOfWeek,
  endOfDayHasPassed,
} from '@/lib/dateUtils'

describe('toDateString', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(toDateString(new Date('2026-06-05T15:00:00Z'))).toBe('2026-06-05')
  })
})

describe('todayString', () => {
  it('returns a string matching YYYY-MM-DD format', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('yesterdayString', () => {
  it('returns the day before today', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    expect(yesterdayString()).toBe(toDateString(yesterday))
  })
})

describe('tomorrowString', () => {
  it('returns the day after today', () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    expect(tomorrowString()).toBe(toDateString(tomorrow))
  })
})

describe('dayOfWeek', () => {
  it('returns Thursday for 2026-06-04', () => {
    expect(dayOfWeek('2026-06-04')).toBe('Thursday')
  })
  it('returns Friday for 2026-06-05', () => {
    expect(dayOfWeek('2026-06-05')).toBe('Friday')
  })
  it('returns Sunday for 2026-06-07', () => {
    expect(dayOfWeek('2026-06-07')).toBe('Sunday')
  })
})

describe('endOfDayHasPassed', () => {
  it('returns true for a past date', () => {
    expect(endOfDayHasPassed('2020-01-01')).toBe(true)
  })
  it('returns false for today', () => {
    expect(endOfDayHasPassed(todayString())).toBe(false)
  })
  it('returns false for a future date', () => {
    expect(endOfDayHasPassed('2099-12-31')).toBe(false)
  })
})
```

- [ ] **Step 4: Run failing tests (expect FAIL)**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx jest src/__tests__/dateUtils.test.ts --no-coverage 2>&1 | tail -20
```

Expected: `Cannot find module '@/lib/dateUtils'` or similar failure.

- [ ] **Step 5: Create dateUtils implementation**

Create `src/lib/dateUtils.ts`:

```typescript
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function todayString(): string {
  return toDateString(new Date())
}

export function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}

export function tomorrowString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateString(d)
}

// Uses noon local time to avoid DST edge cases on date parsing
export function dayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(dateStr + 'T12:00:00').getDay()]
}

export function endOfDayHasPassed(dateStr: string): boolean {
  return dateStr < todayString()
}
```

- [ ] **Step 6: Run dateUtils tests (expect PASS)**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx jest src/__tests__/dateUtils.test.ts --no-coverage
```

Expected: `Tests: 8 passed`

- [ ] **Step 7: Write failing tests for calculations**

Create `src/__tests__/calculations.test.ts`:

```typescript
import {
  calculateTeamProgress,
  calculateDailyPoints,
  calculateChad,
  calculateChud,
  getProgressState,
  calculateHeatmapValues,
  calculateCurrentStreak,
  calculateLongestStreak,
} from '@/lib/calculations'
import type { DailyTask, TaskCompletion, TeammateDailyStat } from '@/types/database'

const baseStat = (override: Partial<TeammateDailyStat>): TeammateDailyStat => ({
  id: '1',
  teammate_id: 'a',
  stat_date: '2026-06-01',
  points_earned: 0,
  total_required_tasks: 2,
  completed_required_tasks: 2,
  missed_required_tasks: 0,
  completed_all_required: true,
  is_chad: false,
  is_chud: false,
  created_at: '',
  ...override,
})

const baseTask = (override: Partial<DailyTask>): DailyTask => ({
  id: '1',
  teammate_id: 'a',
  preset_task_id: null,
  name: 'Task',
  description: null,
  category: 'work',
  points: 10,
  is_required: true,
  is_completed: false,
  is_repeatable: false,
  max_completions: 1,
  completion_count: 0,
  task_date: '2026-06-05',
  created_at: '',
  updated_at: '',
  ...override,
})

describe('calculateTeamProgress', () => {
  it('returns 0 when no tasks', () => {
    expect(calculateTeamProgress([])).toBe(0)
  })
  it('returns 0 when no required tasks are completed', () => {
    expect(calculateTeamProgress([baseTask({ is_completed: false })])).toBe(0)
  })
  it('returns 100 when all required tasks are completed', () => {
    expect(calculateTeamProgress([baseTask({ is_completed: true })])).toBe(100)
  })
  it('returns 50 when half are done', () => {
    const tasks = [
      baseTask({ id: '1', is_completed: true }),
      baseTask({ id: '2', is_completed: false }),
    ]
    expect(calculateTeamProgress(tasks)).toBe(50)
  })
  it('ignores non-required tasks', () => {
    const tasks = [
      baseTask({ id: '1', is_required: false, is_completed: false }),
      baseTask({ id: '2', is_required: true, is_completed: true }),
    ]
    expect(calculateTeamProgress(tasks)).toBe(100)
  })
})

describe('calculateDailyPoints', () => {
  it('returns 0 for empty completions', () => {
    expect(calculateDailyPoints([])).toBe(0)
  })
  it('sums all points_awarded', () => {
    const completions: TaskCompletion[] = [
      { id: '1', daily_task_id: 'dt1', teammate_id: 'a', points_awarded: 30, completed_at: '', task_date: '2026-06-05' },
      { id: '2', daily_task_id: 'dt2', teammate_id: 'a', points_awarded: 50, completed_at: '', task_date: '2026-06-05' },
    ]
    expect(calculateDailyPoints(completions)).toBe(80)
  })
})

describe('calculateChad', () => {
  it('returns null for empty stats', () => {
    expect(calculateChad([])).toBeNull()
  })
  it('returns the teammate with most points', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 40 }),
      baseStat({ teammate_id: 'b', points_earned: 90 }),
      baseStat({ teammate_id: 'c', points_earned: 60 }),
    ]
    expect(calculateChad(stats)).toBe('b')
  })
})

describe('calculateChud', () => {
  it('returns null if nobody missed a task', () => {
    const stats = [baseStat({ missed_required_tasks: 0 })]
    expect(calculateChud(stats)).toBeNull()
  })
  it('returns lowest-points failing teammate', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 100, missed_required_tasks: 1 }),
      baseStat({ teammate_id: 'b', points_earned: 20,  missed_required_tasks: 1 }),
    ]
    expect(calculateChud(stats)).toBe('b')
  })
  it('does not assign Chud to someone who completed everything', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 5,  missed_required_tasks: 0 }),
      baseStat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 2 }),
    ]
    expect(calculateChud(stats)).toBe('b')
  })
  it('breaks tie by most missed tasks', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 10, missed_required_tasks: 1 }),
      baseStat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 3 }),
    ]
    expect(calculateChud(stats)).toBe('b')
  })
})

describe('getProgressState', () => {
  it('returns sunk when isSunk is true', () => {
    expect(getProgressState(80, true)).toBe('sunk')
  })
  it('returns survived at 100%', () => {
    expect(getProgressState(100, false)).toBe('survived')
  })
  it('returns critical at 0-25%', () => {
    expect(getProgressState(0, false)).toBe('critical')
    expect(getProgressState(25, false)).toBe('critical')
  })
  it('returns damaged at 26-50%', () => {
    expect(getProgressState(26, false)).toBe('damaged')
    expect(getProgressState(50, false)).toBe('damaged')
  })
  it('returns stabilizing at 51-75%', () => {
    expect(getProgressState(51, false)).toBe('stabilizing')
    expect(getProgressState(75, false)).toBe('stabilizing')
  })
  it('returns almost_repaired at 76-99%', () => {
    expect(getProgressState(76, false)).toBe('almost_repaired')
    expect(getProgressState(99, false)).toBe('almost_repaired')
  })
})

describe('calculateHeatmapValues', () => {
  it('returns empty object for no stats', () => {
    expect(calculateHeatmapValues([])).toEqual({})
  })
  it('maps stat_date to points_earned', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', points_earned: 50 }),
      baseStat({ stat_date: '2026-06-02', points_earned: 80 }),
    ]
    expect(calculateHeatmapValues(stats)).toEqual({ '2026-06-01': 50, '2026-06-02': 80 })
  })
})

describe('calculateCurrentStreak', () => {
  it('returns 0 for no stats', () => {
    expect(calculateCurrentStreak([])).toBe(0)
  })
  it('returns consecutive streak from most recent day', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', completed_all_required: false }),
      baseStat({ stat_date: '2026-06-02', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-03', completed_all_required: true }),
    ]
    expect(calculateCurrentStreak(stats)).toBe(2)
  })
  it('resets on a missed day', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-02', completed_all_required: false }),
      baseStat({ stat_date: '2026-06-03', completed_all_required: true }),
    ]
    expect(calculateCurrentStreak(stats)).toBe(1)
  })
})

describe('calculateLongestStreak', () => {
  it('returns 0 for no stats', () => {
    expect(calculateLongestStreak([])).toBe(0)
  })
  it('returns the longest consecutive run', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-02', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-03', completed_all_required: false }),
      baseStat({ stat_date: '2026-06-04', completed_all_required: true }),
    ]
    expect(calculateLongestStreak(stats)).toBe(2)
  })
})
```

- [ ] **Step 8: Run failing calculations tests (expect FAIL)**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx jest src/__tests__/calculations.test.ts --no-coverage 2>&1 | tail -10
```

Expected: `Cannot find module '@/lib/calculations'`

- [ ] **Step 9: Create calculations implementation**

Create `src/lib/calculations.ts`:

```typescript
import type { DailyTask, TaskCompletion, TeammateDailyStat } from '@/types/database'

export function calculateTeamProgress(dailyTasks: DailyTask[]): number {
  const required = dailyTasks.filter(t => t.is_required)
  if (required.length === 0) return 0
  const completed = required.filter(t => t.is_completed).length
  return Math.round((completed / required.length) * 100)
}

export function calculateDailyPoints(completions: TaskCompletion[]): number {
  return completions.reduce((sum, c) => sum + c.points_awarded, 0)
}

export function calculateChad(stats: TeammateDailyStat[]): string | null {
  if (stats.length === 0) return null
  return [...stats].sort((a, b) => b.points_earned - a.points_earned)[0].teammate_id
}

export function calculateChud(stats: TeammateDailyStat[]): string | null {
  const eligible = stats.filter(s => s.missed_required_tasks > 0)
  if (eligible.length === 0) return null
  return [...eligible].sort((a, b) => {
    if (a.points_earned !== b.points_earned) return a.points_earned - b.points_earned
    if (a.missed_required_tasks !== b.missed_required_tasks) return b.missed_required_tasks - a.missed_required_tasks
    return a.teammate_id.localeCompare(b.teammate_id)
  })[0].teammate_id
}

export type ProgressState = 'critical' | 'damaged' | 'stabilizing' | 'almost_repaired' | 'survived' | 'sunk'

export function getProgressState(percentage: number, isSunk: boolean): ProgressState {
  if (isSunk) return 'sunk'
  if (percentage === 100) return 'survived'
  if (percentage <= 25) return 'critical'
  if (percentage <= 50) return 'damaged'
  if (percentage <= 75) return 'stabilizing'
  return 'almost_repaired'
}

export function calculateHeatmapValues(stats: TeammateDailyStat[]): Record<string, number> {
  return stats.reduce((acc, s) => {
    acc[s.stat_date] = s.points_earned
    return acc
  }, {} as Record<string, number>)
}

export function calculateCurrentStreak(stats: TeammateDailyStat[]): number {
  const sorted = [...stats].sort((a, b) => b.stat_date.localeCompare(a.stat_date))
  let streak = 0
  for (const s of sorted) {
    if (s.completed_all_required) streak++
    else break
  }
  return streak
}

export function calculateLongestStreak(stats: TeammateDailyStat[]): number {
  const sorted = [...stats].sort((a, b) => a.stat_date.localeCompare(b.stat_date))
  let longest = 0
  let current = 0
  for (const s of sorted) {
    if (s.completed_all_required) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }
  return longest
}
```

- [ ] **Step 10: Run calculations tests (expect PASS)**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx jest src/__tests__/calculations.test.ts --no-coverage
```

Expected: `Tests: 18 passed` (approximately)

- [ ] **Step 11: Create auth utilities**

Create `src/lib/auth.ts`:

```typescript
import { supabase } from './supabaseClient'
import type { Teammate } from '@/types/database'

const TEAMMATE_KEY = 'ss_barakah_teammate'
const ADMIN_KEY = 'ss_barakah_admin'
const ADMIN_CODE = 'Dawoud Sink'

export async function loginTeammate(name: string, password: string): Promise<Teammate | null> {
  const { data, error } = await supabase
    .from('teammates')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  // MVP: plain text comparison — replace with bcrypt hash comparison before production
  const match = data.plain_password === password || data.password_hash === password
  if (!match) return null

  sessionStorage.setItem(TEAMMATE_KEY, JSON.stringify(data))
  return data as Teammate
}

export function logoutTeammate(): void {
  sessionStorage.removeItem(TEAMMATE_KEY)
}

export function getCurrentTeammate(): Teammate | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(TEAMMATE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Teammate
  } catch {
    return null
  }
}

export function validateAdminCode(code: string): boolean {
  return code.trim() === ADMIN_CODE
}

export function setAdminSession(): void {
  sessionStorage.setItem(ADMIN_KEY, 'true')
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_KEY)
}

export async function changeTeammatePassword(teammateId: string, newPassword: string): Promise<boolean> {
  const { error } = await supabase
    .from('teammates')
    .update({ plain_password: newPassword, updated_at: new Date().toISOString() })
    .eq('id', teammateId)
  return !error
}
```

- [ ] **Step 12: Create finalization utilities**

Create `src/lib/finalization.ts`:

```typescript
import { supabase } from './supabaseClient'
import { calculateChad, calculateChud } from './calculations'
import { dayOfWeek } from './dateUtils'
import type { TeammateDailyStat, DailyTask, RecurringTask } from '@/types/database'

export async function finalizeDay(date: string): Promise<void> {
  // Idempotent — bail out if already finalized
  const { data: existing } = await supabase
    .from('daily_results')
    .select('id')
    .eq('result_date', date)
    .single()
  if (existing) return

  const { data: teammates } = await supabase
    .from('teammates')
    .select('id')
    .eq('is_active', true)
  if (!teammates || teammates.length === 0) return

  const { data: tasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('task_date', date)
  const allTasks: DailyTask[] = (tasks as DailyTask[]) ?? []
  const required = allTasks.filter(t => t.is_required)
  const completedRequired = required.filter(t => t.is_completed)
  const total = required.length
  const completedCount = completedRequired.length
  const missed = total - completedCount
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100)
  const outcome: 'survived' | 'sunk' = missed === 0 ? 'survived' : 'sunk'

  // Build per-teammate stats rows
  const statsRows: Omit<TeammateDailyStat, 'id' | 'created_at'>[] = []
  for (const tm of teammates) {
    const { data: completions } = await supabase
      .from('task_completions')
      .select('points_awarded')
      .eq('teammate_id', tm.id)
      .eq('task_date', date)
    const points = ((completions ?? []) as { points_awarded: number }[])
      .reduce((s, c) => s + c.points_awarded, 0)
    const tmRequired = required.filter(t => t.teammate_id === tm.id)
    const tmCompleted = tmRequired.filter(t => t.is_completed).length
    const tmMissed = tmRequired.length - tmCompleted

    statsRows.push({
      teammate_id: tm.id,
      stat_date: date,
      points_earned: points,
      total_required_tasks: tmRequired.length,
      completed_required_tasks: tmCompleted,
      missed_required_tasks: tmMissed,
      completed_all_required: tmMissed === 0 && tmRequired.length > 0,
      is_chad: false,
      is_chud: false,
    })
  }

  // Cast to TeammateDailyStat to satisfy calculateChad/calculateChud signatures
  const statsForCalc = statsRows.map(s => ({ ...s, id: '', created_at: '' } as TeammateDailyStat))
  const chadId = calculateChad(statsForCalc)
  const chudId = calculateChud(statsForCalc)

  const finalRows = statsRows.map(s => ({
    ...s,
    is_chad: s.teammate_id === chadId,
    is_chud: s.teammate_id === chudId,
  }))

  await supabase.from('daily_results').insert({
    result_date: date,
    outcome,
    completion_percentage: pct,
    total_required_tasks: total,
    completed_required_tasks: completedCount,
    missed_required_tasks: missed,
    chad_teammate_id: chadId,
    chud_teammate_id: chudId ?? null,
  })

  await supabase.from('teammate_daily_stats').insert(finalRows)

  // Update current badge flags on teammates table
  await supabase.from('teammates').update({ current_chad: false, current_chud: false })
    .in('id', teammates.map(t => t.id))
  if (chadId) {
    await supabase.from('teammates').update({ current_chad: true }).eq('id', chadId)
  }
  if (chudId) {
    await supabase.from('teammates').update({ current_chud: true }).eq('id', chudId)
  }

  await createNextDayRecurringTasks(date)
}

export async function createNextDayRecurringTasks(fromDate: string): Promise<void> {
  const nextDate = new Date(fromDate + 'T12:00:00')
  nextDate.setDate(nextDate.getDate() + 1)
  const nextDateStr = nextDate.toISOString().split('T')[0]
  const nextDow = dayOfWeek(nextDateStr)

  const { data: recurring } = await supabase
    .from('recurring_tasks')
    .select('*')
    .eq('is_active', true)
  if (!recurring) return

  for (const rt of recurring as RecurringTask[]) {
    const applies =
      rt.recurrence_type === 'daily' ||
      (rt.recurrence_type === 'weekly' && rt.recurrence_days?.includes(nextDow)) ||
      (rt.recurrence_type === 'custom_days' && rt.recurrence_days?.includes(nextDow))
    if (!applies) continue

    // Duplicate prevention: skip if a task with the same name already exists for this teammate + date
    const { data: dupe } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('teammate_id', rt.teammate_id)
      .eq('task_date', nextDateStr)
      .eq('name', rt.name)
      .maybeSingle()
    if (dupe) continue

    await supabase.from('daily_tasks').insert({
      teammate_id: rt.teammate_id,
      preset_task_id: rt.preset_task_id,
      name: rt.name,
      description: rt.description,
      category: rt.category,
      points: rt.points,
      is_required: rt.is_required,
      is_completed: false,
      is_repeatable: rt.is_repeatable,
      max_completions: rt.max_completions,
      completion_count: 0,
      task_date: nextDateStr,
    })
  }
}
```

- [ ] **Step 13: Run TypeScript type check**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit 2>&1
```

Expected: no output (zero errors). Fix any type errors before proceeding.

- [ ] **Step 14: Run all tests**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx jest --no-coverage 2>&1 | tail -15
```

Expected: all tests pass.

- [ ] **Step 15: Commit Task 2**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
git add src/types src/lib src/__tests__
git commit -m "feat: add database types, supabase client, and core lib utilities (auth, calculations, finalization, dateUtils)"
```

- [ ] **Step 16: Update handoff.md**

Append to `docs/handoff.md`:

```markdown
## Tasks 1 & 2 — Project Setup & Core Library (completed 2026-06-05)

### What was done
- Initialized Next.js 14 (App Router, TypeScript, Tailwind CSS, src/ directory)
- Installed `@supabase/supabase-js`
- Created `.env.local.example` and `.env.local` (placeholder values — user must fill in real Supabase credentials)
- Created `supabase/migrations/001_create_tables.sql` with all 7 tables: teammates, preset_tasks, daily_tasks, recurring_tasks, task_completions, daily_results, teammate_daily_stats
- Created `supabase/migrations/002_seed_data.sql` seeding 4 teammates (Dawoud, Araf, Sufiyan, Nouho) and 9 Islamic + 7 regular preset tasks
- Created `src/types/database.ts` with TypeScript interfaces for every table row
- Created `src/lib/supabaseClient.ts` — singleton Supabase browser client
- Created `src/lib/dateUtils.ts` — pure date string helpers, fully unit tested
- Created `src/lib/calculations.ts` — pure business logic (team progress, Chad, Chud, streaks, heatmap values), fully unit tested
- Created `src/lib/auth.ts` — login/logout with sessionStorage, admin code validation ("Dawoud Sink"), password change
- Created `src/lib/finalization.ts` — daily finalization orchestrator + recurring task generator for next day

### Important notes for next tasks
- **Supabase credentials**: `.env.local` has placeholder values. Before running the app, the user must create a Supabase project, run both SQL migration files in the Supabase SQL editor, and replace the placeholder values in `.env.local` with the real project URL and anon key.
- **Passwords**: Auth uses `plain_password` comparison for MVP. The `password_hash` column exists but is unused until bcrypt is added.
- **Admin code**: Hardcoded as `"Dawoud Sink"` in `src/lib/auth.ts`. The `validateAdminCode` function trims whitespace before comparing.
- **Finalization is idempotent**: Calling `finalizeDay(date)` twice safely no-ops on the second call.
- **Recurring tasks use day-of-week names** (e.g. "Friday") stored in `recurrence_days[]`. The `dayOfWeek()` helper uses noon local time to avoid DST-related off-by-one errors.

### Next task
Task 3 — Login Page (`/login`). Build the UI, wire up `loginTeammate()` from `auth.ts`, apply Arctic visual theme.
```
