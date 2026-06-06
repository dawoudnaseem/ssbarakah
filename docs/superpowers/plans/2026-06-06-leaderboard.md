# Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the leaderboard and recent repairs feed from `src/app/page.tsx` into two standalone components with the approved row design.

**Architecture:** Create `src/types/leaderboard.ts` for shared types, then build `Leaderboard.tsx` and `RecentRepairsFeed.tsx` as pure presentational components that receive props from `page.tsx`. No data-fetching changes — `page.tsx` already polls every 15 seconds and continues to own all data.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, Arctic colour palette (`#061826`, `#0B3558`, `#9DD8F7`, `#F2FBFF`, `#F59E0B`, `#DC2626`, `#22C55E`)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/types/leaderboard.ts` | **Create** | `LeaderboardEntry` and `RecentCompletion` interfaces |
| `src/components/leaderboard/Leaderboard.tsx` | **Create** | Crew leaderboard rows with approved design |
| `src/components/leaderboard/RecentRepairsFeed.tsx` | **Create** | Recent repairs feed (pure extraction) |
| `src/app/page.tsx` | **Modify** | Remove inline types + markup; import new components |

---

## Task 1 — Shared Types

**Files:**
- Create: `src/types/leaderboard.ts`
- Modify: `src/app/page.tsx` (remove inline interface declarations, add import)

### Steps

- [ ] **1.1 Create `src/types/leaderboard.ts`**

```ts
import type { Teammate } from '@/types/database'

export interface LeaderboardEntry {
  teammate: Teammate
  points: number
  completedRequired: number
  totalRequired: number
  missedRequired: number
}

export interface RecentCompletion {
  id: string
  completed_at: string
  points_awarded: number
  task_name: string
  teammate_name: string
}
```

- [ ] **1.2 In `src/app/page.tsx`, remove the two inline interface blocks and add the import**

Remove these lines (roughly lines 11–25):
```ts
interface LeaderboardEntry {
  teammate: Teammate
  points: number
  completedRequired: number
  totalRequired: number
  missedRequired: number
}

interface RecentCompletion {
  id: string
  completed_at: string
  points_awarded: number
  task_name: string
  teammate_name: string
}
```

Add at the top with the other imports:
```ts
import type { LeaderboardEntry, RecentCompletion } from '@/types/leaderboard'
```

Also remove `Teammate` from the `@/types/database` import line if it is no longer used directly in `page.tsx` (check — `Teammate` is still used in the `useState` declarations, so keep it).

- [ ] **1.3 Verify TypeScript still compiles**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **1.4 Commit**

```bash
git add src/types/leaderboard.ts src/app/page.tsx
git commit -m "refactor: move LeaderboardEntry and RecentCompletion to shared types"
```

---

## Task 2 — Leaderboard Component

**Files:**
- Create: `src/components/leaderboard/Leaderboard.tsx`

### Steps

- [ ] **2.1 Create `src/components/leaderboard/Leaderboard.tsx`**

```tsx
'use client'

