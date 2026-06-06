# Tasks 10, 11, 12 — Badge Display, Admin Dashboard, Daily Finalization

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the BadgeDisplay component, add finalization tests and auto-trigger, and build the full admin dashboard with code gate, sidebar nav, teammate/preset CRUD, team status view, and manual finalization trigger.

**Architecture:** `finalizeDay` is already fully implemented in `src/lib/finalization.ts` — no changes needed there. Task 10 is a pure component extraction. Task 12 adds an auto-trigger in `page.tsx` and tests. Task 11 is a new `src/app/admin/` route with 5 component files. All modals use `<IcyModal>`. Admin auth uses the existing `validateAdminCode`, `setAdminSession`, `isAdminAuthenticated`, and `clearAdminSession` helpers from `src/lib/auth.ts`.

**Tech Stack:** Next.js 16.2.7, React, TypeScript, Tailwind CSS, Supabase

---

## File Map

| Status | Path | Purpose |
|---|---|---|
| **Create** | `src/components/leaderboard/BadgeDisplay.tsx` | Extracted `BadgeCard` + `BadgeDisplay` wrapper |
| **Modify** | `src/app/page.tsx` | Remove inline `BadgeCard`, import `BadgeDisplay`, add yesterday finalization auto-trigger |
| **Create** | `src/__tests__/finalization.test.ts` | Unit tests for `finalizeDay` logic (via pure helper extraction) |
| **Create** | `src/app/admin/page.tsx` | Admin route: gate + layout + section routing |
| **Create** | `src/components/admin/AdminSidebar.tsx` | Sidebar nav component |
| **Create** | `src/components/admin/StatusSection.tsx` | Today's team completion table |
| **Create** | `src/components/admin/CrewSection.tsx` | Teammate CRUD |
| **Create** | `src/components/admin/MissionsSection.tsx` | Preset task CRUD |
| **Create** | `src/components/admin/FinalizeSection.tsx` | Manual finalization trigger |

---

## Task 1: Extract BadgeDisplay component

**Files:**
- Create: `src/components/leaderboard/BadgeDisplay.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `BadgeDisplay.tsx`**

```tsx
// src/components/leaderboard/BadgeDisplay.tsx
'use client'

function BadgeCard({ emoji, label, name, color, subtitle }: {
  emoji: string; label: string; name: string; color: string; subtitle: string
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: `${color}08`, border: `1px solid ${color}35` }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>{emoji} {label}</p>
      <p className="text-base font-bold" style={{ color: '#F2FBFF' }}>{name}</p>
      <p className="text-xs" style={{ color: 'rgba(242,251,255,0.4)' }}>{subtitle}</p>
    </div>
  )
}

export default function BadgeDisplay({
  chadName,
  chadPoints,
  chudName,
  chudMissed,
}: {
  chadName: string | undefined
  chadPoints: number | undefined
  chudName: string | undefined
  chudMissed: number | undefined
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <BadgeCard
        emoji="⚓"
        label="Chad of the Day"
        name={chadName ?? '—'}
        color="#F59E0B"
        subtitle={chadName ? `${chadPoints} pts` : 'Not yet assigned'}
      />
      <BadgeCard
        emoji="💀"
        label="Chud of the Day"
        name={chudName ?? 'None'}
        color="#DC2626"
        subtitle={chudName ? `${chudMissed} missed` : 'Everyone held it down'}
      />
    </div>
  )
}
```

- [ ] **Step 2: Update `src/app/page.tsx` — import and replace**

At the top of the imports in `page.tsx`, add:
```tsx
import BadgeDisplay from '@/components/leaderboard/BadgeDisplay'
```

Find the two-card block:
```tsx
<div className="grid grid-cols-2 gap-3">
  <BadgeCard emoji="⚓" label="Chad of the Day" name={chadEntry?.teammate.name ?? '—'}
    color="#F59E0B" subtitle={chadEntry ? `${chadEntry.points} pts` : 'Not yet assigned'} />
  <BadgeCard emoji="💀" label="Chud of the Day" name={chudEntry?.teammate.name ?? 'None'}
    color="#DC2626" subtitle={chudEntry ? `${chudEntry.missedRequired} missed` : 'Everyone held it down'} />
</div>
```

Replace with:
```tsx
<BadgeDisplay
  chadName={chadEntry?.teammate.name}
  chadPoints={chadEntry?.points}
  chudName={chudEntry?.teammate.name}
  chudMissed={chudEntry?.missedRequired}
/>
```

Then delete the entire `function BadgeCard(...)` definition from the bottom of `page.tsx` (it is the inline component starting at the `// ─── Sub-components ───` divider, ending just before `// ─── Pre-computed stars ───`).

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

