'use client'

import type { LeaderboardEntry } from '@/types/leaderboard'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(157,216,247,0.55)' }}>
        Crew Leaderboard
      </p>
      <div className="flex flex-col gap-2">
        {entries.length === 0 && (
          <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No crew data yet.</p>
        )}
        {entries.map((entry, i) => (
          <LeaderboardRow key={entry.teammate.id} entry={entry} rank={i + 1} />
        ))}
      </div>
    </section>
  )
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isFirst = rank === 1
  const allDone = entry.missedRequired === 0 && entry.totalRequired > 0

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: isFirst ? 'rgba(245,158,11,0.08)' : 'rgba(9,26,44,0.8)',
        border: `1px solid ${isFirst ? 'rgba(245,158,11,0.3)' : 'rgba(157,216,247,0.08)'}`,
      }}
    >
      {/* Rank */}
      <span
        className="font-bold text-sm w-5 text-center shrink-0"
        style={{ color: isFirst ? '#F59E0B' : 'rgba(242,251,255,0.3)' }}
      >
        {rank}
      </span>

      {/* Avatar */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full font-bold text-sm"
        style={{
          width: 34, height: 34,
          background: isFirst ? '#F59E0B' : '#0B3558',
          color: isFirst ? '#061826' : '#9DD8F7',
          border: isFirst ? 'none' : '1px solid rgba(157,216,247,0.2)',
        }}
      >
        {(entry.teammate.name[0] ?? '?').toUpperCase()}
      </div>

      {/* Name + badge */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-sm font-semibold" style={{ color: '#F2FBFF' }}>
          {entry.teammate.name}
        </p>
        {entry.teammate.current_chad && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: '#F59E0B', color: '#061826', fontSize: '10px' }}
          >
            ⚓ CHAD
          </span>
        )}
        {entry.teammate.current_chud && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.4)',
              color: '#DC2626',
              fontSize: '10px',
            }}
          >
            💀 CHUD
          </span>
        )}
      </div>

      {/* Points + status */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span
          className="text-sm font-bold"
          style={{ color: isFirst ? '#F59E0B' : '#9DD8F7' }}
        >
          {entry.points} pts
        </span>
        {entry.totalRequired > 0 && (
          <span
            className="text-xs"
            style={{ color: allDone ? 'rgba(34,197,94,0.85)' : 'rgba(220,38,38,0.8)' }}
          >
            {allDone
              ? `✓ all ${entry.completedRequired}/${entry.totalRequired} tasks done`
              : `${entry.missedRequired} missed`}
          </span>
        )}
      </div>
    </div>
  )
}