import type { LeaderboardEntry } from '@/types/leaderboard'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(157,216,247,0.55)' }}>
        Crew Leaderboard
      </p>
      <div className="flex flex-col gap-2">
        {entries.length === 0 && (
          <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No crew data yet.</p>
        )}
        {entries.map((entry, i) => (
          <LeaderboardRow key={entry.teammate.id} entry={entry} rank={i + 1} />
        ))}
      </div>
    </section>
  )
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isFirst = rank === 1
  const allDone = entry.missedRequired === 0 && entry.totalRequired > 0

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: isFirst ? 'rgba(245,158,11,0.08)' : 'rgba(9,26,44,0.8)',
        border: `1px solid ${isFirst ? 'rgba(245,158,11,0.3)' : 'rgba(157,216,247,0.08)'}`,
      }}
    >
      {/* Rank */}
      <span
        className="font-bold text-sm w-5 text-center shrink-0"
        style={{ color: isFirst ? '#F59E0B' : 'rgba(242,251,255,0.3)' }}
      >
        {rank}
      </span>

      {/* Avatar */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full font-bold text-sm"
        style={{
          width: 34, height: 34,
          background: isFirst ? '#F59E0B' : '#0B3558',
          color: isFirst ? '#061826' : '#9DD8F7',
          border: isFirst ? 'none' : '1px solid rgba(157,216,247,0.2)',
        }}
      >
        {entry.teammate.name[0].toUpperCase()}
      </div>

      {/* Name + badge */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-sm font-semibold" style={{ color: '#F2FBFF' }}>
          {entry.teammate.name}
        </p>
        {entry.teammate.current_chad && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: '#F59E0B', color: '#061826', fontSize: '10px' }}
          >
            ⚓ CHAD
          </span>
        )}
        {entry.teammate.current_chud && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.4)',
              color: '#DC2626',
              fontSize: '10px',
            }}
          >
            💀 CHUD
          </span>
        )}
      </div>

      {/* Points + status */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span
          className="text-sm font-bold"
          style={{ color: isFirst ? '#F59E0B' : '#9DD8F7' }}
        >
          {entry.points} pts
        </span>
        {entry.totalRequired > 0 && (
          <span
            className="text-xs"
            style={{ color: allDone ? 'rgba(34,197,94,0.85)' : 'rgba(220,38,38,0.8)' }}
          >
            {allDone
              ? `✓ all ${entry.completedRequired}/${entry.totalRequired} tasks done`
              : `${entry.missedRequired} missed`}
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **2.2 Verify TypeScript compiles**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **2.3 Commit**

```bash
git add src/components/leaderboard/Leaderboard.tsx
git commit -m "feat: add Leaderboard component with approved row design"
```

---

## Task 3 — Recent Repairs Feed Component

**Files:**
- Create: `src/components/leaderboard/RecentRepairsFeed.tsx`

### Steps

- [ ] **3.1 Create `src/components/leaderboard/RecentRepairsFeed.tsx`**

```tsx
'use client'

import type { RecentCompletion } from '@/types/leaderboard'

interface RecentRepairsFeedProps {
  items: RecentCompletion[]
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function RecentRepairsFeed({ items }: RecentRepairsFeedProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(157,216,247,0.55)' }}>
        Recent Repairs
      </p>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No completions yet today.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(9,26,44,0.6)', border: '1px solid rgba(157,216,247,0.06)' }}
            >
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: '#F2FBFF' }}>
                  <span style={{ color: '#9DD8F7' }}>{c.teammate_name}</span> — {c.task_name}
                </p>
                <p className="text-xs" style={{ color: 'rgba(242,251,255,0.3)' }}>{formatTime(c.completed_at)}</p>
              </div>
              <span className="text-xs font-bold shrink-0" style={{ color: '#22C55E' }}>+{c.points_awarded}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **3.2 Verify TypeScript compiles**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **3.3 Commit**

```bash
git add src/components/leaderboard/RecentRepairsFeed.tsx
git commit -m "feat: add RecentRepairsFeed component"
```

---

## Task 4 — Wire Into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

### Steps

- [ ] **4.1 Add imports at the top of `src/app/page.tsx`**

Add after the existing imports:
```ts
import Leaderboard from '@/components/leaderboard/Leaderboard'
import RecentRepairsFeed from '@/components/leaderboard/RecentRepairsFeed'
```

- [ ] **4.2 Replace the inline leaderboard section in `src/app/page.tsx`**

Find and remove:
```tsx
<section>
  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(157,216,247,0.55)' }}>Crew Leaderboard</p>
  <div className="flex flex-col gap-2">
    {leaderboard.map((entry, i) => (
      <div key={entry.teammate.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: 'rgba(9,26,44,0.8)', border: '1px solid rgba(157,216,247,0.07)' }}>
        <span className="text-sm font-bold w-5 text-center"
          style={{ color: i === 0 ? '#F59E0B' : 'rgba(242,251,255,0.3)' }}>{i + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: '#F2FBFF' }}>{entry.teammate.name}</p>
          <p className="text-xs" style={{ color: 'rgba(242,251,255,0.35)' }}>
            {entry.completedRequired}/{entry.totalRequired} required
            {entry.missedRequired > 0 && ` · ${entry.missedRequired} missed`}
          </p>
        </div>
        <span className="text-sm font-bold" style={{ color: '#9DD8F7' }}>{entry.points} pts</span>
      </div>
    ))}
    {leaderboard.length === 0 && (
      <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No crew data yet.</p>
    )}
  </div>
</section>
```

Replace with:
```tsx
<Leaderboard entries={leaderboard} />
```

- [ ] **4.3 Replace the inline recent repairs section in `src/app/page.tsx`**

Find and remove:
```tsx
<section>
  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(157,216,247,0.55)' }}>Recent Repairs</p>
  {recentFeed.length === 0 ? (
    <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No completions yet today.</p>
  ) : (
    <div className="flex flex-col gap-2">
      {recentFeed.map(c => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(9,26,44,0.6)', border: '1px solid rgba(157,216,247,0.06)' }}>
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ color: '#F2FBFF' }}>
              <span style={{ color: '#9DD8F7' }}>{c.teammate_name}</span> — {c.task_name}
            </p>
            <p className="text-xs" style={{ color: 'rgba(242,251,255,0.3)' }}>{formatTime(c.completed_at)}</p>
          </div>
          <span className="text-xs font-bold shrink-0" style={{ color: '#22C55E' }}>+{c.points_awarded}</span>
        </div>
      ))}
    </div>
  )}
</section>
```

Replace with:
```tsx
<RecentRepairsFeed items={recentFeed} />
```

- [ ] **4.4 Remove the `formatTime` function from `src/app/page.tsx`** (it now lives in `RecentRepairsFeed.tsx`)

Find and delete:
```ts
function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
```

- [ ] **4.5 Verify TypeScript compiles and tests pass**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit && npm test -- --silent
```

Expected: no TS errors, 47 tests passed.

- [ ] **4.6 Commit and push**

```bash
git add src/app/page.tsx
git commit -m "refactor: wire Leaderboard and RecentRepairsFeed into ship dashboard"
git push
```

---

## Self-Review

**Spec coverage:**
- ✅ `LeaderboardEntry` / `RecentCompletion` moved to shared types file
- ✅ `Leaderboard.tsx` — rank, avatar, name, Chad/Chud badge, points, status line
- ✅ #1 row amber glow
- ✅ `✓ all X/X tasks done` format
- ✅ `N missed` in red
- ✅ Empty state
- ✅ `RecentRepairsFeed.tsx` — pure extraction, no visual changes
- ✅ `page.tsx` owns data fetching, passes props down
- ✅ `formatTime` removed from `page.tsx` (now lives in `RecentRepairsFeed.tsx`)

**No placeholders:** confirmed — all steps have exact code.

**Type consistency:** `LeaderboardEntry` and `RecentCompletion` defined once in Task 1, imported identically in Tasks 2, 3, and 4.