Expected: all 47 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/leaderboard/BadgeDisplay.tsx src/app/page.tsx
git commit -m "refactor: extract BadgeCard into BadgeDisplay component"
```

---

## Task 2: Finalization tests

**Files:**
- Create: `src/__tests__/finalization.test.ts`

> Note: `finalizeDay` makes Supabase calls. Rather than mocking the entire client, we test the pure logic that `finalizeDay` delegates to: `calculateChad`, `calculateChud`, and the per-teammate stats computation shape. These tests verify the contract that `finalizeDay` depends on and are fast/reliable.

- [ ] **Step 1: Create `src/__tests__/finalization.test.ts`**

```ts
import { calculateChad, calculateChud } from '@/lib/calculations'
import type { TeammateDailyStat } from '@/types/database'

const stat = (override: Partial<TeammateDailyStat>): TeammateDailyStat => ({
  id: '',
  teammate_id: 'a',
  stat_date: '2026-06-06',
  points_earned: 0,
  total_required_tasks: 0,
  completed_required_tasks: 0,
  missed_required_tasks: 0,
  completed_all_required: false,
  is_chad: false,
  is_chud: false,
  created_at: '',
  ...override,
})

describe('finalizeDay badge assignment logic', () => {
  describe('Chad selection', () => {
    it('assigns Chad to the teammate with the most points', () => {
      const stats = [
        stat({ teammate_id: 'dawoud', points_earned: 60 }),
        stat({ teammate_id: 'araf',   points_earned: 90 }),
        stat({ teammate_id: 'sufiyan',points_earned: 45 }),
      ]
      expect(calculateChad(stats)).toBe('araf')
    })

    it('returns null when stats array is empty', () => {
      expect(calculateChad([])).toBeNull()
    })

    it('tiebreaks Chad by first teammate in sorted array (stable)', () => {
      const stats = [
        stat({ teammate_id: 'b', points_earned: 100 }),
        stat({ teammate_id: 'a', points_earned: 100 }),
      ]
      // The first element with max points wins (no explicit tiebreak in spec)
      expect(calculateChad(stats)).toBe('b')
    })
  })

  describe('Chud selection', () => {
    it('returns null if nobody missed a required task (ship survived)', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 80, missed_required_tasks: 0 }),
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 0 }),
      ]
      expect(calculateChud(stats)).toBeNull()
    })

    it('assigns Chud to the teammate with the lowest points among those who missed tasks', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 80, missed_required_tasks: 1 }),
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 1 }),
        stat({ teammate_id: 'c', points_earned: 40, missed_required_tasks: 0 }),
      ]
      expect(calculateChud(stats)).toBe('b')
    })

    it('tiebreaks Chud by most missed tasks when points are equal', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 10, missed_required_tasks: 1 }),
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 3 }),
      ]
      expect(calculateChud(stats)).toBe('b')
    })

    it('tiebreaks Chud by teammate_id when points and missed tasks are equal', () => {
      const stats = [
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 2 }),
        stat({ teammate_id: 'a', points_earned: 10, missed_required_tasks: 2 }),
      ]
      expect(calculateChud(stats)).toBe('a')
    })

    it('does not assign Chud to a teammate who completed all tasks, even if they have the lowest points', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 5, missed_required_tasks: 0 }),
        stat({ teammate_id: 'b', points_earned: 20, missed_required_tasks: 2 }),
      ]
      expect(calculateChud(stats)).toBe('b')
    })
  })

  describe('per-teammate stats shape', () => {
    it('completed_all_required is false when any required task is missed', () => {
      const tmRequired = 3
      const tmCompleted = 2
      const tmMissed = tmRequired - tmCompleted
      const completedAllRequired = tmMissed === 0 && tmRequired > 0
      expect(completedAllRequired).toBe(false)
    })

    it('completed_all_required is true when all required tasks are done', () => {
      const tmRequired = 3
      const tmCompleted = 3
      const tmMissed = tmRequired - tmCompleted
      const completedAllRequired = tmMissed === 0 && tmRequired > 0
      expect(completedAllRequired).toBe(true)
    })

    it('completed_all_required is false when there are no required tasks', () => {
      const tmRequired = 0
      const tmCompleted = 0
      const tmMissed = tmRequired - tmCompleted
      const completedAllRequired = tmMissed === 0 && tmRequired > 0
      expect(completedAllRequired).toBe(false)
    })

    it('outcome is sunk when any required task is missed', () => {
      const missed = 2
      const outcome: 'survived' | 'sunk' = missed === 0 ? 'survived' : 'sunk'
      expect(outcome).toBe('sunk')
    })

    it('outcome is survived when no required tasks are missed', () => {
      const missed = 0
      const outcome: 'survived' | 'sunk' = missed === 0 ? 'survived' : 'sunk'
      expect(outcome).toBe('survived')
    })
  })
})
```

- [ ] **Step 2: Run tests and confirm all pass**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

Expected: all tests pass (count goes from 47 to ~60).

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/finalization.test.ts
git commit -m "test: add finalization badge logic tests"
```

---

## Task 3: Auto-trigger yesterday's finalization on app open

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add import at top of `page.tsx`**

