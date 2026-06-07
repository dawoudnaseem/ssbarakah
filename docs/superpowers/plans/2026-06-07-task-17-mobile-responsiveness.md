# Task 17 — Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page of S.S. Barakah fully usable on mobile phones with no horizontal scroll, no broken layouts, and all touch targets ≥ 44px at 320px / 375px / 390px / 768px viewport widths.

**Architecture:** Three confirmed critical overflows (admin sidebar, login ship SVG, history heatmap) are fixed with targeted edits. Touch-target gaps patched in-place. No new components — edits only.

**Tech Stack:** Next.js 16.2.7 · React · TypeScript · Tailwind CSS

---

## Pre-flight: confirmed bugs & confirmed OK

### Confirmed broken at 320px (fix required):
| Issue | File | Root cause |
|---|---|---|
| Admin sidebar takes 60% of viewport; main content has hardcoded `marginLeft: 192px` | `admin/page.tsx`, `AdminSidebar.tsx` | Fixed `w-48` sidebar, no mobile variant |
| Login ship SVG fixed at 340px — overflows 288px available | `login/page.tsx` | `width="340" height="170"` on `<svg>` |
| History heatmap fixed 14×14px cells = 337px grid — overflows | `history/page.tsx` | `gridTemplateColumns: 'repeat(20, 14px)'`, `width: 'fit-content'` |

### Confirmed OK (no changes needed):
- TaskRow delete/complete buttons: `minHeight: 44px, minWidth: 44px` ✓
- NavBar hamburger: already works on mobile ✓
- Pomodoro `visibilitychange` fix: implemented in Task 15 ✓
- Ship dashboard ship: `min(520px, 92vw)` responsive ✓
- Intro animation: `overflow: hidden` on fixed container — no scroll bleed ✓
- Teammate dashboard heatmap: `grid-template-columns: repeat(20, 1fr)` already responsive ✓

### Touch target gaps (fix required):
| Button | Current height | File |
|---|---|---|
| "Log out" on teammate dashboard | `py-2` ≈ 32px | `teammate/[teammateId]/page.tsx` |
| Admin sidebar nav buttons | `py-2` ≈ 32px | `AdminSidebar.tsx` |

---

## File Map

| File | Change type |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | Modify — add mobile horizontal tab strip, keep desktop sidebar |
| `src/app/admin/page.tsx` | Modify — replace hardcoded `marginLeft: '192px'` with responsive class |
| `src/app/login/page.tsx` | Modify — wrap ship SVG in responsive container |
| `src/app/history/page.tsx` | Modify — switch heatmap to responsive `1fr` grid + overflow wrapper |
| `src/app/teammate/[teammateId]/page.tsx` | Modify — add `min-h-[44px]` to Log out button |

---

## Task A — Admin Dashboard Mobile Layout

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/app/admin/page.tsx`

The fixed `w-48` sidebar is invisible on mobile (behind content). `admin/page.tsx` hardcodes `marginLeft: '192px'` which squeezes everything to 128px on a 320px screen. Fix: on mobile show a horizontal scroll tab strip; on `sm:` (640px+) show the fixed vertical sidebar.

- [ ] **Step 1: Rewrite `AdminSidebar.tsx` with mobile horizontal tabs**

Replace the entire file content with:

```tsx
'use client'

type AdminSection = 'status' | 'crew' | 'missions' | 'logs' | 'tasks' | 'finalize'

const NAV_ITEMS: { id: AdminSection; label: string; emoji: string }[] = [
  { id: 'status',   label: 'Status',      emoji: '📊' },
  { id: 'crew',     label: 'Crew',        emoji: '👥' },
  { id: 'missions', label: 'Missions',    emoji: '📋' },
  { id: 'logs',     label: 'Ship Logs',   emoji: '📜' },
  { id: 'tasks',    label: 'Daily Tasks', emoji: '📝' },
  { id: 'finalize', label: 'Finalize',    emoji: '⚡' },
]

