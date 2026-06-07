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

  return (
    <div style={{ minHeight: '100vh', background: '#061826', paddingTop: '80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ color: '#9DD8F7', fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
          📜 Voyage History
        </h1>
        <p style={{ color: 'rgba(157,216,247,0.4)', fontSize: '13px', marginBottom: '32px' }}>
          All-time records for S.S. Barakah
        </p>
        {/* Sections rendered in later tasks */}
      </div>
    </div>
  )
}