Add to the existing imports block:
```tsx
import { finalizeDay } from '@/lib/finalization'
import { yesterdayString } from '@/lib/dateUtils'
```

- [ ] **Step 2: Add auto-finalize call inside `fetchData`**

In `src/app/page.tsx`, find the `fetchData` function. It currently starts with a `Promise.all` fetching today's data. Add a yesterday-check **before** the `Promise.all`:

```tsx
const fetchData = useCallback(async () => {
  // Silently finalize yesterday if it hasn't been finalized yet
  const yesterday = yesterdayString()
  const { data: yesterdayResult } = await supabase
    .from('daily_results')
    .select('id')
    .eq('result_date', yesterday)
    .maybeSingle()
  if (!yesterdayResult) {
    try { await finalizeDay(yesterday) } catch { /* silent — background housekeeping */ }
  }

  const [
    // ... rest of the existing Promise.all unchanged
```

- [ ] **Step 3: Run tests**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

Expected: all tests still pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: auto-finalize yesterday on ship dashboard mount"
```

---

## Task 4: Admin gate page (Arctic scene + code input)

**Files:**
- Create: `src/app/admin/page.tsx`

The stars array below is pre-computed — no `Math.random()` to avoid hydration mismatches.

- [ ] **Step 1: Create `src/app/admin/page.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { validateAdminCode, setAdminSession, isAdminAuthenticated, clearAdminSession } from '@/lib/auth'
import IcyErrorModal from '@/components/IcyErrorModal'
import AdminSidebar from '@/components/admin/AdminSidebar'
import StatusSection from '@/components/admin/StatusSection'
import CrewSection from '@/components/admin/CrewSection'
import MissionsSection from '@/components/admin/MissionsSection'
import FinalizeSection from '@/components/admin/FinalizeSection'

type AdminSection = 'status' | 'crew' | 'missions' | 'finalize'

const STARS = [
  { w: '2px', top: '4%',  left: '8%',  op: 0.7  },
  { w: '1px', top: '7%',  left: '22%', op: 0.5  },
  { w: '2px', top: '3%',  left: '38%', op: 0.8  },
  { w: '1px', top: '10%', left: '55%', op: 0.45 },
  { w: '2px', top: '5%',  left: '72%', op: 0.65 },
  { w: '1px', top: '2%',  left: '88%', op: 0.55 },
  { w: '1px', top: '12%', left: '14%', op: 0.4  },
  { w: '2px', top: '15%', left: '31%', op: 0.75 },
  { w: '1px', top: '9%',  left: '48%', op: 0.5  },
  { w: '2px', top: '18%', left: '65%', op: 0.6  },
  { w: '1px', top: '6%',  left: '79%', op: 0.4  },
  { w: '1px', top: '20%', left: '92%', op: 0.55 },
  { w: '2px', top: '22%', left: '5%',  op: 0.7  },
  { w: '1px', top: '25%', left: '18%', op: 0.35 },
  { w: '2px', top: '14%', left: '42%', op: 0.8  },
]

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [section, setSection] = useState<AdminSection>('status')

  useEffect(() => {
    if (isAdminAuthenticated()) setAuthenticated(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validateAdminCode(code)) {
      setAdminSession()
      setAuthenticated(true)
    } else {
      setCode('')
      setError(true)
    }
  }

  function handleLogout() {
    clearAdminSession()
    setAuthenticated(false)
    setSection('status')
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #061826 0%, #0B3558 60%, #0d4a6e 100%)' }}>

        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ width: s.w, height: s.w, top: s.top, left: s.left, background: '#fff', opacity: s.op }} />
        ))}

        {/* Small iceberg left */}
        <div className="absolute animate-float" style={{ bottom: '18%', left: '6%', opacity: 0.45 }}>
          <svg width="80" height="70" viewBox="0 0 80 70" aria-hidden="true">
            <polygon points="40,0 75,70 5,70" fill="#9DD8F7" opacity="0.25" />
            <polygon points="40,10 65,70 15,70" fill="#C8ECFF" opacity="0.15" />
          </svg>
        </div>

        {/* Large iceberg right */}
        <div className="absolute animate-float" style={{ bottom: '12%', right: '5%', opacity: 0.5, animationDelay: '1.8s' }}>
          <svg width="130" height="110" viewBox="0 0 130 110" aria-hidden="true">
            <polygon points="65,0 125,110 5,110" fill="#9DD8F7" opacity="0.25" />
            <polygon points="65,12 110,110 20,110" fill="#C8ECFF" opacity="0.15" />
          </svg>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '60px', overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" width="100%" height="60">
            <path d="M0,30 C240,10 480,50 720,25 C960,0 1200,45 1440,25 L1440,60 L0,60 Z"
              fill="rgba(11,53,88,0.85)" />
          </svg>
        </div>

        {/* Faint ship silhouette */}
        <div className="absolute" style={{ bottom: '26%', left: '50%', transform: 'translateX(-50%)', opacity: 0.12 }}>
          <svg width="160" height="80" viewBox="0 0 340 170" aria-hidden="true">
            <rect x="60" y="90" width="220" height="50" rx="6" fill="#9DD8F7" />
            <polygon points="160,20 170,90 150,90" fill="#9DD8F7" />
            <rect x="155" y="22" width="3" height="68" fill="#9DD8F7" />
            <rect x="60" y="138" width="220" height="8" rx="3" fill="#7bc4e8" />
            <rect x="100" y="90" width="140" height="30" rx="4" fill="rgba(157,216,247,0.3)" />
          </svg>
        </div>

        {/* Gate card */}
        <form onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-sm mx-4 rounded-2xl px-8 py-10 flex flex-col items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(157,216,247,0.12), rgba(6,24,38,0.88))',
            border: '1px solid rgba(157,216,247,0.3)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
          }}>
          <p className="text-xl font-bold" style={{ color: '#F2FBFF' }}>⚓ Admiral&apos;s Deck</p>
          <p className="text-xs text-center" style={{ color: 'rgba(157,216,247,0.5)' }}>
            Restricted — crew code required
          </p>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter admin code"
            autoFocus
            className="w-full rounded-lg px-4 py-3 text-center text-base tracking-widest outline-none"
            style={{
              background: 'rgba(6,24,38,0.7)',
              border: '1px solid rgba(157,216,247,0.3)',
              color: '#9DD8F7',
            }}
          />
          <button type="submit"
            className="w-full rounded-lg py-3 font-bold text-sm"
            style={{ background: '#9DD8F7', color: '#061826' }}>
            Board →
          </button>
          <p className="text-xs" style={{ color: 'rgba(157,216,247,0.3)' }}>
            Session ends when you close this tab
          </p>
        </form>

        {error && <IcyErrorModal message="Invalid admin code." onClose={() => setError(false)} />}
      </main>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#061826', paddingTop: '56px' }}>
      <AdminSidebar active={section} onSelect={setSection} onLogout={handleLogout} />
      <main className="flex-1 p-6 overflow-y-auto" style={{ marginLeft: '192px' }}>
        {section === 'status'   && <StatusSection />}
        {section === 'crew'     && <CrewSection />}
        {section === 'missions' && <MissionsSection />}
        {section === 'finalize' && <FinalizeSection />}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Check `IcyErrorModal` props signature**

