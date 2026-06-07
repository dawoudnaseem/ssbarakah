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
  // results are already sorted newest-first
  let streak = 0
  for (const r of results) {
    if (r.outcome === 'survived') {
      streak++
    } else {
      break
    }
  }
  return streak
}

function calcSurvivalRate(results: DailyResult[]): string {
  if (results.length === 0) return '—'
  const survived = results.filter(r => r.outcome === 'survived').length
  return Math.round((survived / results.length) * 100) + '%'
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
        {/* More sections coming */}
      </div>
    </div>
  )
}