export type { AdminSection }

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
    <>
      {/* ── Mobile: horizontal scroll tab strip ── */}
      <div
        className="sm:hidden sticky top-14 z-30 flex items-center gap-1 px-2 py-2 overflow-x-auto"
        style={{ background: '#0a1e2e', borderBottom: '1px solid rgba(157,216,247,0.1)' }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          const isFinalize = item.id === 'finalize'
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap"
              style={{
                minHeight: '44px',
                background: isActive ? 'rgba(157,216,247,0.12)' : 'transparent',
                color: isFinalize && !isActive
                  ? 'rgba(220,38,38,0.7)'
                  : isActive
                  ? '#9DD8F7'
                  : 'rgba(157,216,247,0.55)',
                borderBottom: isActive ? '2px solid #9DD8F7' : '2px solid transparent',
              }}
            >
              {item.emoji} {item.label}
            </button>
          )
        })}
        <button
          onClick={onLogout}
          className="flex-shrink-0 px-3 rounded-lg text-xs"
          style={{ minHeight: '44px', color: 'rgba(157,216,247,0.35)' }}
        >
          ← Out
        </button>
      </div>

      {/* ── Desktop: fixed vertical sidebar ── */}
      <aside
        className="hidden sm:flex fixed top-14 left-0 bottom-0 w-48 flex-col py-4 px-3 gap-1"
        style={{ background: '#0a1e2e', borderRight: '1px solid rgba(157,216,247,0.1)' }}
      >
        <p className="text-xs font-bold tracking-widest uppercase px-2 mb-3"
          style={{ color: 'rgba(157,216,247,0.4)' }}>
          ⚓ Admin
        </p>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          const isFinalize = item.id === 'finalize'
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
              style={{
                minHeight: '44px',
                background: isActive ? 'rgba(157,216,247,0.08)' : 'transparent',
                color: isFinalize && !isActive
                  ? 'rgba(220,38,38,0.6)'
                  : isActive
                  ? '#9DD8F7'
                  : 'rgba(157,216,247,0.5)',
                borderLeft: isActive ? '2px solid #9DD8F7' : '2px solid transparent',
              }}
            >
              {item.emoji} {item.label}
            </button>
          )
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-lg text-xs text-left"
          style={{ minHeight: '44px', color: 'rgba(157,216,247,0.35)' }}
        >
          ← Log Out
        </button>
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Fix `admin/page.tsx` — responsive main content margin**

Find the authenticated dashboard return in `src/app/admin/page.tsx` (line ~147):

```tsx
  return (
    <div className="min-h-screen flex" style={{ background: '#061826', paddingTop: '56px' }}>
      <AdminSidebar active={section} onSelect={setSection} onLogout={handleLogout} />
      <main className="flex-1 p-6 overflow-y-auto" style={{ marginLeft: '192px' }}>
```

Replace with (remove the hardcoded `marginLeft`, add responsive Tailwind class):

```tsx
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#061826', paddingTop: '56px' }}>
      <AdminSidebar active={section} onSelect={setSection} onLogout={handleLogout} />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto sm:ml-48">
```

- [ ] **Step 3: Verify admin layout at 320px**

Run `npm run dev`, open http://localhost:3000/admin, enter admin code, resize to 320px. Confirm:
- Horizontal tab strip visible and scrollable
- Main content takes full width on mobile
- No sidebar visible on mobile

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/app/admin/page.tsx
git commit -m "fix: admin dashboard mobile layout — horizontal tab strip replaces fixed sidebar"
```

---

## Task B — Login Page Ship SVG Responsive Sizing

**Files:**
- Modify: `src/app/login/page.tsx`

The ship SVG uses fixed `width="340" height="170"` attributes. At 320px viewport with `px-4` (16px each side), only 288px is available — the 340px SVG causes 52px of horizontal overflow.

- [ ] **Step 1: Make ship SVG responsive in `login/page.tsx`**

Find the ship SVG block (around line 72–112):

```tsx
        {/* Large ship — center, tilted 5° */}
        <div
          className="animate-bob pointer-events-none"
          style={{ transform: 'rotate(5deg)', transformOrigin: 'center bottom' }}
          aria-hidden
        >
          <svg width="340" height="170" viewBox="0 0 340 170" fill="none">
```

Replace with (add a responsive container wrapper, make SVG fill it):

```tsx
        {/* Large ship — center, tilted 5° */}
        <div
          className="animate-bob pointer-events-none"
          style={{ transform: 'rotate(5deg)', transformOrigin: 'center bottom', width: 'min(340px, 85vw)' }}
          aria-hidden
        >
          <svg viewBox="0 0 340 170" style={{ width: '100%', height: 'auto', display: 'block' }} fill="none">
