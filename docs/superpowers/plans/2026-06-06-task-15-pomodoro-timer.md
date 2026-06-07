# Pomodoro Timer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable Pomodoro timer with a breathing exercise overlay to the teammate dashboard.

**Architecture:** Single self-contained client component `PomodoroTimer.tsx`. Timer state lives in React (`useRef` for endTime to handle background tabs via `visibilitychange`). Breathing overlay is rendered conditionally inside the same component as a fixed full-screen div. No Supabase, no shared state.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS transitions (no external animation library)

---

### Task 1: Create PomodoroTimer — timer logic

**Files:**
- Create: `src/components/pomodoro/PomodoroTimer.tsx`

- [ ] **Step 1: Create the file with timer state and logic**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_FOCUS = 25
const DEFAULT_BREAK = 5

export default function PomodoroTimer() {
  const [focusMins, setFocusMins] = useState(DEFAULT_FOCUS)
  const [breakMins, setBreakMins] = useState(DEFAULT_BREAK)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS * 60)
  const [running, setRunning] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)

  const endTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick every second
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          // Auto-switch mode
          setMode(prev => {
            const next = prev === 'focus' ? 'break' : 'focus'
            const nextSecs = (next === 'focus' ? focusMins : breakMins) * 60
            endTimeRef.current = Date.now() + nextSecs * 1000
            return next
          })
          setShowBreathing(false)
          return (mode === 'focus' ? breakMins : focusMins) * 60
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode, focusMins, breakMins])

  // visibilitychange drift correction
  useEffect(() => {
    const onVisible = () => {
      if (!running || !endTimeRef.current) return
      setSecondsLeft(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  function start() {
    endTimeRef.current = Date.now() + secondsLeft * 1000
    setRunning(true)
  }

  function pause() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setShowBreathing(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setMode('focus')
    setFocusMins(DEFAULT_FOCUS)
    setBreakMins(DEFAULT_BREAK)
    setSecondsLeft(DEFAULT_FOCUS * 60)
    endTimeRef.current = null
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(11,53,88,0.4)', border: '1px solid rgba(157,216,247,0.1)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>Focus Timer</p>
      {/* Placeholder — UI added in Task 2 */}
      <p style={{ color: '#F2FBFF' }}>{mm}:{ss}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/pomodoro/PomodoroTimer.tsx
git commit -m "feat: PomodoroTimer — timer logic (no UI yet)"
```

---

### Task 2: Timer card UI

**Files:**
- Modify: `src/components/pomodoro/PomodoroTimer.tsx`

- [ ] **Step 1: Replace the placeholder return with the full card UI**

Replace everything inside the outer `<div>` after the section label with:

```tsx
      {/* Duration inputs — only shown when stopped */}
      {!running && (
        <div className="flex gap-4 mb-4">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs" style={{ color: 'rgba(157,216,247,0.5)' }}>Focus (min)</span>
            <input
              type="number"
              min={1}
              value={focusMins}
              onChange={e => {
                const v = Math.max(1, Number(e.target.value))
                setFocusMins(v)
                if (mode === 'focus') setSecondsLeft(v * 60)
              }}
              className="rounded-lg px-3 py-2 text-sm w-full"
              style={{ background: 'rgba(6,24,38,0.6)', border: '1px solid rgba(157,216,247,0.15)', color: '#F2FBFF' }}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs" style={{ color: 'rgba(157,216,247,0.5)' }}>Rest (min)</span>
            <input
              type="number"
              min={1}
              value={breakMins}
              onChange={e => {
                const v = Math.max(1, Number(e.target.value))
                setBreakMins(v)
                if (mode === 'break') setSecondsLeft(v * 60)
              }}
              className="rounded-lg px-3 py-2 text-sm w-full"
              style={{ background: 'rgba(6,24,38,0.6)', border: '1px solid rgba(157,216,247,0.15)', color: '#F2FBFF' }}
            />
          </label>
        </div>
      )}

      {/* MM:SS display */}
      <p className="text-center font-bold tracking-widest mb-1" style={{ fontSize: '36px', color: '#F2FBFF', letterSpacing: '6px' }}>
        {mm}:{ss}
      </p>

      {/* Mode label */}
      <p className="text-center text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: mode === 'focus' ? '#9DD8F7' : '#22C55E' }}>
        {mode === 'focus' ? 'Focus' : 'Break'}
      </p>

      {/* Buttons */}
      <div className="flex gap-3 justify-center mb-3">
        <button
          onClick={running ? pause : start}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: '#9DD8F7', color: '#061826' }}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#F2FBFF', border: '1px solid rgba(157,216,247,0.2)' }}
        >
          Reset
        </button>
      </div>

      {/* Breathing exercise button — break mode only */}
      {mode === 'break' && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowBreathing(true)}
            className="rounded-lg px-4 py-2 text-sm"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            🫁 Breathing Exercise
          </button>
        </div>
      )}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/pomodoro/PomodoroTimer.tsx
git commit -m "feat: PomodoroTimer — timer card UI"
```

---

### Task 3: Breathing exercise overlay

**Files:**
- Modify: `src/components/pomodoro/PomodoroTimer.tsx`

- [ ] **Step 1: Add breathing phase logic**

Add these constants and hook just above the `return` statement in the component:

```tsx
  // Breathing phase: 0=breathe-in, 1=hold, 2=breathe-out, 3=hold
  const PHASE_LABELS = ['Breathe in', 'Hold', 'Breathe out', 'Hold']
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathTick, setBreathTick] = useState(0) // 0–4 counts within phase

  useEffect(() => {
    if (!showBreathing) {
      setBreathPhase(0)
      setBreathTick(0)
      return
    }
    const t = setInterval(() => {
      setBreathTick(tick => {
        if (tick >= 4) {
          setBreathPhase(p => (p + 1) % 4)
          return 0
        }
        return tick + 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [showBreathing])
```

- [ ] **Step 2: Add the overlay JSX**

Add this block just before the closing `</div>` of the component's root element:

```tsx
      {/* ── Breathing Exercise Overlay ── */}
      {showBreathing && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{ background: '#020810' }}
        >
          {/* Animated circle with scaling text inside */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Scale: big on phase 0 (breathe-in) and 1 (hold-big), small on 2 and 3
              transform: breathPhase === 0 || breathPhase === 1 ? 'scale(1)' : 'scale(0.55)',
              transition: breathPhase === 0 ? 'transform 5s ease-in-out' : breathPhase === 2 ? 'transform 5s ease-in-out' : 'transform 0.1s',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'rgba(157,216,247,0.15)',
              border: '2px solid rgba(157,216,247,0.4)',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Small fixed timer inside circle */}
            <span style={{ fontSize: '14px', color: 'rgba(157,216,247,0.6)', fontWeight: 'bold', letterSpacing: '2px' }}>
              {mm}:{ss}
            </span>
            {/* Instruction text — scales with circle */}
            <span style={{ fontSize: '16px', color: '#F2FBFF', fontWeight: '600', textAlign: 'center' }}>
              {PHASE_LABELS[breathPhase]}
            </span>
          </div>

          {/* Fixed stop button */}
          <button
            onClick={() => setShowBreathing(false)}
            className="fixed bottom-10 rounded-lg px-6 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#F2FBFF', border: '1px solid rgba(157,216,247,0.2)' }}
          >
            Stop exercise
          </button>
        </div>
      )}
```

- [ ] **Step 3: Auto-close overlay when break ends**

Inside the existing tick `setInterval` effect (Task 1), the mode-switch already calls `setShowBreathing(false)` — confirm it's there. No additional change needed.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/pomodoro/PomodoroTimer.tsx
git commit -m "feat: PomodoroTimer — breathing exercise overlay"
```

---

### Task 4: Embed in teammate dashboard

**Files:**
- Modify: `src/app/teammate/[teammateId]/page.tsx`

- [ ] **Step 1: Add import**

At the top of `src/app/teammate/[teammateId]/page.tsx`, add:

```tsx
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer'
```

- [ ] **Step 2: Add component between heatmap and Required Repairs**

Find the comment `{/* ── Required tasks ── */}` and insert `<PomodoroTimer />` immediately before it:

```tsx
        <PomodoroTimer />

        {/* ─��� Required tasks ── */}
```

- [ ] **Step 3: Verify TypeScript compiles and tests pass**

```bash
npx tsc --noEmit && npm test
```
Expected: no errors, 60 tests passing.

- [ ] **Step 4: Commit**

```bash
git add "src/app/teammate/[teammateId]/page.tsx"
git commit -m "feat: embed PomodoroTimer on teammate dashboard"
```

---

### Task 5: Docs + push

**Files:**
- Modify: `docs/handoff.md`
- Modify: `docs/todo.md`

- [ ] **Step 1: Mark Task 15 complete in todo.md**

Check off all three items under Task 15 in `docs/todo.md`.

- [ ] **Step 2: Append Task 15 summary to handoff.md**

Append under the Task 14 section:

```markdown
## ✅ Task 15 — Pomodoro Timer (2026-06-06)

Single file: `src/components/pomodoro/PomodoroTimer.tsx`.

**Timer logic:**
- Configurable focus/break durations (inputs shown only when stopped; hidden while running)
- Default 25 min focus / 5 min break; Reset restores defaults
- Indefinite auto-cycle (focus → break → focus …) until Reset
- `visibilitychange` fix: `endTimeRef` stores absolute end timestamp; corrects drift when tab regains focus

**Breathing exercise overlay:**
- Triggered by `🫁 Breathing Exercise` button (break mode only)
- Full-screen `#020810` overlay; circle scales via CSS `transform: scale()` transition
- 4-phase box-breathing, 5s each: breathe in → hold → breathe out → hold
- Instruction text inside circle scales with it (same transform); break countdown fixed small above text
- `Stop exercise` button fixed at bottom; overlay also auto-closes when break countdown hits 0

**Placement:** between Activity Heatmap and Required Repairs in `/teammate/[id]`

**Next task:** Task 16 — Ship Animations & Visual Polish
```

- [ ] **Step 3: Update next task pointer in handoff.md**

Update the `## ⏭️ Next Task` section to point to Task 16.

- [ ] **Step 4: Commit and push**

```bash
git add docs/handoff.md docs/todo.md
git commit -m "docs: mark Task 15 complete, update handoff"
git push
```
