'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Teammate, DailyResult, TeammateDailyStat } from '@/types/database'

interface HistoryData {
  results: DailyResult[]
  stats: TeammateDailyStat[]
  teammates: Teammate[]
  completionCounts: Record<string, number> // teammate_id → total task completions all-time
}

function calcStreak(results: DailyResult[]): number {
  // results are sorted newest-first
  // A gap in dates (missing day) breaks the streak
  let streak = 0
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    // Check for date gap: expected date is today minus i days
    const expected = new Date()
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]
    if (r.result_date !== expectedStr) break  // gap in dates — streak ends
    if (r.outcome === 'survived') {
      streak++
    } else {
      break  // sunk day — streak ends
    }
  }
  return streak
}

function calcSurvivalRate(results: DailyResult[]): string {
  if (results.length === 0) return '—'
  const survived = results.filter(r => r.outcome === 'survived').length
  return Math.round((survived / results.length) * 100) + '%'
}

interface CrewRecord {
  teammate: Teammate
  totalPoints: number
  totalCompletions: number
  chadCount: number
  chudCount: number
}

function heatmapColor(points: number, missedRequired: number): string {
  if (missedRequired > 0) return 'rgba(220,38,38,0.5)'
  if (points === 0)  return 'rgba(255,255,255,0.05)'
  if (points < 10)  return '#7C3200'
  if (points < 20)  return '#B84A00'
  if (points < 35)  return '#F97316'
  return '#FBBF24'
}

