'use client'

import type { LeaderboardEntry } from '@/types/leaderboard'

interface SunkOverlayProps {
  leaderboard: LeaderboardEntry[]
  chudEntry: LeaderboardEntry | undefined
  onDismiss: () => void
}

export default function SunkOverlay({ leaderboard, chudEntry, onDismiss }: SunkOverlayProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ship has sunk"
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 60,
        background: 'rgba(2,8,16,0.92)',
        animation: 'overlay-fade-in 1s ease-in 3s both',
      }}
    >
      <div className="max-w-lg w-full mx-4 flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold" style={{ color: '#F2FBFF' }}>
          🌊 The ship has sunk.
        </h1>

        {/* Teammates who missed required tasks */}
        {leaderboard.some(e => e.missedRequired > 0) && (
          <div className="w-full rounded-2xl p-4"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(157,216,247,0.5)' }}>
              Crew who missed required tasks
            </p>
            <ul className="flex flex-col gap-1.5">
              {leaderboard
                .filter(e => e.missedRequired > 0)
                .map(e => (
                  <li key={e.teammate.id} className="text-sm" style={{ color: 'rgba(242,251,255,0.75)' }}>
                    <strong style={{ color: '#F2FBFF' }}>{e.teammate.name}</strong>
                    {' '}— {e.missedRequired} required task{e.missedRequired !== 1 ? 's' : ''} missed
                  </li>
                ))
              }
            </ul>
          </div>
        )}

        {/* Chud callout */}
        {chudEntry && (
          <div className="w-full rounded-2xl p-4"
            style={{ background: 'rgba(220,38,38,0.15)', border: '2px solid rgba(220,38,38,0.5)' }}>
            <p className="text-base font-bold" style={{ color: '#DC2626' }}>
              💀 Chud of the Day:{' '}
              <span style={{ color: '#F2FBFF' }}>{chudEntry.teammate.name}</span>
              {' '}— {chudEntry.missedRequired} tasks missed, {chudEntry.points} points
            </p>
          </div>
        )}
      </div>

      {/* Dismiss button — bottom-right */}
      <button
        onClick={onDismiss}
        className="fixed bottom-24 right-6 text-xs px-3 py-1.5 rounded-full"
        style={{
          zIndex: 65,
          background: 'rgba(157,216,247,0.1)',
          border: '1px solid rgba(157,216,247,0.3)',
          color: 'rgba(157,216,247,0.7)',
          cursor: 'pointer',
        }}
      >
        Dismiss ×
      </button>
    </div>
  )
}