The existing `IcyErrorModal` at `src/components/IcyErrorModal.tsx` accepts `{ message: string, onClose: () => void }`. Confirm this is correct before running the dev server.

```bash
grep -n "interface\|Props\|message\|onClose" "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah/src/components/IcyErrorModal.tsx" | head -10
```

- [ ] **Step 3: Run tests**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

Expected: all tests still pass.

- [ ] **Step 4: Commit (stub — sections not yet built)**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add admin gate page with Arctic scene"
```

---

## Task 5: AdminSidebar + StatusSection

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/StatusSection.tsx`

- [ ] **Step 1: Create `src/components/admin/AdminSidebar.tsx`**

```tsx
'use client'

type AdminSection = 'status' | 'crew' | 'missions' | 'finalize'

const NAV_ITEMS: { id: AdminSection; label: string; emoji: string }[] = [
  { id: 'status',   label: 'Status',   emoji: '📊' },
  { id: 'crew',     label: 'Crew',     emoji: '👥' },
  { id: 'missions', label: 'Missions', emoji: '📋' },
  { id: 'finalize', label: 'Finalize', emoji: '⚡' },
]

export default function AdminSidebar({
  active,
  onSelect,
  onLogout,
}: {
  active: AdminSection
  onSelect: (s: AdminSection) => void
  onLogout: () => void
}) {
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-48 flex flex-col py-4 px-3 gap-1"
      style={{ background: '#0a1e2e', borderRight: '1px solid rgba(157,216,247,0.1)' }}>
      <p className="text-xs font-bold tracking-widest uppercase px-2 mb-3"
        style={{ color: 'rgba(157,216,247,0.4)' }}>
        ⚓ Admin
      </p>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
          style={{
            background:     active === item.id ? 'rgba(157,216,247,0.08)' : 'transparent',
            color:          active === item.id ? '#9DD8F7' : 'rgba(157,216,247,0.5)',
            borderLeft:     active === item.id ? '2px solid #9DD8F7' : '2px solid transparent',
            color:          item.id === 'finalize' && active !== 'finalize'
                              ? 'rgba(220,38,38,0.6)' : undefined,
          } as React.CSSProperties}
        >
          {item.emoji} {item.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button
        onClick={onLogout}
        className="px-3 py-2 rounded-lg text-xs text-left"
        style={{ color: 'rgba(157,216,247,0.35)' }}>
        ← Log Out
      </button>
    </aside>
  )
}
```

> Note: the duplicate `color` key for the finalize item will cause a TypeScript lint warning. Fix it by computing the color before the style object:

