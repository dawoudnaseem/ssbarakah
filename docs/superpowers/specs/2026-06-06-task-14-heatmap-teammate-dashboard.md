# Task 14 — Heatmap on Teammate Dashboard

**Date:** 2026-06-06  
**Status:** Approved

---

## Goal

Add a personal 20×3 activity heatmap (last 60 days) to the teammate dashboard at `/teammate/[teammateId]`. Same design as the heatmap on the History page.

---

## Design

**Option A — heatmap grid + legend only.** No extra stats alongside the grid. The "Streak" stat card already above the heatmap provides the at-a-glance streak context; a "Total Points" stat would be confusing because it would only cover the 60-day window, not all-time.

---

## Architecture

### New file: `src/lib/heatmap.ts`

Extract three pure helper functions from `src/app/history/page.tsx` into this shared lib file:

- `localDateStr(d: Date): string` — builds `YYYY-MM-DD` from local time (not UTC)
- `heatmapColor(points: number, missedRequired: number): string` — returns CSS color; red override if `missedRequired > 0`; warm scale: 0pts ghost → `#7C3200` → `#B84A00` → `#F97316` → `#FBBF24`
- `buildHeatmapCells(teammateId: string, stats: TeammateDailyStat[]): { color: string; date: string }[]` — builds exactly 60 cells, oldest→newest (i=59 down to 0)

### Modified: `src/app/history/page.tsx`

Remove the three inline function definitions; import them from `@/lib/heatmap`.

### Modified: `src/app/teammate/[teammateId]/page.tsx`

- The existing fetch already queries `teammate_daily_stats` (used for streak) — reuse that data, no new Supabase call.
- Replace the placeholder `<div>` (the "Heatmap coming in Task 14" block) with the real heatmap:
  - `20×3` CSS grid, `14×14px` cells, `3px` gap, `3px` border-radius
  - Call `buildHeatmapCells(teammate.id, stats)` where `stats` is the already-fetched stat data
  - Legend line below: `darker = low pts · gold = high pts · red = missed required`
- Import `buildHeatmapCells` from `@/lib/heatmap`

---

## Data Flow

```
teammate_daily_stats (already fetched for streak)
  → buildHeatmapCells(teammate.id, stats)
  → 60 { color, date } cells
  → CSS grid render
```

No new Supabase queries. No new state.

---

## Testing

No new tests needed — no new logic. `buildHeatmapCells` and `heatmapColor` are pure functions already exercised implicitly through the history page. The extraction to `heatmap.ts` does not change their behaviour.

---

## Out of Scope

- Tooltip on hover (not requested)
- Changing the colour scale
- Any new stats alongside the heatmap
