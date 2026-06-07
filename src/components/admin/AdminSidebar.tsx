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
