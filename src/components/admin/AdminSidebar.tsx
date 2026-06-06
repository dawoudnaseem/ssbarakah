'use client'

type AdminSection = 'status' | 'crew' | 'missions' | 'finalize'

const NAV_ITEMS: { id: AdminSection; label: string; emoji: string }[] = [
  { id: 'status',   label: 'Status',   emoji: '📊' },
  { id: 'crew',     label: 'Crew',     emoji: '👥' },
  { id: 'missions', label: 'Missions', emoji: '📋' },
  { id: 'finalize', label: 'Finalize', emoji: '⚡' },
]

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
    <aside className="fixed top-14 left-0 bottom-0 w-48 flex flex-col py-4 px-3 gap-1"
      style={{ background: '#0a1e2e', borderRight: '1px solid rgba(157,216,247,0.1)' }}>
      <p className="text-xs font-bold tracking-widest uppercase px-2 mb-3"
        style={{ color: 'rgba(157,216,247,0.4)' }}>
        ⚓ Admin
      </p>
      {NAV_ITEMS.map(item => {
        const color = item.id === 'finalize' && active !== 'finalize'
          ? 'rgba(220,38,38,0.6)'
          : active === item.id
          ? '#9DD8F7'
          : 'rgba(157,216,247,0.5)'
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
            style={{
              background:  active === item.id ? 'rgba(157,216,247,0.08)' : 'transparent',
              color,
              borderLeft:  active === item.id ? '2px solid #9DD8F7' : '2px solid transparent',
            }}>
            {item.emoji} {item.label}
          </button>
        )
      })}
      <div style={{ flex: 1 }} />
      <button
        onClick={onLogout}
        className="px-3 py-2 rounded-lg text-xs text-left"
        style={{ color: 'rgba(157,216,247,0.35)' }}>
        ← Log Out
      </button>
    </aside>
  )
}
