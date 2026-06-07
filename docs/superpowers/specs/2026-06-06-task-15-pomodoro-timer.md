# Task 15 — Pomodoro Timer

**Date:** 2026-06-06  
**Status:** Approved

---

## Goal

Add a Pomodoro focus timer to the teammate dashboard. Configurable focus/break durations, indefinite auto-cycle, with a full-screen breathing exercise overlay available during breaks.

---

## Placement

Between the Activity Heatmap card and the Required Repairs section in `src/app/teammate/[teammateId]/page.tsx`.

---

## Component

Single file: `src/components/pomodoro/PomodoroTimer.tsx` — self-contained client component, no props.

---

## Timer Behaviour

- **Default durations:** 25 min focus, 5 min break
- **Configurable:** Two number inputs ("Focus (min)" and "Rest (min)") shown only when the timer is stopped/reset. Hidden once the session starts.
- **Cycle:** focus → break → focus → … indefinitely until Reset
- **Reset:** stops timer, restores 25/5 defaults, returns to focus mode, shows duration inputs again
- **Background tab fix:** on start, store `endTime = Date.now() + secondsLeft * 1000` in a `useRef`. On `visibilitychange` (tab becomes visible), recalculate `secondsLeft = Math.max(0, Math.round((endTime.current - Date.now()) / 1000))` to correct drift.

---

## Timer Card UI

Arctic styling consistent with the dashboard — frosted card (`rgba(11,53,88,0.4)`, `1px solid rgba(157,216,247,0.1)`).

- Section label: `FOCUS TIMER`
- Large MM:SS display (~28px bold, `#F2FBFF`)
- Mode label below: `FOCUS` (ice-blue `#9DD8F7`) or `BREAK` (green `#22C55E`)
- Duration inputs (hidden when running): two small number fields inline, labelled "Focus (min)" and "Rest (min)"
- Buttons: `Start` / `Pause` (ice-blue filled) + `Reset` (ghost)
- During break only: `🫁 Breathing Exercise` button appears below the main buttons

---

## Breathing Exercise Overlay

Triggered by clicking "Breathing Exercise" during a break. Dismissed by:
- Break countdown reaching 0 (auto-close)
- User clicking "Stop exercise"

**Visual:**
- Full-screen overlay, `background: #020810` (same deep-abyss dark as the ship dashboard scroll section)
- Centre: one circle animating through a 4-phase box-breathing cycle (20s per loop, loops indefinitely):

| Phase | Duration | Circle | Text |
|---|---|---|---|
| Breathe in | 5s | Grows (scale up, CSS transition) | `Breathe in` |
| Hold | 5s | Stays large | `Hold` |
| Breathe out | 5s | Shrinks (scale down) | `Breathe out` |
| Hold | 5s | Stays small | `Hold` |

- The instruction text (`Breathe in`, `Hold`, `Breathe out`, `Hold`) lives **inside the circle** and uses the **same CSS transform** as the circle — it scales as one unit with it
- The break countdown timer is shown **inside the circle above the instruction text**, small fixed size, does not scale with the circle
- `Stop exercise` button is fixed at the bottom of the screen, outside the circle, does not scale
- Circle base color: semi-transparent ice-blue (`rgba(157,216,247,0.15)`) with a brighter border (`rgba(157,216,247,0.4)`)

---

## Future Enhancement (not in scope now)

Add eyeless sea creatures (fish, octopus, whale) drifting in the background of the breathing overlay, consistent with Islamic guidelines (no facial features). Log this for Task 16+ or a dedicated polish pass.

---

## Testing

No new tests — pure UI/animation component, no business logic functions to unit test.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/pomodoro/PomodoroTimer.tsx` | New file |
| `src/app/teammate/[teammateId]/page.tsx` | Add `<PomodoroTimer />` between heatmap and Required Repairs |