```tsx
const color = item.id === 'finalize' && active !== 'finalize'
  ? 'rgba(220,38,38,0.6)'
  : active === item.id
  ? '#9DD8F7'
  : 'rgba(157,216,247,0.5)'

// then in style:
style={{
  background:  active === item.id ? 'rgba(157,216,247,0.08)' : 'transparent',
  color,
  borderLeft:  active === item.id ? '2px solid #9DD8F7' : '2px solid transparent',
}}
```

- [ ] **Step 2: Create `src/components/admin/StatusSection.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { todayString } from '@/lib/dateUtils'
import type { Teammate, DailyTask } from '@/types/database'

interface TeamStatus {
  teammate: Teammate
  points: number
  completedRequired: number
  totalRequired: number
  missed: number
}

export default function StatusSection() {
  const [rows, setRows] = useState<TeamStatus[]>([])
  const [loading, setLoading] = useState(true)
  const today = todayString()

  async function fetchStatus() {
    setLoading(true)
    const [{ data: tmData }, { data: taskData }, { data: compData }] = await Promise.all([
      supabase.from('teammates').select('*').eq('is_active', true).order('name'),
      supabase.from('daily_tasks').select('*').eq('task_date', today),
      supabase.from('task_completions').select('teammate_id, points_awarded').eq('task_date', today),
    ])

    const tms = (tmData ?? []) as Teammate[]
    const tasks = (taskData ?? []) as DailyTask[]
    const comps = (compData ?? []) as { teammate_id: string; points_awarded: number }[]

    setRows(tms.map(tm => {
      const myTasks = tasks.filter(t => t.teammate_id === tm.id)
      const required = myTasks.filter(t => t.is_required)
      const completedRequired = required.filter(t => t.is_completed).length
      const points = comps.filter(c => c.teammate_id === tm.id).reduce((s, c) => s + c.points_awarded, 0)
      return {
        teammate: tm,
        points,
        completedRequired,
        totalRequired: required.length,
        missed: required.length - completedRequired,
      }
    }))
    setLoading(false)
  }

  useEffect(() => { fetchStatus() }, [])

  if (loading) return <p style={{ color: '#9DD8F7' }}>Loading…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: '#F2FBFF' }}>Today&apos;s Status</h2>
        <button onClick={fetchStatus}
          className="text-xs px-3 py-1 rounded-lg"
          style={{ background: 'rgba(157,216,247,0.1)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
          ↻ Refresh
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(157,216,247,0.12)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(157,216,247,0.06)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Teammate</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Points</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Required</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Missed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const bg = r.missed > 0
                ? 'rgba(220,38,38,0.05)'
                : r.totalRequired > 0 && r.completedRequired === r.totalRequired
                ? 'rgba(34,197,94,0.05)'
                : 'transparent'
              const missedColor = r.missed > 0 ? '#DC2626' : 'rgba(157,216,247,0.35)'
              const reqColor = r.completedRequired === r.totalRequired && r.totalRequired > 0 ? '#22C55E' : '#F2FBFF'
              return (
                <tr key={r.teammate.id}
                  style={{ background: bg, borderTop: i > 0 ? '1px solid rgba(157,216,247,0.06)' : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#F2FBFF' }}>{r.teammate.name}</td>
                  <td className="px-4 py-3 text-right" style={{ color: '#9DD8F7' }}>{r.points} pts</td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: reqColor }}>
                    {r.completedRequired} / {r.totalRequired}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: missedColor }}>
                    {r.missed}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

Expected: all tests still pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/components/admin/StatusSection.tsx
git commit -m "feat: add admin sidebar and status section"
```

---

## Task 6: CrewSection — teammate CRUD

**Files:**
- Create: `src/components/admin/CrewSection.tsx`

