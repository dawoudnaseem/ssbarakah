# Icy Modal System & Delete Task — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a shared `IcyModal` wrapper with SVG icicles and a glossy-ice card, retrofit all existing modals to use it, then add a delete-task button to every `TaskRow` with a scoped confirmation modal.

**Architecture:** `IcyModal` is a pure presentational wrapper (backdrop + icicle SVG + styled card shell); all content is passed as children. `IcyErrorModal` and `LoginModal` drop their own card styles and wrap with `IcyModal`. A new `DeleteConfirmModal` also uses `IcyModal` and receives `isRecurring` to choose between a two-button and three-button layout. The teammate dashboard stores `recurringTasks` in state (already fetched in the seed effect) and computes `isRecurring` per task to feed the modal.

**Tech Stack:** React · TypeScript · Tailwind CSS · Next.js 16 App Router · Supabase JS client

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| NEW | `src/components/IcyModal.tsx` | Backdrop + icicle SVG + glossy card shell |
| NEW | `src/components/DeleteConfirmModal.tsx` | Delete confirmation; 2-btn or 3-btn variant |
| EDIT | `src/components/IcyErrorModal.tsx` | Swap hand-rolled card for `IcyModal` |
| EDIT | `src/components/LoginModal.tsx` | Swap hand-rolled card for `IcyModal` |
| EDIT | `src/app/teammate/[teammateId]/page.tsx` | Store `recurringTasks` state; add `deleteTask` handler; wire `TaskRow` delete button; mount `DeleteConfirmModal` |
| EDIT | `docs/handoff.md` | Document new components and updated modals |
| EDIT | `docs/SS_Barakah_Requirements.md` | Update modal appearance section; add delete-task behaviour |
| EDIT | `docs/todo.md` | Add completed task entry; add IcyModal note to future modal tasks |

---

## Task 1: Create `IcyModal` base component

**Files:**
- Create: `src/components/IcyModal.tsx`

- [ ] **Step 1: Create the file with the full implementation**

