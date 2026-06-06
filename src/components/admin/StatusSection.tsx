'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { todayString } from '@/lib/dateUtils'
import type { Teammate, DailyTask } from '@/types/database'

interface TeamStatus {
  teammate: Teammate
  points: number
  completedRequired: number
  totalRequired: number
  missed: number
}

export default function StatusSection() {
  const [rows, setRows] = useState<TeamStatus[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchStatus() {
    setLoading(true)
    const today = todayString()
    const [{ data: tmData }, { data: taskData }, { data: compData }] = await Promise.all([
      supabase.from('teammates').select('*').eq('is_active', true).order('name'),
      supabase.from('daily_tasks').select('*').eq('task_date', today),
      supabase.from('task_completions').select('teammate_id, points_awarded').eq('task_date', today),
    ])

    const tms = (tmData ?? []) as Teammate[]
    const tasks = (taskData ?? []) as DailyTask[]
    const comps = (compData ?? []) as { teammate_id: string; points_awarded: number }[]

    setRows(tms.map(tm => {
      const myTasks = tasks.filter(t => t.teammate_id === tm.id)
      const required = myTasks.filter(t => t.is_required)
      const completedRequired = required.filter(t => t.is_completed).length
      const points = comps.filter(c => c.teammate_id === tm.id).reduce((s, c) => s + c.points_awarded, 0)
      return {
        teammate: tm,
        points,
        completedRequired,
        totalRequired: required.length,
        missed: required.length - completedRequired,
      }
    }))
    setLoading(false)
  }

  useEffect(() => { fetchStatus() }, [])

  if (loading) return <p style={{ color: '#9DD8F7' }}>Loading…</p>

  if (rows.length === 0) return (
    <div>
      <h2 className="text-lg font-bold mb-2" style={{ color: '#F2FBFF' }}>Today&apos;s Status</h2>
      <p style={{ color: 'rgba(157,216,247,0.4)' }}>No active teammates found.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: '#F2FBFF' }}>Today&apos;s Status</h2>
        <button onClick={fetchStatus}
          className="text-xs px-3 py-1 rounded-lg"
          style={{ background: 'rgba(157,216,247,0.1)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
          ↻ Refresh
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(157,216,247,0.12)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(157,216,247,0.06)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Teammate</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Points</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Required</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Missed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const bg = r.missed > 0
                ? 'rgba(220,38,38,0.05)'
                : r.totalRequired > 0 && r.completedRequired === r.totalRequired
                ? 'rgba(34,197,94,0.05)'
                : 'transparent'
              const missedColor = r.missed > 0 ? '#DC2626' : 'rgba(157,216,247,0.35)'
              const reqColor = r.completedRequired === r.totalRequired && r.totalRequired > 0 ? '#22C55E' : '#F2FBFF'
              return (
                <tr key={r.teammate.id}
                  style={{ background: bg, borderTop: i > 0 ? '1px solid rgba(157,216,247,0.06)' : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#F2FBFF' }}>{r.teammate.name}</td>
                  <td className="px-4 py-3 text-right" style={{ color: '#9DD8F7' }}>{r.points} pts</td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: reqColor }}>
                    {r.completedRequired} / {r.totalRequired}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: missedColor }}>
                    {r.missed}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
