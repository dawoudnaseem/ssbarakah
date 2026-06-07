# Task 13 — History & Stats Page

**Date:** 2026-06-06
**Route:** `/history` (already linked in NavBar)

---

## Layout Overview

Three sections, top to bottom, on a single scrollable page. No tabs, no routing. Same Arctic dark theme as the rest of the app.

```
┌──────────────────────────────────────┐
│  📜 Voyage History                   │
│  All-time records for S.S. Barakah   │
├──────────────────────────────────────┤
│  FLEET SUMMARY                       │
│  [Survived] [Streak 🔥] [Sunk] [Win%]│
├──────────────────────────────────────┤
│  CREW ALL-TIME RECORDS               │
│  ┌────────────────────────────────┐  │
│  │ [D] Dawoud  ⚓×7  💀×1         │  │
│  │                    420 pts 58✓ │  │
│  │ ▓▓▓░▓▓▓░▓▓ (heatmap 20×3)     │  │
│  └────────────────────────────────┘  │
│  (one card per active teammate)      │
├──────────────────────────────────────┤
│  DAILY LOG                           │
│  ⛵ Jun 5 — Survived  ⚓ Dawoud  100%│
│  🌊 Jun 4 — Sank      💀 Sufiyan 74% │
│  ...                                 │
└──────────────────────────────────────┘
```

---

## Section 1: Fleet Summary

Four stat chips in a 4-column grid:

| Label | Value | Colour |
|---|---|---|
| Days Survived | count of `daily_results` where `outcome = 'survived'` | ice-blue |
| Current Streak | consecutive survived days ending today (or last finalized day) | amber |
| Days Sunk | count of `daily_results` where `outcome = 'sunk'` | danger red |
| Survival Rate | `survived / (survived + sunk) * 100`, rounded to nearest integer, shown as `N%` | success green |

If no `daily_results` rows exist yet, all four show `—`.

---

## Section 2: Crew All-Time Records

One card per **active** teammate (`is_active = true`), sorted by total all-time points descending.

### Card contents

**Header row (large):**
- Avatar circle: 56px, shows first letter of name. Top scorer gets amber colour (`rgba(245,158,11,0.2)` bg, amber border + text); all others use ice-blue style.
- Name: 22px bold, `#F2FBFF`
- Badge pills below name (13px, more padding):
  - `⚓ Chad ×N` amber pill — count of `teammate_daily_stats` rows where `is_chad = true` for this teammate
  - `💀 Chud ×N` red pill — count of rows where `is_chud = true`
  - Pills only shown if count > 0
- Right side (36px bold):
  - Total points: sum of `points_earned` across all `teammate_daily_stats` rows. Amber for top scorer, ice-blue for others.
  - Tasks done: sum of `completed_required_tasks` + non-required completions (i.e. sum of task completions count). Ice-blue.

**Heatmap (below header):**
- 20 columns × 3 rows = 60 cells, each 14×14px with 3px gap
- Each cell = one day. Left-to-right, top-to-bottom = oldest to most recent (last 60 days)
- Cell colour based on `points_earned` from `teammate_daily_stats` for that date:
  - No data / 0 pts: `rgba(255,255,255,0.05)` (near-invisible)
  - 1–9 pts: `#7C3200` (dark burnt orange)
  - 10–19 pts: `#B84A00` (dark orange)
  - 20–34 pts: `#F97316` (vivid orange)
  - 35+ pts: `#FBBF24` (bright amber/gold)
  - `missed_required_tasks > 0` overrides colour to `rgba(220,38,38,0.5)` (red) regardless of points
- Label above heatmap: `"Last 60 days — darker = low pts · gold = high pts · red = missed required"`

### "Tasks Done" calculation

Sum of all `task_completions` rows for this teammate (join through `daily_tasks`). This counts every individual completion across all time, not just required ones.

---

## Section 3: Daily Log

One card per row in `daily_results`, ordered by `result_date` descending (newest first).

**Card layout:**
- Left: outcome icon — `⛵` for survived, `🌊` for sunk
- Centre:
  - Date: formatted as `"Wednesday, Jun 4 2026"` (full weekday + month + day + year)
  - Title: `"Ship Survived"` or `"Ship Sank"` (bold, `#F2FBFF`)
  - Chips row:
    - `⚓ Chad: [name]` amber chip — look up `chad_teammate_id` → teammate name; if null, omit chip
    - `💀 Chud: [name]` red chip — look up `chud_teammate_id` → teammate name; if null, show `💀 Chud: None`
    - `N/N crew complete` blue chip — derived from `completed_required_tasks / total_required_tasks` on the `daily_results` row; if `total_required_tasks = 0`, omit chip
- Right: completion percentage (`completion_percentage` field), shown as `"N%"` in large faded text

If no `daily_results` rows exist: show "No voyages recorded yet." empty state.

---

## Data Fetching

All data fetched on mount in a single `fetchHistory()` function. No polling (history doesn't change in real time).

Queries:
1. `daily_results` — all rows, order by `result_date` desc
2. `teammate_daily_stats` — all rows (for heatmap + badge counts + points totals)
3. `teammates` — all active teammates (`is_active = true`), order by name
4. `task_completions` — count per `teammate_id` (for "tasks done" total)

Resolve `chad_teammate_id` / `chud_teammate_id` to names by joining against the teammates list in memory (no extra query).

---

## Files

**Create:**
- `src/app/history/page.tsx` — `'use client'`, fetches all data, computes derived values, renders all three sections

**No new components needed** — this page is self-contained. If it grows past ~200 lines it can be split later, but for now one file is appropriate.

**No new tests needed** — no new logic functions; all computation is inline derivation from fetched data (sums, counts, lookups).

---

## Key Constraints

- No `Math.random()` — no random values needed on this page
- `'use client'` required (uses `useState`, `useEffect`)
- Loading state: show "Loading voyage records…" in ice-blue while fetching
- Empty state per section if no data exists
- All dates formatted client-side using `new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })`
- Streak calculation: count consecutive `survived` days going backwards from the most recent finalized day. Stop at first `sunk` day or gap.
