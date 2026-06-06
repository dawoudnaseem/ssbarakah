# Leaderboard Design — S.S. Barakah

**Date:** 2026-06-06
**Status:** Approved

---

## Overview

Extract the inline leaderboard and recent repairs feed from `src/app/page.tsx` into two standalone components. Upgrade the leaderboard row design to the approved visual. No data-fetching changes — `page.tsx` already polls the correct data every 15 seconds and passes it down as props.

---

## Components

### `src/components/leaderboard/Leaderboard.tsx`

Receives a `LeaderboardEntry[]` prop (same type already defined in `page.tsx`). Renders the crew leaderboard section.

**Row anatomy (per entry):**

```
[ rank ] [ avatar circle ] [ name  ⚓ CHAD or 💀 CHUD badge ] [ pts / status ]
```

- **Rank** — number, left-aligned. #1 is amber (`#F59E0B`), all others `rgba(242,251,255,0.3)`.
- **Avatar circle** — 34×34px circle with teammate's first initial. #1 = solid amber background + `#061826` text. Others = `#0B3558` background + `#9DD8F7` text + subtle border.
- **Name + badge** — name in `#F2FBFF`. If `current_chad = true`, show `⚓ CHAD` pill (amber background, dark text). If `current_chud = true`, show `💀 CHUD` pill (dark red border, red text). Never both.
- **Points (top-right)** — `entry.points pts`. #1 in amber, others in `#9DD8F7`.
- **Status (bottom-right, below points):**
  - All required done → `✓ all X/X tasks done` in `rgba(34,197,94,0.85)` where X = `completedRequired` / `totalRequired`
  - Any missed → `N missed` in `rgba(220,38,38,0.8)` where N = `missedRequired`
- **Row background:** #1 row = `rgba(245,158,11,0.08)` with amber border. Others = `rgba(9,26,44,0.8)` with faint ice border.
- **Empty state:** single line `"No crew data yet."` in muted text.

**Props:**
```ts
interface LeaderboardProps {
  entries: LeaderboardEntry[]
}
```

`LeaderboardEntry` is moved out of `page.tsx` and into `src/types/database.ts` (or a new `src/types/leaderboard.ts`) so both files can import it.

---

### `src/components/leaderboard/RecentRepairsFeed.tsx`

Receives a `RecentFeedItem[]` prop. Renders the "Recent Repairs" section. This is a pure extraction of the existing feed markup — no visual changes.

**Props:**
```ts
interface RecentRepairsFeedProps {
  items: RecentFeedItem[]
}
```

`RecentFeedItem` is similarly moved to the shared types file.

---

## Data Flow

`page.tsx` owns all data fetching (unchanged). It passes `leaderboard` and `recentFeed` down to the two components as props. No internal fetching inside the components.

```
page.tsx (polls every 15s)
  ├── <Leaderboard entries={leaderboard} />
  └── <RecentRepairsFeed items={recentFeed} />
```

---

## Type Relocation

Move `LeaderboardEntry` and `RecentFeedItem` (the inline interface at the top of `page.tsx`) to `src/types/leaderboard.ts`. Import in both `page.tsx` and the new components.

---

## Files Changed

| File | Change |
|---|---|
| `src/types/leaderboard.ts` | New — `LeaderboardEntry` and `RecentFeedItem` interfaces |
| `src/components/leaderboard/Leaderboard.tsx` | New — leaderboard component |
| `src/components/leaderboard/RecentRepairsFeed.tsx` | New — feed component |
| `src/app/page.tsx` | Remove inline markup + interfaces; import and use new components |

---

## What Does Not Change

- Data fetching logic in `page.tsx` — untouched
- `LeaderboardEntry` shape — same fields, just moved to a shared file
- `RecentFeedItem` shape — same, just moved
- 15-second polling — untouched
- Chad/Chud badge cards (the `BadgeCard` components above the leaderboard) — untouched

---

## No New Tests Needed

Both components are pure presentational — they receive data as props and render it. No logic beyond what's already tested in `calculations.ts`. The 47 existing tests continue to cover all business logic.