```tsx
'use client'

interface IcyModalProps {
  onClose: () => void
  children: React.ReactNode
  accentColor?: string
  maxWidth?: string
}

// 8 icicles: [x-offset-%, width, height] — all values in SVG user units (viewBox width = 400)
const ICICLES: [number, number, number][] = [
  [18,  14, 38],
  [60,  10, 26],
  [98,  16, 44],
  [142, 11, 30],
  [182, 15, 42],
  [228, 10, 22],
  [268, 16, 46],
  [318, 12, 34],
]

export default function IcyModal({ onClose, children, maxWidth = 'max-w-sm' }: IcyModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,24,38,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden`}
        style={{
          background: 'linear-gradient(160deg, rgba(200,230,255,0.18) 0%, rgba(11,53,88,0.75) 100%)',
          border: '1px solid rgba(200,235,255,0.35)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(157,216,247,0.08), inset 0 1px 0 rgba(255,255,255,0.25)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icicles along top inner edge */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
          <svg
            viewBox="0 0 400 50"
            preserveAspectRatio="none"
            width="100%"
            height="52px"
            aria-hidden
          >
            {ICICLES.map(([x, w, h], i) => (
              <g key={i}>
                {/* Main icicle body */}
                <polygon
                  points={`${x},0 ${x + w},0 ${x + w / 2},${h}`}
                  fill="rgba(200,235,255,0.55)"
                />
                {/* Highlight line down left edge */}
                <line
                  x1={x + 2} y1={0}
                  x2={x + w / 2 - 1} y2={h - 4}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Content area — padded to clear icicles */}
        <div className="relative" style={{ zIndex: 2, paddingTop: '60px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing errors unrelated to this file).

- [ ] **Step 3: Run tests to confirm nothing broken**

```bash
npm test
```

Expected: `47 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/components/IcyModal.tsx
git commit -m "feat: add IcyModal base component with icicles and glossy-ice card"
```

---

## Task 2: Retrofit `IcyErrorModal` to use `IcyModal`

**Files:**
- Modify: `src/components/IcyErrorModal.tsx`

The current file has its own hand-rolled card (background, border, shadow). Replace it with `<IcyModal>`. Keep the ❄️ icon, red message text, and Dismiss button — just pass them as children.

- [ ] **Step 1: Rewrite the file**

```tsx
'use client'

import IcyModal from './IcyModal'

interface IcyErrorModalProps {
  message: string
  onDismiss: () => void
}

export default function IcyErrorModal({ message, onDismiss }: IcyErrorModalProps) {
  return (
    <IcyModal onClose={onDismiss} accentColor="#DC2626">
      <div className="flex flex-col items-center gap-4 px-6 pb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)' }}
        >
          ❄️
        </div>
        <p className="text-sm text-center leading-relaxed" style={{ color: '#fca5a5' }}>
          {message}
        </p>
        <button
          onClick={onDismiss}
          className="mt-1 px-6 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', minHeight: '44px' }}
        >
          Dismiss
        </button>
      </div>
    </IcyModal>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: `47 passed`.

- [ ] **Step 3: Commit**

```bash
git add src/components/IcyErrorModal.tsx
git commit -m "refactor: IcyErrorModal now uses IcyModal base wrapper"
```

---

## Task 3: Retrofit `LoginModal` to use `IcyModal`

**Files:**
- Modify: `src/components/LoginModal.tsx`

The current file wraps everything in a hand-rolled card div. Replace that card div with `<IcyModal onClose={onClose}>`. The backdrop div becomes unnecessary — `IcyModal` provides it. Keep the ship SVG, title, form, and ✕ button as children.

- [ ] **Step 1: Rewrite the file**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginTeammate } from '@/lib/auth'
import IcyModal from './IcyModal'
import IcyErrorModal from './IcyErrorModal'

interface LoginModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const teammate = await loginTeammate(name.trim(), password)
    setLoading(false)
    if (!teammate) {
      setError('Invalid name or password. The sea denies you passage.')
      return
    }
    onSuccess()
    router.push(`/teammate/${teammate.id}`)
  }

  return (
    <>
      <IcyModal onClose={onClose}>
        <div className="relative flex flex-col gap-5 px-8 pb-8">
          {/* Ship icon + title */}
          <div className="flex flex-col items-center gap-1">
            <svg width="60" height="32" viewBox="0 0 160 80" fill="none" aria-hidden>
              <path d="M20 50 L140 50 L125 70 L35 70 Z" fill="#061826" stroke="#9DD8F7" strokeWidth="1.5" />
              <rect x="35" y="35" width="90" height="15" fill="#0B3558" stroke="#9DD8F7" strokeWidth="1" />
              <rect x="55" y="18" width="45" height="17" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
              <line x1="80" y1="5" x2="80" y2="35" stroke="#9DD8F7" strokeWidth="2" />
              <polygon points="80,5 95,11 80,17" fill="#F59E0B" />
              <rect x="62" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
              <rect x="75" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
              <rect x="88" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
            </svg>
            <h2 className="text-xl font-bold tracking-wide" style={{ color: '#F2FBFF' }}>S.S. Barakah</h2>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="modal-name" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
                Name
              </label>
              <input
                id="modal-name"
                type="text"
                autoComplete="username"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dawoud"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                style={{
                  background: 'rgba(6,24,38,0.7)',
                  border: '1px solid rgba(157,216,247,0.25)',
                  color: '#F2FBFF',
                  caretColor: '#9DD8F7',
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="modal-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
                Password
              </label>
              <input
                id="modal-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                style={{
                  background: 'rgba(6,24,38,0.7)',
                  border: '1px solid rgba(157,216,247,0.25)',
                  color: '#F2FBFF',
                  caretColor: '#9DD8F7',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-bold text-sm tracking-wide transition-opacity disabled:opacity-50 hover:opacity-85"
              style={{ background: '#9DD8F7', color: '#061826', minHeight: '48px' }}
            >
              {loading ? 'Boarding…' : 'Board →'}
            </button>
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-xs opacity-50 hover:opacity-80 transition-opacity p-1"
            style={{ color: '#9DD8F7' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </IcyModal>

      {error && <IcyErrorModal message={error} onDismiss={() => setError('')} />}
    </>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: `47 passed`.

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginModal.tsx
git commit -m "refactor: LoginModal now uses IcyModal base wrapper"
```

---

## Task 4: Create `DeleteConfirmModal`

**Files:**
- Create: `src/components/DeleteConfirmModal.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import IcyModal from './IcyModal'
import type { DailyTask } from '@/types/database'

interface DeleteConfirmModalProps {
  task: DailyTask
  isRecurring: boolean
  onCancel: () => void
  onDeleteToday: () => void
  onDeleteForever: () => void
}

export default function DeleteConfirmModal({
  task,
  isRecurring,
  onCancel,
  onDeleteToday,
  onDeleteForever,
}: DeleteConfirmModalProps) {
  return (
    <IcyModal onClose={onCancel} accentColor="#DC2626">
      <div className="flex flex-col gap-5 px-6 pb-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)' }}
          >
            🔧
          </div>
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: '#F2FBFF' }}>
            &ldquo;{task.name}&rdquo;
          </p>
          <p className="text-sm" style={{ color: 'rgba(242,251,255,0.7)' }}>
            Remove this repair from today&apos;s log?
          </p>
          {isRecurring && (
            <p className="text-xs" style={{ color: 'rgba(242,251,255,0.5)' }}>
              This task repeats daily. Remove just today, or stop it forever?
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {isRecurring ? (
            <>
              <button
                onClick={onDeleteToday}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', minHeight: '44px' }}
              >
                Remove today only
              </button>
              <button
                onClick={onDeleteForever}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(220,38,38,0.35)', border: '1px solid rgba(220,38,38,0.6)', color: '#fca5a5', minHeight: '44px' }}
              >
                Remove forever
              </button>
            </>
          ) : (
            <button
              onClick={onDeleteToday}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(220,38,38,0.5)', color: '#fca5a5', minHeight: '44px' }}
            >
              Remove
            </button>
          )}

          <button
            onClick={onCancel}
            className="w-full rounded-lg py-2.5 text-sm transition-opacity hover:opacity-80"
            style={{ background: 'rgba(157,216,247,0.08)', border: '1px solid rgba(157,216,247,0.2)', color: 'rgba(242,251,255,0.6)', minHeight: '44px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </IcyModal>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: `47 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/components/DeleteConfirmModal.tsx
git commit -m "feat: add DeleteConfirmModal with today-only / forever variant for recurring tasks"
```

---

## Task 5: Wire delete into the teammate dashboard

**Files:**
- Modify: `src/app/teammate/[teammateId]/page.tsx`

This task has five sub-steps:
1. Add `recurringTasks` state and populate it from the existing seed effect
2. Add `taskToDelete` state to track which task the modal is open for
3. Add `deleteTask` handler function
4. Update `TaskRow` signature to accept and render a delete button
5. Mount `<DeleteConfirmModal>` conditionally at the bottom of the JSX

- [ ] **Step 1: Add `recurringTasks` state**

Near the top of the component, after the existing state declarations (around line 50), add:

```tsx
const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
const [taskToDelete, setTaskToDelete] = useState<DailyTask | null>(null)
```

`RecurringTask` is already imported at the top of the file.

- [ ] **Step 2: Populate `recurringTasks` inside the seed effect**

The existing `seedRecurring` `useEffect` already fetches `recurring_tasks`. Save that result to state. Find this block (around line 109):

```tsx
const { data: recurring } = await supabase
  .from('recurring_tasks')
  .select('*')
  .eq('teammate_id', teammateId)
  .eq('is_active', true)
if (!recurring || recurring.length === 0) return
```

Replace with:

```tsx
const { data: recurring } = await supabase
  .from('recurring_tasks')
  .select('*')
  .eq('teammate_id', teammateId)
  .eq('is_active', true)
setRecurringTasks((recurring as RecurringTask[]) ?? [])
if (!recurring || recurring.length === 0) return
```

- [ ] **Step 3: Add `deleteTask` handler**

Add this function after the `addPresetTask` function (around line 280):

```tsx
async function deleteTask(task: DailyTask, scope: 'today' | 'forever') {
  setTaskToDelete(null)
  // Optimistic removal
  setTasks(prev => prev.filter(t => t.id !== task.id))

  // Remove completions first (FK constraint)
  await supabase.from('task_completions').delete().eq('daily_task_id', task.id)

  // Remove the daily task row
  const { error } = await supabase.from('daily_tasks').delete().eq('id', task.id)

  if (scope === 'forever' && task.preset_task_id) {
    await supabase
      .from('recurring_tasks')
      .delete()
      .eq('teammate_id', task.teammate_id)
      .eq('preset_task_id', task.preset_task_id)
    // Refresh recurring tasks state
    setRecurringTasks(prev => prev.filter(rt => rt.preset_task_id !== task.preset_task_id))
  }

  if (error) await fetchTasks()
}
```

- [ ] **Step 4: Update `TaskRow` to accept and render a delete button**

Find the `TaskRow` function definition at the bottom of the file. Change its signature and add the ✕ button:

```tsx
function TaskRow({
  task,
  onComplete,
  onDelete,
}: {
  task: DailyTask
  onComplete: (t: DailyTask) => void
  onDelete: (t: DailyTask) => void
}) {
  const done = task.is_completed
  const disabled = !isTaskCompletable(task)

  return (
    <li
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{
        background: done ? 'rgba(34,197,94,0.08)' : 'rgba(11,53,88,0.5)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'rgba(157,216,247,0.1)'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: done ? 'rgba(242,251,255,0.5)' : '#F2FBFF', textDecoration: done && !task.is_repeatable ? 'line-through' : 'none' }}
        >
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs" style={{ color: '#9DD8F7' }}>{task.points} pts</span>
          {task.is_repeatable && (
            <span className="text-xs" style={{ color: 'rgba(242,251,255,0.4)' }}>
              {task.completion_count}/{task.max_completions}
            </span>
          )}
          {task.category === 'islamic' && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              ☾ Islamic
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task)}
        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-opacity hover:opacity-80"
        style={{
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.25)',
          color: 'rgba(220,38,38,0.7)',
          minHeight: '44px',
          minWidth: '44px',
        }}
        aria-label="Remove task"
      >
        ✕
      </button>

      {/* Complete button */}
      <button
        disabled={disabled}
        onClick={() => onComplete(task)}
        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-opacity disabled:opacity-30"
        style={{
          background: done && !task.is_repeatable ? 'rgba(34,197,94,0.2)' : '#9DD8F7',
          color: '#061826',
          minHeight: '44px',
          minWidth: '44px',
        }}
        aria-label={done ? 'Completed' : 'Mark complete'}
      >
        {done && !task.is_repeatable ? '✓' : '+'}
      </button>
    </li>
  )
}
```

- [ ] **Step 5: Pass `onDelete` to all `<TaskRow>` usages**

There are two `<TaskRow>` render sites in the JSX — one in the required tasks section, one in the optional tasks section. Update both:

```tsx
{/* Required tasks list */}
{required.map(task => (
  <TaskRow key={task.id} task={task} onComplete={completeTask} onDelete={setTaskToDelete} />
))}

{/* Optional tasks list */}
{optional.map(task => (
  <TaskRow key={task.id} task={task} onComplete={completeTask} onDelete={setTaskToDelete} />
))}
```

- [ ] **Step 6: Add the import and mount `<DeleteConfirmModal>`**

Add the import at the top of the file alongside the other component imports:

```tsx
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
```

At the end of the returned JSX, just before the closing `</div></main>`, add:

```tsx
{taskToDelete && (
  <DeleteConfirmModal
    task={taskToDelete}
    isRecurring={recurringTasks.some(
      rt => rt.preset_task_id === taskToDelete.preset_task_id && taskToDelete.preset_task_id !== null
    )}
    onCancel={() => setTaskToDelete(null)}
    onDeleteToday={() => deleteTask(taskToDelete, 'today')}
    onDeleteForever={() => deleteTask(taskToDelete, 'forever')}
  />
)}
```

- [ ] **Step 7: Run TypeScript check**

```bash
cd "/Users/da_nasss/Desktop/1- Addiction Combatting App/ssbarakah"
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 8: Run tests**

```bash
npm test
```

Expected: `47 passed`.

- [ ] **Step 9: Commit**

```bash
git add "src/app/teammate/[teammateId]/page.tsx"
git commit -m "feat: add delete task button and DeleteConfirmModal to teammate dashboard"
```

---

## Task 6: Update docs

**Files:**
- Modify: `docs/handoff.md`
- Modify: `docs/SS_Barakah_Requirements.md`
- Modify: `docs/todo.md`

- [ ] **Step 1: Update `docs/handoff.md` component table**

In the "Current File Structure" section, update the components block to add `IcyModal.tsx` and `DeleteConfirmModal.tsx`, and note that `IcyErrorModal` and `LoginModal` now use the wrapper:

```
  components/
    IcyModal.tsx                — base modal wrapper: backdrop + SVG icicles + glossy-ice card shell
    ConditionalNav.tsx          — hides NavBar on /login; renders h-14 spacer elsewhere
    NavBar.tsx                  — fixed top bar; logo, nav links, avatar dropdown, hamburger
    LoginModal.tsx              — overlay login form triggered from NavBar; uses IcyModal
    IcyErrorModal.tsx           — frosted glass error modal (red border, dismiss on click); uses IcyModal
    DeleteConfirmModal.tsx      — delete task confirmation; 2-btn (non-recurring) or 3-btn (recurring) variant; uses IcyModal
```

Then append a new completed task section for this feature (after the Task 8 section):

```markdown
### ✅ Icy Modal System & Delete Task (2026-06-06)

**IcyModal (`src/components/IcyModal.tsx`):**
- Shared base wrapper for all modals — provides backdrop blur, SVG icicle strip along top inner edge (8 icicles, varying heights 22–46px, semi-transparent white-blue), glossy-ice card (white-tinted gradient → navy, bright ice-white border, inset highlight)
- Props: `onClose`, `children`, `accentColor?` (default `#9DD8F7`), `maxWidth?` (default `max-w-sm`)
- All future modals must use this wrapper

**Retrofitted modals:**
- `IcyErrorModal` — now uses `<IcyModal accentColor="#DC2626">`; content (❄️ icon, red message, Dismiss button) unchanged
- `LoginModal` — now uses `<IcyModal>`; content (ship SVG, inputs, Board button) unchanged

**DeleteConfirmModal (`src/components/DeleteConfirmModal.tsx`):**
- Non-recurring: Cancel + Remove (red)
- Recurring: Cancel + Remove today only + Remove forever
- "Remove forever" deletes `recurring_tasks` row so task never seeds again; "Remove today only" leaves it intact

**Teammate dashboard changes (`src/app/teammate/[teammateId]/page.tsx`):**
- `recurringTasks` stored in state (populated from existing seed effect)
- `taskToDelete: DailyTask | null` state controls modal visibility
- `deleteTask(task, scope)` — optimistic removal, deletes `task_completions` then `daily_tasks`, optionally `recurring_tasks`
- `TaskRow` gains `onDelete` prop and a red ✕ button (44px tap target) to the left of the complete button
```

- [ ] **Step 2: Update `docs/SS_Barakah_Requirements.md`**

Find the section describing modal appearance (search for "modal" or "IcyErrorModal"). Add or update text to describe the icy design standard:

```
All modals in S.S. Barakah use the IcyModal base component, which provides:
- A full-screen backdrop with blur
- A glossy-ice card: white-tinted gradient fading to deep navy, bright ice-white border, inset top highlight
- SVG icicles hanging from the top inner rim of the card (8 icicles, varying heights, semi-transparent blue-white)
- Content rendered below the icicles with appropriate padding
```

Also find the teammate dashboard section (search for "§4" or "Teammate Dashboard") and add:

```
**Delete task:** Any task (required, optional, completed, or pending) can be removed by pressing the ✕ button on its row. A confirmation modal appears. If the task is recurring (has a matching entry in `recurring_tasks`), the modal offers two delete options: remove today only (leaves the recurring rule intact), or remove forever (deletes the recurring rule so the task never seeds again). Non-recurring tasks show a single Remove button.
```

- [ ] **Step 3: Update `docs/todo.md`**

After the Task 8 section and before Task 9, add:

```markdown
## ✅ Icy Modal System & Delete Task (2026-06-06)

- [x] Created `src/components/IcyModal.tsx` — shared base wrapper with SVG icicles and glossy-ice card
- [x] Retrofitted `IcyErrorModal` and `LoginModal` to use `IcyModal`
- [x] Created `DeleteConfirmModal` with today-only / forever variants for recurring tasks
- [x] Added delete button to `TaskRow`; wired `deleteTask` handler in teammate dashboard

> **Note for future tasks:** Any new modal must use `<IcyModal>` as its wrapper. Do not hand-roll backdrop/card styles.
```

- [ ] **Step 4: Commit all doc changes**

```bash
git add docs/handoff.md docs/SS_Barakah_Requirements.md docs/todo.md
git commit -m "docs: update handoff, requirements, and todo for icy modal system and delete task"
```

---

## Task 7: Push to GitHub

- [ ] **Step 1: Push**

```bash
git push origin main
```

Expected: all commits from Tasks 1–6 pushed successfully.
