# S.S. Barakah — UI Overhaul Design
**Date:** 2026-06-05
**Status:** Approved

---

## Overview

This spec covers four interconnected changes to the app:
1. Persistent auth via `localStorage`
2. Login page redesign (full-screen ship scene, crew panel at bottom)
3. Persistent nav bar with context-aware right side and login modal
4. Intro crash animation (daily) and end-of-day sinking animation

---

## 1. Auth & Persistence

### Problem
Sessions are stored in `sessionStorage`, which clears on tab close. Users have to log in every time they open the app.

### Change
- Switch teammate session storage from `sessionStorage` to `localStorage` in `src/lib/auth.ts`
- The stored key (`ss_barakah_teammate`) and shape (full `Teammate` row as JSON) remain unchanged
- `logoutTeammate()` clears `localStorage` instead of `sessionStorage`
- `getCurrentTeammate()` reads from `localStorage`

### Admin session
Admin session stays in `sessionStorage` — intentionally short-lived. Admin access requires re-entry per browser tab.

### Admin code
The admin code is hardcoded in `src/lib/auth.ts` as `"8608 guzw"` (replaces `"Dawoud Sink"`). Supabase-backed validation can be added later.

---

## 2. Login Page Redesign

### Layout (Option C — approved)
- Full-screen Arctic scene filling the entire viewport
- **Top:** `S.S. Barakah` title + tagline (`"Complete your tasks. Save the ship. Earn the barakah."`)
- **Center:** Large ship SVG, slightly tilted (~5°), with a massive threatening iceberg close on its right side and a smaller iceberg on the left. Stars scattered in the upper portion.
- **Bottom ~25%:** Animated wave layer
- **Docked to bottom:** Full-width frosted "Crew Access" panel containing:
  - Left label: `"Crew Access"` + `"Board the ship to begin"` subtext
  - Right: Name input · Password input · `Board →` button — all in one horizontal row
  - On mobile: inputs stack vertically within the panel

### Error handling
- Failed login triggers an **icy modal** overlay (frosted glass, red-tinted border, `#DC2626` accent) with the error message
- Modal dismisses on button click or outside tap
- No inline error below the inputs

### Post-login
- On success: store teammate in `localStorage`, redirect to `/teammate/[id]`
- The `/login` route remains as a fallback destination for auth guards

---

## 3. Nav Bar

### Placement
- Fixed top bar on every page **except** `/login`
- Implemented as a client component (`src/components/NavBar.tsx`) included in `src/app/layout.tsx` via a `ConditionalNav` wrapper that hides it on `/login` using `usePathname()`

### Desktop layout
```
[ ⚓ S.S. Barakah ]   [ Ship · History · Admin ]   [ Board Ship → ] or [ D Dawoud ▾ ]
```
- Logo links to `/`
- Active page link is underlined
- Right side is **context-aware**:
  - **Logged out:** `Board Ship →` button — clicking opens the login modal
  - **Logged in:** Teammate's initial in a circle + name + `▾` chevron — clicking opens a dropdown with `My Dashboard` and `Log Out`

### Mobile layout
- Logo on left, right-side button/avatar always visible
- Center links collapse into a `☰` hamburger button
- Hamburger opens a frosted dark drawer sliding down from the top containing: Ship · History · Admin (stacked)

### Login Modal
- Triggered by clicking `Board Ship →` in the nav
- Overlays the current page (no navigation)
- Contains: ship silhouette, `S.S. Barakah` title, name input, password input, `Board →` button
- On failed login: icy modal with error message (same as login page)
- On success: stores teammate in `localStorage`, closes modal, updates nav right side to show teammate name, redirects to `/teammate/[id]`

---

## 4. Animations

### 4a. Daily Intro Crash Animation

**Trigger:** First app load of the day. Checked via `localStorage` key `ss_barakah_last_intro` — stores the last date it played. If stored date ≠ today, animation plays.

**Skip:** A `Skip ›` button is fixed at bottom-right throughout the entire animation. Clicking it immediately fades out and loads the dashboard.

**Sequence:**
1. Black/dark fade-in → ocean + stars + large ship sailing smoothly from left to right
2. Ship is zoomed in (large, takes ~75% of screen width), ocean visible below, stars above
3. Dialog bubble appears near Araf's position on deck:
   > **Araf:** *"Yo, word on the street is there's an iceberg in front of us."*
4. Short pause (~1s), then Dawoud's bubble:
   > **Dawoud:** *"Wdym bro?"*
5. ~1s pause, then a group bubble from the crew:
   > **Everyone:** *"AHHHHHHHHHHH"*
6. Large iceberg slides in fast from the right edge of the screen
7. Red flashing alarm overlay (full screen, pulsing red tint) — alarm sound plays (short MP3/OGG clip, triggered by the user interaction that opened the app, respecting browser autoplay policy)
8. Impact: screen shake (CSS `translate` keyframe), crack SVG path animates onto hull
9. Alarm fades, ship settles tilted with crack visible
10. Crossfade → main dashboard (`/`)

**Sound:** A short alarm sound clip. Loaded as an HTML `<audio>` element, played programmatically on the impact frame. If browser autoplay is blocked (no prior user interaction), animation plays silently — no error shown.

**Character positions:** Dialog bubbles are positioned relative to the ship SVG container, not the viewport, so they scale correctly on mobile.

**Storage:** On animation complete or skip, write `ss_barakah_last_intro = todayString()` to `localStorage`.

### 4b. End-of-Day Failure (Sinking)

**Trigger:** `finalizeDay()` returns outcome `"sunk"` — day ended with missed required tasks.

**Sequence:**
1. Ship tilts further (beyond current progress tilt) — CSS `rotate` increases smoothly
2. Ship translates downward into the ocean — CSS `translateY` moves it below the wave layer
3. Workers speed up their panic animation then fade out one by one
4. Ocean closes over the ship
5. Failure overlay fades in:
   - *"The ship has sunk."*
   - List of teammates who missed one or more required tasks, with missed task count
   - Chud badge callout: *"💀 Chud of the Day: [name] — [X] tasks missed, [Y] points"*
   - Only shown if Chud is assigned (someone missed tasks — always true on a sunk day)

**No crash:** The ship does not hit the iceberg. It sinks in place. The iceberg remains as a static threat in the background.

---

## Files Affected

| File | Change |
|------|--------|
| `src/lib/auth.ts` | `sessionStorage` → `localStorage` for teammate; update admin code |
| `src/app/login/page.tsx` | Full redesign — Option C layout, icy error modal |
| `src/app/layout.tsx` | Add `<ConditionalNav />` |
| `src/components/NavBar.tsx` | New — nav bar + login modal + hamburger |
| `src/components/ConditionalNav.tsx` | New — hides NavBar on `/login` via `usePathname` |
| `src/components/IntroAnimation.tsx` | New — daily crash intro sequence |
| `src/app/page.tsx` | Add IntroAnimation check; remove redirect-to-login (show dashboard) |
| `src/app/teammate/[teammateId]/page.tsx` | Remove bottom nav buttons (now in NavBar) |
| `docs/todo.md` | Update Task 3 notes; add new tasks for nav bar, intro animation |

---

## Out of Scope

- Better ship/iceberg SVG artwork (noted for a future visual polish pass)
- Admin code moved to Supabase (noted for post-MVP)
- Alarm sound asset — a royalty-free clip needs to be sourced and added to `public/sounds/`