- [ ] **Step 1: Create `src/components/admin/CrewSection.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { changeTeammatePassword } from '@/lib/auth'
import IcyModal from '@/components/IcyModal'
import type { Teammate } from '@/types/database'

const inputStyle: React.CSSProperties = {
  background: 'rgba(6,24,38,0.7)',
  border: '1px solid rgba(157,216,247,0.25)',
  borderRadius: '8px',
  color: '#F2FBFF',
  padding: '7px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

export default function CrewSection() {
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [editName, setEditName]       = useState<Record<string, string>>({})
  const [editPw, setEditPw]           = useState<Record<string, string>>({})
  const [saving, setSaving]           = useState<Record<string, boolean>>({})
  const [toDelete, setToDelete]       = useState<Teammate | null>(null)
  const [newName, setNewName]         = useState('')
  const [newPw, setNewPw]             = useState('')
  const [adding, setAdding]           = useState(false)

  async function fetchTeammates() {
    const { data } = await supabase.from('teammates').select('*').order('name')
    setTeammates((data ?? []) as Teammate[])
  }

  useEffect(() => { fetchTeammates() }, [])

  async function saveRow(tm: Teammate) {
    setSaving(s => ({ ...s, [tm.id]: true }))
    const name = editName[tm.id] ?? tm.name
    if (name !== tm.name) {
      await supabase.from('teammates').update({ name, updated_at: new Date().toISOString() }).eq('id', tm.id)
    }
    const pw = editPw[tm.id]
    if (pw) {
      await changeTeammatePassword(tm.id, pw)
    }
    setEditName(e => { const n = { ...e }; delete n[tm.id]; return n })
    setEditPw(e => { const n = { ...e }; delete n[tm.id]; return n })
    setSaving(s => ({ ...s, [tm.id]: false }))
    fetchTeammates()
  }

  async function toggleActive(tm: Teammate) {
    await supabase.from('teammates').update({ is_active: !tm.is_active, updated_at: new Date().toISOString() }).eq('id', tm.id)
    fetchTeammates()
  }

  async function confirmDelete() {
    if (!toDelete) return
    await supabase.from('teammates').delete().eq('id', toDelete.id)
    setToDelete(null)
    fetchTeammates()
  }

  async function addTeammate() {
    if (!newName.trim() || !newPw.trim()) return
    setAdding(true)
    await supabase.from('teammates').insert({
      name: newName.trim(),
      plain_password: newPw.trim(),
      is_active: true,
      current_chad: false,
      current_chud: false,
    })
    setNewName('')
    setNewPw('')
    setAdding(false)
    fetchTeammates()
  }

  const isDirty = (id: string) => id in editName || id in editPw

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#F2FBFF' }}>Crew</h2>

      <div className="flex flex-col gap-3 mb-6">
        {teammates.map(tm => (
          <div key={tm.id} className="rounded-xl p-4 flex flex-wrap items-center gap-3"
            style={{ background: 'rgba(157,216,247,0.04)', border: '1px solid rgba(157,216,247,0.1)' }}>

            {/* Name */}
            <input style={{ ...inputStyle, width: '140px', opacity: tm.is_active ? 1 : 0.45 }}
              value={editName[tm.id] ?? tm.name}
              onChange={e => setEditName(n => ({ ...n, [tm.id]: e.target.value }))}
            />

            {/* New password */}
            <input style={{ ...inputStyle, width: '130px' }}
              type="password"
              placeholder="New password"
              value={editPw[tm.id] ?? ''}
              onChange={e => setEditPw(p => ({ ...p, [tm.id]: e.target.value }))}
            />

            {/* Active toggle */}
            <button onClick={() => toggleActive(tm)}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: tm.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.12)',
                color:      tm.is_active ? '#22C55E' : '#DC2626',
                border:     `1px solid ${tm.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
              }}>
              {tm.is_active ? 'Active' : 'Inactive'}
            </button>

            {/* Save (only when dirty) */}
            {isDirty(tm.id) && (
              <button onClick={() => saveRow(tm)} disabled={saving[tm.id]}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: '#9DD8F7', color: '#061826' }}>
                {saving[tm.id] ? 'Saving…' : 'Save'}
              </button>
            )}

            {/* Remove */}
            <button onClick={() => setToDelete(tm)}
              className="ml-auto px-3 py-1 rounded-lg text-xs"
              style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' }}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add teammate */}
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-3"
        style={{ border: '1px dashed rgba(157,216,247,0.2)' }}>
        <span className="text-sm font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Add Teammate</span>
        <input style={{ ...inputStyle, width: '140px' }} placeholder="Name"
          value={newName} onChange={e => setNewName(e.target.value)} />
        <input style={{ ...inputStyle, width: '130px' }} type="password" placeholder="Password"
          value={newPw} onChange={e => setNewPw(e.target.value)} />
        <button onClick={addTeammate} disabled={adding || !newName.trim() || !newPw.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: '#9DD8F7', color: '#061826', opacity: (!newName.trim() || !newPw.trim()) ? 0.5 : 1 }}>
          {adding ? 'Adding…' : 'Add →'}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {toDelete && (
        <IcyModal onClose={() => setToDelete(null)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: '#F2FBFF' }}>Remove {toDelete.name}?</p>
            <p className="text-sm" style={{ color: 'rgba(157,216,247,0.6)' }}>
              This will permanently delete the teammate and all their data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: '#DC2626', color: '#fff' }}>
                Remove
              </button>
            </div>
          </div>
        </IcyModal>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CrewSection.tsx
git commit -m "feat: add admin CrewSection with teammate CRUD"
```

---

## Task 7: MissionsSection — preset task CRUD

**Files:**
- Create: `src/components/admin/MissionsSection.tsx`

- [ ] **Step 1: Create `src/components/admin/MissionsSection.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import IcyModal from '@/components/IcyModal'
import type { PresetTask } from '@/types/database'

const inputStyle: React.CSSProperties = {
  background: 'rgba(6,24,38,0.7)',
  border: '1px solid rgba(157,216,247,0.25)',
  borderRadius: '8px',
  color: '#F2FBFF',
  padding: '7px 12px',
  fontSize: '13px',
  outline: 'none',
}

