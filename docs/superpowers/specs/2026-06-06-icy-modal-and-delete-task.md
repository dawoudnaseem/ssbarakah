# Icy Modal System & Delete Task — Design Spec

**Date:** 2026-06-06  
**Status:** Approved

---

## Overview

Two related changes:

1. **Icy modal base component** — a shared `IcyModal` wrapper that gives all modals a glossy, frosted-ice appearance with SVG icicles hanging from the top rim. All existing and future modals use this wrapper.
2. **Delete task feature** — a ✕ button on every `TaskRow` that opens a `DeleteConfirmModal`. For recurring tasks, the modal offers three choices: cancel, remove today only, or remove forever.

---

## 1 — IcyModal Base Component

### File
`src/components/IcyModal.tsx`

### Visual Design

**Backdrop:** `rgba(6,24,38,0.8)` + `backdrop-filter: blur(6px)`. Click calls `onClose`.

**Card:**
- Background: `linear-gradient(160deg, rgba(200,230,255,0.18) 0%, rgba(11,53,88,0.75) 100%)` — white-tinted at top, deep navy at bottom, like looking into ice
- Border: `1px solid rgba(200,235,255,0.35)` — bright ice-white edge
- Inner highlight: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.25)` — glossy top-face sheen
- Outer glow: `box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(157,216,247,0.08)`
- `backdrop-filter: blur(20px)` on the card itself
- `border-radius: 1.25rem` (rounded-2xl)

**Icicles:** SVG strip, `position: absolute`, anchored to the top-inside of the card, full width. Contains 8 icicles of varying heights (22–46px) and widths (10–18px), tapered to a point, filled `rgba(200,235,255,0.55)` with a `rgba(255,255,255,0.3)` highlight line down the left edge of each. The card has `padding-top` sized to clear the tallest icicle (~52px).

### Props

```ts
interface IcyModalProps {
  onClose: () => void          // called on backdrop click
  children: React.ReactNode
  accentColor?: string         // default: '#9DD8F7' (ice-blue). IcyErrorModal passes '#DC2626'
  maxWidth?: string            // default: 'max-w-sm'
}
```

`accentColor` is passed through to children via a CSS custom property or directly — components use it for their own accent elements (icon circle, button borders). The `IcyModal` itself always uses the ice-white/navy palette regardless of accent.

### Stop-propagation
The card div calls `e.stopPropagation()` on click so backdrop and card clicks don't conflict.

---

## 2 — Updated Modals

### IcyErrorModal (`src/components/IcyErrorModal.tsx`)
Replace the hand-rolled card with `<IcyModal onClose={onDismiss} accentColor="#DC2626">`. Keep the ❄️ icon circle, red-tinted message text, and Dismiss button — just remove the old background/border/shadow styles (now provided by IcyModal).

### LoginModal (`src/components/LoginModal.tsx`)
Replace the hand-rolled card with `<IcyModal onClose={onClose}>`. Keep the ship SVG, title, form inputs, Board button, and ✕ close button. Remove the old background/border/shadow styles.

---

## 3 — DeleteConfirmModal

### File
`src/components/DeleteConfirmModal.tsx`

### Variants

**Non-recurring task** — Two buttons:
- **Cancel** (secondary, closes modal)
- **Remove** (red accent, deletes task)

**Recurring task** — Three buttons:
- **Cancel** (secondary, closes modal)
- **Remove today only** (removes `daily_tasks` row; `recurring_tasks` row untouched — task seeds again tomorrow)
- **Remove forever** (removes `daily_tasks` row AND the matching `recurring_tasks` row — will never seed again)

### Recurring detection
The modal receives `isRecurring: boolean` as a prop. The parent computes this by checking whether `recurringTasks` (already in dashboard state) contains an entry with `preset_task_id === task.preset_task_id && teammate_id === task.teammate_id`.

### Props

```ts
interface DeleteConfirmModalProps {
  task: DailyTask
  isRecurring: boolean
  onCancel: () => void
  onDeleteToday: () => void           // always available
  onDeleteForever: () => void         // only called when isRecurring = true
}
```

### Content
- Task name displayed in quotes: `"${task.name}"`
- Warning line: `"Remove this repair from today's log?"`
- If recurring: additional line `"This task repeats daily. Remove just today, or stop it forever?"`

---

## 4 — TaskRow Changes

`TaskRow` in `src/app/teammate/[teammateId]/page.tsx` gains:
- `onDelete: (t: DailyTask) => void` prop
- A `✕` button (44px tap target) to the left of the complete button
- The button is always enabled regardless of completion state

---

## 5 — Dashboard Delete Handler

In the teammate dashboard page component:

```ts
async function deleteTask(task: DailyTask, scope: 'today' | 'forever') {
  // Optimistic: remove from local state immediately
  setTasks(prev => prev.filter(t => t.id !== task.id))

  // Delete task_completions first (FK constraint)
  await supabase.from('task_completions').delete().eq('daily_task_id', task.id)

  // Delete daily_tasks row
  const { error } = await supabase.from('daily_tasks').delete().eq('id', task.id)

  if (scope === 'forever' && task.preset_task_id) {
    await supabase
      .from('recurring_tasks')
      .delete()
      .eq('teammate_id', task.teammate_id)
      .eq('preset_task_id', task.preset_task_id)
  }

  if (error) {
    // Re-fetch on failure to restore correct state
    await loadTasks()
  }
}
```

`recurringTasks` is already fetched in dashboard state. Pass it (or the computed `isRecurring` boolean) down to trigger the correct modal variant.

---

## 6 — Docs Updates

After implementation, update:
- `docs/handoff.md` — add IcyModal to component descriptions; add DeleteConfirmModal; update IcyErrorModal and LoginModal entries to note they use IcyModal
- `docs/SS_Barakah_Requirements.md` — update any section describing modal appearance to reference the icy/glossy design with icicles; add delete task behaviour (any task, with recurring scope choice) to the teammate dashboard section
- `docs/todo.md` — mark the icy modal system and delete task work as a new completed task entry once done; also add a note to any future task that involves a modal reminding that IcyModal must be used

---

## Files Changed

| Action | File |
|---|---|
| NEW | `src/components/IcyModal.tsx` |
| NEW | `src/components/DeleteConfirmModal.tsx` |
| EDIT | `src/components/IcyErrorModal.tsx` |
| EDIT | `src/components/LoginModal.tsx` |
| EDIT | `src/app/teammate/[teammateId]/page.tsx` |
| EDIT | `docs/handoff.md` |
| EDIT | `docs/SS_Barakah_Requirements.md` |
| EDIT | `docs/todo.md` |

No new tests required — all new logic is UI-only (delete DB calls are too integration-heavy for unit tests; the pure calculations are unchanged).