```

- [ ] **Step 2: Verify login page at 320px**

Open http://localhost:3000/login, resize to 320px. Confirm:
- Ship SVG fits within viewport with no horizontal scroll
- Ship still appears centered and proportional

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "fix: make login ship SVG responsive — scales down on narrow screens"
```

---

## Task C — History Page Heatmap Overflow Fix

**Files:**
- Modify: `src/app/history/page.tsx`

The history page heatmap uses `gridTemplateColumns: 'repeat(20, 14px)'` with fixed `width: '14px', height: '14px'` on each cell and `width: 'fit-content'` on the grid. Total grid width = 20×14px + 19×3px = 337px. At 320px viewport with card padding, this overflows by ~70px+.

The teammate dashboard heatmap already uses `repeat(20, 1fr)` + `aspectRatio: 1` (responsive, fills container). Match this behaviour.

- [ ] **Step 1: Find the heatmap grid block in `history/page.tsx`**

Look for this block (around line 220–226):

```tsx
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 14px)', gridTemplateRows: 'repeat(3, 14px)', gap: '3px', width: 'fit-content' }}>
                    {buildHeatmapCells(cr.teammate.id, stats).map(cell => (
                      <div key={cell.date} style={{ width: '14px', height: '14px', borderRadius: '3px', background: cell.color }} />
                    ))}
                  </div>
```

Replace with (responsive `1fr` columns, `aspectRatio: 1` cells, no fixed widths):

```tsx
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: '3px', width: '100%' }}>
                    {buildHeatmapCells(cr.teammate.id, stats).map(cell => (
                      <div key={cell.date} style={{ aspectRatio: '1', borderRadius: '3px', background: cell.color }} />
                    ))}
                  </div>
```

- [ ] **Step 2: Verify history page heatmap at 320px**

