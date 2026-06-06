'use client'

function BadgeCard({ emoji, label, name, color, subtitle }: {
  emoji: string; label: string; name: string; color: string; subtitle: string
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: `${color}08`, border: `1px solid ${color}35` }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>{emoji} {label}</p>
      <p className="text-base font-bold" style={{ color: '#F2FBFF' }}>{name}</p>
      <p className="text-xs" style={{ color: 'rgba(242,251,255,0.4)' }}>{subtitle}</p>
    </div>
  )
}

export default function BadgeDisplay({
  chadName,
  chadPoints,
  chudName,
  chudMissed,
}: {
  chadName: string | undefined
  chadPoints: number | undefined
  chudName: string | undefined
  chudMissed: number | undefined
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <BadgeCard
        emoji="⚓"
        label="Chad of the Day"
        name={chadName ?? '—'}
        color="#F59E0B"
        subtitle={chadName ? `${chadPoints} pts` : 'Not yet assigned'}
      />
      <BadgeCard
        emoji="💀"
        label="Chud of the Day"
        name={chudName ?? 'None'}
        color="#DC2626"
        subtitle={chudName ? `${chudMissed} missed` : 'Everyone held it down'}
      />
    </div>
  )
}