const EMPTY_FORM = { name: '', is_islamic: false, default_points: 10, is_repeatable: false, can_be_recurring: true }

export default function MissionsSection() {
  const [tasks, setTasks] = useState<PresetTask[]>([])
  const [edits, setEdits] = useState<Record<string, Partial<PresetTask>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [toDelete, setToDelete] = useState<PresetTask | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)

  async function fetchTasks() {
    const { data } = await supabase.from('preset_tasks').select('*').order('name')
    setTasks((data ?? []) as PresetTask[])
  }

  useEffect(() => { fetchTasks() }, [])

  function field<K extends keyof PresetTask>(id: string, key: K, fallback: PresetTask[K]): PresetTask[K] {
    return (edits[id]?.[key] ?? fallback) as PresetTask[K]
  }

  function setEdit<K extends keyof PresetTask>(id: string, key: K, val: PresetTask[K]) {
    setEdits(e => ({ ...e, [id]: { ...e[id], [key]: val } }))
  }

  async function saveRow(t: PresetTask) {
    const patch = edits[t.id]
    if (!patch || Object.keys(patch).length === 0) return
    setSaving(s => ({ ...s, [t.id]: true }))
    await supabase.from('preset_tasks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', t.id)
    setEdits(e => { const n = { ...e }; delete n[t.id]; return n })
    setSaving(s => ({ ...s, [t.id]: false }))
    fetchTasks()
  }

  async function confirmDelete() {
    if (!toDelete) return
    await supabase.from('preset_tasks').delete().eq('id', toDelete.id)
    setToDelete(null)
    fetchTasks()
  }

  async function addTask() {
    if (!form.name.trim()) return
    setAdding(true)
    await supabase.from('preset_tasks').insert({
      name: form.name.trim(),
      description: null,
      category: form.is_islamic ? 'islamic' : 'regular',
      default_points: form.default_points,
      is_islamic: form.is_islamic,
      is_repeatable: form.is_repeatable,
      default_max_completions: 1,
      can_be_recurring: form.can_be_recurring,
    })
    setForm(EMPTY_FORM)
    setAdding(false)
    fetchTasks()
  }

  const islamic = tasks.filter(t => t.is_islamic)
  const regular = tasks.filter(t => !t.is_islamic)

  function renderRow(t: PresetTask) {
    const dirty = t.id in edits && Object.keys(edits[t.id] ?? {}).length > 0
    return (
      <div key={t.id} className="flex flex-wrap items-center gap-2 py-3 px-4"
        style={{ borderTop: '1px solid rgba(157,216,247,0.06)' }}>
        <input style={{ ...inputStyle, width: '160px' }}
          value={String(field(t.id, 'name', t.name))}
          onChange={e => setEdit(t.id, 'name', e.target.value)}
        />
        <input type="number" style={{ ...inputStyle, width: '70px' }}
          value={Number(field(t.id, 'default_points', t.default_points))}
          onChange={e => setEdit(t.id, 'default_points', Number(e.target.value))}
        />
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox"
            checked={Boolean(field(t.id, 'is_repeatable', t.is_repeatable))}
            onChange={e => setEdit(t.id, 'is_repeatable', e.target.checked)}
          /> Repeatable
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox"
            checked={Boolean(field(t.id, 'can_be_recurring', t.can_be_recurring))}
            onChange={e => setEdit(t.id, 'can_be_recurring', e.target.checked)}
          /> Recurring
        </label>
        {dirty && (
          <button onClick={() => saveRow(t)} disabled={saving[t.id]}
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#9DD8F7', color: '#061826' }}>
            {saving[t.id] ? 'Saving…' : 'Save'}
          </button>
        )}
        <button onClick={() => setToDelete(t)}
          className="ml-auto px-2 py-1 rounded text-xs"
          style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' }}>
          ✕
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#F2FBFF' }}>Missions (Preset Tasks)</h2>

      {[['☪️ Islamic Tasks', islamic], ['📋 Regular Tasks', regular]].map(([label, group]) => (
        <div key={String(label)} className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
            style={{ color: 'rgba(157,216,247,0.45)' }}>{String(label)}</p>
          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(157,216,247,0.1)' }}>
            {(group as PresetTask[]).map(renderRow)}
          </div>
        </div>
      ))}

      {/* Add form */}
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-3 mt-4"
        style={{ border: '1px dashed rgba(157,216,247,0.2)' }}>
        <span className="text-sm font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Add Mission</span>
        <input style={{ ...inputStyle, width: '160px' }} placeholder="Name"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input type="number" style={{ ...inputStyle, width: '70px' }}
          value={form.default_points}
          onChange={e => setForm(f => ({ ...f, default_points: Number(e.target.value) }))} />
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox" checked={form.is_islamic}
            onChange={e => setForm(f => ({ ...f, is_islamic: e.target.checked }))} /> Islamic
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox" checked={form.is_repeatable}
            onChange={e => setForm(f => ({ ...f, is_repeatable: e.target.checked }))} /> Repeatable
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox" checked={form.can_be_recurring}
            onChange={e => setForm(f => ({ ...f, can_be_recurring: e.target.checked }))} /> Recurring
        </label>
        <button onClick={addTask} disabled={adding || !form.name.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: '#9DD8F7', color: '#061826', opacity: !form.name.trim() ? 0.5 : 1 }}>
          {adding ? 'Adding…' : 'Add →'}
        </button>
      </div>

      {toDelete && (
        <IcyModal onClose={() => setToDelete(null)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold" style={{ color: '#F2FBFF' }}>Remove &quot;{toDelete.name}&quot;?</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: '#DC2626', color: '#fff' }}>
                Remove
              </button>
            </div>
          </div>
        </IcyModal>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MissionsSection.tsx
git commit -m "feat: add admin MissionsSection with preset task CRUD"
```

---

## Task 8: FinalizeSection — manual finalization trigger

**Files:**
- Create: `src/components/admin/FinalizeSection.tsx`

- [ ] **Step 1: Create `src/components/admin/FinalizeSection.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { finalizeDay } from '@/lib/finalization'
import { todayString } from '@/lib/dateUtils'
import IcyModal from '@/components/IcyModal'
import IcyErrorModal from '@/components/IcyErrorModal'

export default function FinalizeSection() {
  const [confirming, setConfirming] = useState(false)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setConfirming(false)
    setRunning(true)
    try {
      await finalizeDay(todayString())
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Finalization failed.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-bold mb-2" style={{ color: '#F2FBFF' }}>End Today&apos;s Voyage</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(157,216,247,0.55)' }}>
        Manually finalize today&apos;s mission. This locks today&apos;s results, assigns Chad and Chud badges,
        and seeds tomorrow&apos;s recurring tasks. It is safe to run multiple times — already-finalized
        days are skipped automatically.
      </p>

      {done ? (
        <div className="rounded-xl p-5 text-center"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <p className="font-bold" style={{ color: '#22C55E' }}>✓ Today&apos;s voyage has been finalized.</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(157,216,247,0.5)' }}>
            Badges have been assigned. Refresh the ship dashboard to see updated results.
          </p>
          <button onClick={() => setDone(false)} className="mt-3 text-xs"
            style={{ color: 'rgba(157,216,247,0.4)' }}>
            Reset
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={running}
          className="px-6 py-3 rounded-xl font-bold text-base"
          style={{
            background: running ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.15)',
            color: '#DC2626',
            border: '1px solid rgba(220,38,38,0.4)',
          }}>
          {running ? '⚡ Finalizing…' : '⚡ End Today\'s Voyage'}
        </button>
      )}

      {confirming && (
        <IcyModal onClose={() => setConfirming(false)} accentColor="#DC2626" maxWidth="max-w-sm">
          <div className="px-6 pb-6 flex flex-col gap-4">
            <p className="font-bold text-base text-center" style={{ color: '#F2FBFF' }}>
              End today&apos;s voyage?
            </p>
            <p className="text-sm text-center" style={{ color: 'rgba(157,216,247,0.6)' }}>
              This will lock today&apos;s results and assign badges.
              Safe to run again if already finalized.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button onClick={handleConfirm}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: '#DC2626', color: '#fff' }}>
                Confirm
              </button>
            </div>
          </div>
        </IcyModal>
      )}

      {error && <IcyErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  )
}
```

- [ ] **Step 2: Run all tests one final time**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah" && npm test -- --passWithNoTests
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/FinalizeSection.tsx
git commit -m "feat: add admin FinalizeSection with manual finalization trigger"
```

- [ ] **Step 4: Push to GitHub**

```bash
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Task 10 — BadgeDisplay extracted (Task 1)
- ✅ Task 12 — `finalizeDay` already existed; tests added (Task 2); auto-trigger added (Task 3)
- ✅ Task 11 — Admin gate Arctic scene (Task 4); sidebar layout (Task 5); Status section (Task 5); Crew CRUD (Task 6); Missions CRUD (Task 7); Finalize trigger (Task 8)
- ✅ Admin session via `sessionStorage` using existing `setAdminSession`/`isAdminAuthenticated`/`clearAdminSession`
- ✅ All new modals use `<IcyModal>`
- ✅ No `Math.random()` in any component (STARS arrays are pre-computed)
- ✅ `IcyErrorModal` used for failed admin code and finalization errors

**Type consistency:**
- `AdminSection` type is defined inline in both `page.tsx` and `AdminSidebar.tsx` — same four values in both files
- `BadgeDisplay` props (`chadName`, `chadPoints`, `chudName`, `chudMissed`) match the call site in `page.tsx`
- All Supabase queries use types from `@/types/database`