Open http://localhost:3000/history, resize to 320px. Confirm:
- Heatmap fits within the crew card — no horizontal overflow
- Heatmap cells still visible (they'll be smaller — ~13px each at 320px screen)
- No horizontal scroll on the page

- [ ] **Step 3: Commit**

```bash
git add src/app/history/page.tsx
git commit -m "fix: history heatmap responsive — switch from fixed 14px cells to 1fr grid"
```

---

## Task D — Touch Target Fixes

**Files:**
- Modify: `src/app/teammate/[teammateId]/page.tsx` (Log out button)
- Modify: `src/components/admin/AdminSidebar.tsx` (already fixed in Task A)

The "Log out" button on the teammate dashboard uses `px-3 py-2` which gives approximately 32px height — below the 44px minimum for touch targets.

- [ ] **Step 1: Fix Log out button height in `teammate/[teammateId]/page.tsx`**

Find the logout button (around line 405–410):

```tsx
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
              style={{ background: 'rgba(157,216,247,0.1)', border: '1px solid rgba(157,216,247,0.2)', color: '#9DD8F7' }}
            >
              Log out
            </button>
```

Replace `py-2` with `py-3` and add explicit `minHeight`:

```tsx
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-3 rounded-lg transition-opacity hover:opacity-70"
              style={{ background: 'rgba(157,216,247,0.1)', border: '1px solid rgba(157,216,247,0.2)', color: '#9DD8F7', minHeight: '44px' }}
            >
              Log out
            </button>
```

- [ ] **Step 2: Verify touch target**

At 320px, the logout button should be at least 44px tall. Inspect element in browser DevTools to confirm computed height.

- [ ] **Step 3: Commit**

```bash
git add src/app/teammate/[teammateId]/page.tsx
git commit -m "fix: log out button touch target to 44px minimum"
```

---

## Task E — No Horizontal Scroll Verification

**Files:** None (verification only — code changes only if new issues are found)

Systematically test all pages at 320px, 375px, 390px, 768px. Check for `overflow-x` issues using browser DevTools.

- [ ] **Step 1: Test login page (`/login`) at 320px / 375px / 390px / 768px**

Open DevTools → Device toolbar. Test at each width. Expected:
- Ship, icebergs, Crew Access panel all visible within viewport
- No horizontal scroll bar
- "Crew Access" panel inputs stack vertically on mobile (already uses `flex-col sm:flex-row`)

- [ ] **Step 2: Test ship dashboard (`/`) at 320px / 375px / 390px / 768px**

Expected:
- Ship scene fills viewport height with no horizontal overflow
- Mission status chip and countdown chip don't overlap (they have ~26px gap at 320px)
- Progress bar at bottom fits within viewport
- Deep waters section (leaderboard, badges, recent feed) stacks properly

If mission status and countdown chips overlap at 320px, add `style={{ maxWidth: '44vw', overflow: 'hidden' }}` to each chip's wrapper div in `src/app/page.tsx`.

- [ ] **Step 3: Test teammate dashboard (`/teammate/[id]`) at 320px / 375px / 390px / 768px**

Expected:
- Stats grid (3 cols) fits at 320px (each col ≈ 90px — acceptable)
- Heatmap fills card width
- Task rows: name truncates, delete/complete buttons stay on same row
- Action buttons ("+ Custom Task", "From Presets") side by side — both `flex-1` so they share width
- Add custom task form: `grid-cols-2` inside form — each col ≈ 130px at 320px (fine)
- Pomodoro timer (220px SVG): fits within 288px available ✓

- [ ] **Step 4: Test history page (`/history`) at 320px / 375px / 390px / 768px**

Expected (after Task C fix):
- Fleet summary chips (4-col grid) — each chip ≈ 72px wide — fits at 320px
- Crew cards: heatmap now responsive (no overflow)
- Daily log cards: outcome icon, date, chips all visible

- [ ] **Step 5: Test admin dashboard (`/admin`) at 320px / 375px / 390px / 768px**

Expected (after Task A fix):
- Code gate card: `max-w-sm mx-4` — fits within 320px
- Authenticated: horizontal tab strip visible, content area full width
- Each section (Status, Crew, Missions, etc.) stacks forms vertically

- [ ] **Step 6: Fix any new overflow issues found in testing**

If any page still has horizontal scroll, apply targeted fixes (add `overflow-x: hidden` to page root, or `min-w-0` to flex children, or responsive width fixes). Document each fix before committing.

- [ ] **Step 7: Run tests to confirm no regressions**

```bash
npm test
```

Expected: 60 tests passing, 0 failures.

- [ ] **Step 8: Commit verification results**

```bash
git commit -m "fix: resolve any remaining horizontal scroll issues found in mobile verification"
```

(Only if there were fixes — skip if Step 6 found nothing.)

---

## Task F — Update handoff.md

**Files:**
- Modify: `docs/handoff.md`
- Modify: `docs/todo.md`

- [ ] **Step 1: Mark Task 17 complete in `docs/todo.md`**

Change all checkboxes in Task 17 from `- [ ]` to `- [x]`.

Update the `## ⏭️ Next Task` header in `docs/handoff.md` to point to Task 18.

- [ ] **Step 2: Append Task 17 summary to `docs/handoff.md`**

Add a new section `## ✅ Task 17 — Mobile Responsiveness` with:
- List of the three critical fixes (admin sidebar, login SVG, history heatmap)
- Touch target fix
- Verification results (which pages pass at which widths)
- Test count (should still be 60)

- [ ] **Step 3: Push to GitHub**

```bash
git push
```

---

## Self-Review

**Spec coverage check:**

| §25 Requirement | Covered by |
|---|---|
| §25.1 Mobile-first breakpoints (320px–639px, 640px–1023px, 1024px+) | Task E verification |
| §25.2 Login page inputs stack vertically on mobile | Already implemented (flex-col sm:flex-row) ✓ |
| §25.3 Ship scene no overflow on mobile | Already works (92vw container) ✓ |
| §25.4 Teammate dashboard stacks vertically | Already implemented ✓ |
| §25.5 Admin dashboard stacks vertically | Task A |
| §25.6 History heatmaps scroll or fit | Task C |
| §25.7 Workers % positions (not viewport px) | Already implemented ✓ |
| §25.8 Pomodoro visibilitychange fix | Already done in Task 15 ✓ |
| §25.9 Touch targets 44px | Task D + Task A (sidebar buttons) |
| §25.10 No horizontal scroll at 320px | Task B + Task C + Task E |
| §25.11 Mobile DoD (320px/375px/390px/768px) | Task E |

**Placeholder scan:** No TBDs or "implement later" phrases.

**Type consistency:** No new types introduced — edits only.
