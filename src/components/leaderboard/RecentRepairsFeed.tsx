'use client'

import type { RecentCompletion } from '@/types/leaderboard'

interface RecentRepairsFeedProps {
  items: RecentCompletion[]
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function RecentRepairsFeed({ items }: RecentRepairsFeedProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(157,216,247,0.55)' }}>
        Recent Repairs
      </p>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No completions yet today.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(9,26,44,0.6)', border: '1px solid rgba(157,216,247,0.06)' }}
            >
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: '#F2FBFF' }}>
                  <span style={{ color: '#9DD8F7' }}>{c.teammate_name}</span> — {c.task_name}
                </p>
                <p className="text-xs" style={{ color: 'rgba(242,251,255,0.3)' }}>{formatTime(c.completed_at)}</p>
              </div>
              <span className="text-xs font-bold shrink-0" style={{ color: '#22C55E' }}>+{c.points_awarded}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