function buildHeatmapCells(
  teammateId: string,
  stats: TeammateDailyStat[]
): { color: string; date: string }[] {
  const byDate: Record<string, TeammateDailyStat> = {}
  for (const s of stats) {
    if (s.teammate_id === teammateId) byDate[s.stat_date] = s
  }

  const cells: { color: string; date: string }[] = []
  for (let i = 59; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const stat = byDate[dateStr]
    cells.push({
      date: dateStr,
      color: stat
        ? heatmapColor(stat.points_earned, stat.missed_required_tasks)
        : 'rgba(255,255,255,0.05)',
    })
  }
  return cells
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildCrewRecords(
  teammates: Teammate[],
  stats: TeammateDailyStat[],
  completionCounts: Record<string, number>
): CrewRecord[] {
  return teammates
    .map(tm => ({
      teammate: tm,
      totalPoints: stats.filter(s => s.teammate_id === tm.id).reduce((sum, s) => sum + s.points_earned, 0),
      totalCompletions: completionCounts[tm.id] ?? 0,
      chadCount: stats.filter(s => s.teammate_id === tm.id && s.is_chad).length,
      chudCount: stats.filter(s => s.teammate_id === tm.id && s.is_chud).length,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    setLoading(true)
    const [
      { data: results },
      { data: stats },
      { data: teammates },
      { data: completions },
    ] = await Promise.all([
      supabase.from('daily_results').select('*').order('result_date', { ascending: false }),
      supabase.from('teammate_daily_stats').select('*'),
      supabase.from('teammates').select('*').order('name'),
      supabase.from('task_completions').select('teammate_id'),
    ])

    const counts: Record<string, number> = {}
    for (const c of (completions ?? [])) {
      counts[c.teammate_id] = (counts[c.teammate_id] ?? 0) + 1
    }

    setData({
      results: (results ?? []) as DailyResult[],
      stats: (stats ?? []) as TeammateDailyStat[],
      teammates: (teammates ?? []) as Teammate[],
      completionCounts: counts,
    })
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#061826', paddingTop: '80px' }}>
      <p style={{ color: '#9DD8F7', textAlign: 'center', paddingTop: '60px' }}>Loading voyage records…</p>
    </div>
  )

  function renderFleetSummary() {
    const { results } = data!
    const survived = results.filter(r => r.outcome === 'survived').length
    const sunk = results.filter(r => r.outcome === 'sunk').length
    const streak = calcStreak(results)
    const rate = calcSurvivalRate(results)

    const chips = [
      { label: 'Days Survived', value: results.length === 0 ? '—' : String(survived), color: '#9DD8F7' },
      { label: 'Current Streak', value: results.length === 0 ? '—' : `${streak} 🔥`, color: '#F59E0B' },
      { label: 'Days Sunk',      value: results.length === 0 ? '—' : String(sunk),     color: '#DC2626' },
      { label: 'Survival Rate',  value: rate,                                            color: '#22C55E' },
    ]

    return (
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(157,216,247,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Fleet Summary
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {chips.map(chip => (
            <div key={chip.label} style={{ background: 'rgba(157,216,247,0.05)', border: '1px solid rgba(157,216,247,0.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: chip.color, lineHeight: 1 }}>{chip.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(157,216,247,0.4)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chip.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderCrewRecords() {
    const { teammates, stats, completionCounts } = data!
    const activeTeammates = teammates.filter(t => t.is_active)
    const records = buildCrewRecords(activeTeammates, stats, completionCounts)

    if (records.length === 0) return (
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(157,216,247,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Crew All-Time Records</p>
        <p style={{ color: 'rgba(157,216,247,0.35)', fontSize: '13px' }}>No crew data yet.</p>
      </div>
    )

    return (
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(157,216,247,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Crew All-Time Records</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {records.map((rec, idx) => {
            const isTop = idx === 0
            const avatarStyle: React.CSSProperties = isTop
              ? { background: 'rgba(245,158,11,0.2)', border: '2px solid rgba(245,158,11,0.5)', color: '#F59E0B' }
              : { background: 'rgba(157,216,247,0.15)', border: '2px solid rgba(157,216,247,0.25)', color: '#9DD8F7' }
            const pointsColor = isTop ? '#F59E0B' : '#9DD8F7'

            return (
              <div key={rec.teammate.id} style={{ background: 'rgba(11,53,88,0.5)', border: '1px solid rgba(157,216,247,0.1)', borderRadius: '14px', padding: '22px 24px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
                  {/* Avatar */}
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '22px', flexShrink: 0, ...avatarStyle }}>
                    {(rec.teammate.name[0] ?? '?').toUpperCase()}
                  </div>
                  {/* Name + pills */}
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#F2FBFF' }}>{rec.teammate.name}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {rec.chadCount > 0 && (
                        <span style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '20px', fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                          ⚓ Chad ×{rec.chadCount}
                        </span>
                      )}
                      {rec.chudCount > 0 && (
                        <span style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '20px', fontWeight: 600, background: 'rgba(220,38,38,0.15)', color: '#DC2626' }}>
                          💀 Chud ×{rec.chudCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '32px', marginLeft: 'auto', textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '36px', fontWeight: 900, color: pointsColor, lineHeight: 1 }}>{rec.totalPoints}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(157,216,247,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Total Points</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '36px', fontWeight: 900, color: '#9DD8F7', lineHeight: 1 }}>{rec.totalCompletions}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(157,216,247,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Tasks Done</div>
                    </div>
                  </div>
                </div>
                {/* Heatmap */}
                <div>
                  <p style={{ fontSize: '10px', color: 'rgba(157,216,247,0.3)', marginBottom: '5px' }}>
                    Last 60 days — darker = low pts · gold = high pts · red = missed required
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 14px)', gridTemplateRows: 'repeat(3, 14px)', gap: '3px', width: 'fit-content' }}>
                    {buildHeatmapCells(rec.teammate.id, data!.stats).map(cell => (
                      <div key={cell.date} style={{ width: '14px', height: '14px', borderRadius: '3px', background: cell.color }} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderDailyLog() {
    const { results, teammates } = data!
    // All teammates (including inactive) so old log entries with inactive Chad/Chud still resolve
    const tmById: Record<string, string> = {}
    for (const tm of teammates) tmById[tm.id] = tm.name

    if (results.length === 0) return (
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(157,216,247,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Daily Log</p>
        <p style={{ color: 'rgba(157,216,247,0.35)', fontSize: '13px' }}>No voyages recorded yet.</p>
      </div>
    )

    return (
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(157,216,247,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Daily Log</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.map(r => {
            const survived = r.outcome === 'survived'
            const bg = survived ? 'rgba(34,197,94,0.06)' : 'rgba(220,38,38,0.06)'
            const border = survived ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(220,38,38,0.2)'
            const chadName = r.chad_teammate_id ? tmById[r.chad_teammate_id] : null
            const chudName = r.chud_teammate_id ? tmById[r.chud_teammate_id] : null
            const pct = Math.round(r.completion_percentage)

            return (
              <div key={r.id} style={{ borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', background: bg, border }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{survived ? '⛵' : '🌊'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'rgba(157,216,247,0.4)' }}>{formatDate(r.result_date)}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F2FBFF' }}>{survived ? 'Ship Survived' : 'Ship Sank'}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
                    {chadName && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>⚓ Chad: {chadName}</span>
                    )}
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(220,38,38,0.12)', color: '#DC2626' }}>
                      💀 Chud: {chudName ?? 'None'}
                    </span>
                    {r.total_required_tasks > 0 && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(157,216,247,0.1)', color: '#9DD8F7' }}>
                        {r.completed_required_tasks}/{r.total_required_tasks} crew complete
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(157,216,247,0.25)', flexShrink: 0 }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#061826', paddingTop: '80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ color: '#9DD8F7', fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
          📜 Voyage History
        </h1>
        <p style={{ color: 'rgba(157,216,247,0.4)', fontSize: '13px', marginBottom: '32px' }}>
          All-time records for S.S. Barakah
        </p>
        {renderFleetSummary()}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(157,216,247,0.08)', margin: '28px 0' }} />
        {renderCrewRecords()}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(157,216,247,0.08)', margin: '28px 0' }} />
        {renderDailyLog()}
      </div>
    </div>
  )
}
