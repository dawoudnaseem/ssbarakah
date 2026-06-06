'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { todayString } from '@/lib/dateUtils'
import { calculateTeamProgress } from '@/lib/calculations'
import { ShipScene } from '@/components/ship/ShipScene'
import type { Teammate, DailyTask, DailyResult } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  teammate: Teammate
  points: number
  completedRequired: number
  totalRequired: number
  missedRequired: number
}

interface RecentCompletion {
  id: string
  completed_at: string
  points_awarded: number
  task_name: string
  teammate_name: string
}

type MissionStatus = 'CRITICAL' | 'DAMAGED' | 'STABILIZING' | 'ALMOST REPAIRED' | 'SURVIVED' | 'SUNK'

function getMissionStatus(progress: number, isSunk: boolean): MissionStatus {
  if (isSunk) return 'SUNK'
  if (progress === 100) return 'SURVIVED'
  if (progress <= 25) return 'CRITICAL'
  if (progress <= 50) return 'DAMAGED'
  if (progress <= 75) return 'STABILIZING'
  return 'ALMOST REPAIRED'
}

const STATUS_COLORS: Record<MissionStatus, string> = {
  'CRITICAL':       '#DC2626',
  'DAMAGED':        '#F59E0B',
  'STABILIZING':    '#9DD8F7',
  'ALMOST REPAIRED':'#22C55E',
  'SURVIVED':       '#22C55E',
  'SUNK':           '#DC2626',
}

function useCountdown() {
  const [label, setLabel] = useState('')
  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setLabel(`${h}h ${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return label
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShipDashboard() {
  const today = todayString()
  const countdown = useCountdown()

  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [allTasks, setAllTasks] = useState<DailyTask[]>([])
  const [todayResult, setTodayResult] = useState<DailyResult | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentFeed, setRecentFeed] = useState<RecentCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [
      { data: tmData },
      { data: taskData },
      { data: resultData },
      { data: completionData },
    ] = await Promise.all([
      supabase.from('teammates').select('*').eq('is_active', true).order('name'),
      supabase.from('daily_tasks').select('*').eq('task_date', today),
      supabase.from('daily_results').select('*').eq('result_date', today).maybeSingle(),
      supabase
        .from('task_completions')
        .select('id, completed_at, points_awarded, teammate_id, daily_task_id, task_date')
        .eq('task_date', today)
        .order('completed_at', { ascending: false }),
    ])

    const tms = (tmData ?? []) as Teammate[]
    const tasks = (taskData ?? []) as DailyTask[]
    const result = resultData as DailyResult | null
    const completions = (completionData ?? []) as Array<{
      id: string; completed_at: string; points_awarded: number; teammate_id: string; daily_task_id: string; task_date: string
    }>

    setTeammates(tms)
    setAllTasks(tasks)
    setTodayResult(result)

    // Build leaderboard
    const board: LeaderboardEntry[] = tms.map(tm => {
      const myTasks = tasks.filter(t => t.teammate_id === tm.id)
      const required = myTasks.filter(t => t.is_required)
      const completedRequired = required.filter(t => t.is_completed).length
      const points = completions
        .filter(c => c.teammate_id === tm.id)
        .reduce((sum, c) => sum + c.points_awarded, 0)
      return {
        teammate: tm,
        points,
        completedRequired,
        totalRequired: required.length,
        missedRequired: required.filter(t => !t.is_completed).length,
      }
    })
    board.sort((a, b) => b.points - a.points)
    setLeaderboard(board)

    // Build recent feed — last 10, newest first; resolve task names from tasks array
    const taskMap = new Map(tasks.map(t => [t.id, t.name]))
    const tmMap = new Map(tms.map(t => [t.id, t.name]))
    const feed: RecentCompletion[] = completions.slice(0, 10).map(c => ({
      id: c.id,
      completed_at: c.completed_at,
      points_awarded: c.points_awarded,
      task_name: taskMap.get(c.daily_task_id) ?? 'Task',
      teammate_name: tmMap.get(c.teammate_id) ?? 'Crew',
    }))
    setRecentFeed(feed)

    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const progress = calculateTeamProgress(allTasks)
  const isSunk = todayResult?.outcome === 'sunk'
  const status = getMissionStatus(progress, isSunk)
  const statusColor = STATUS_COLORS[status]

  const chadEntry = leaderboard.find(e => e.teammate.current_chad)
  const chudEntry = leaderboard.find(e => e.teammate.current_chud)

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#061826' }}>
        <p style={{ color: '#9DD8F7' }}>Loading mission status…</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ background: 'linear-gradient(180deg, #061826 0%, #0B3558 100%)', color: '#F2FBFF' }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Mission status + countdown ── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase"
            style={{ background: `${statusColor}20`, border: `1px solid ${statusColor}60`, color: statusColor }}
          >
            ⚓ {status}
          </span>
          <span className="text-sm font-mono" style={{ color: 'rgba(157,216,247,0.7)' }}>
            ⏱ {countdown} until midnight
          </span>
        </div>

        {/* ── Team progress bar ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>Ship Repairs</p>
            <p className="text-sm font-bold" style={{ color: '#9DD8F7' }}>{progress}%</p>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(157,216,247,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: progress === 100 ? '#22C55E' : progress <= 25 ? '#DC2626' : '#9DD8F7' }}
            />
          </div>
          {allTasks.filter(t => t.is_required).length === 0 && (
            <p className="text-xs mt-1" style={{ color: 'rgba(242,251,255,0.4)' }}>No repairs assigned yet — crew must add tasks.</p>
          )}
        </div>

        {/* ── Ship scene ── */}
        <ShipScene progress={progress} isSunk={isSunk} />

        {/* ── Failure overlay (day ended, ship sunk) ── */}
        {isSunk && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.4)' }}
          >
            <p className="text-lg font-bold mb-1" style={{ color: '#DC2626' }}>💀 The ship has sunk.</p>
            {chudEntry && (
              <p className="text-sm" style={{ color: 'rgba(242,251,255,0.7)' }}>
                Chud of the Day: <strong>{chudEntry.teammate.name}</strong> — {chudEntry.missedRequired} tasks missed
              </p>
            )}
          </div>
        )}

        {/* ── Chad + Chud badges ── */}
        <div className="grid grid-cols-2 gap-3">
          <BadgeCard
            emoji="⚓"
            label="Chad of the Day"
            name={chadEntry?.teammate.name ?? '—'}
            color="#F59E0B"
            subtitle={chadEntry ? `${chadEntry.points} pts` : 'Not yet assigned'}
          />
          <BadgeCard
            emoji="💀"
            label="Chud of the Day"
            name={chudEntry?.teammate.name ?? 'None'}
            color="#DC2626"
            subtitle={chudEntry ? `${chudEntry.missedRequired} missed` : 'Everyone held it down'}
          />
        </div>

        {/* ── Leaderboard ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>Crew Leaderboard</p>
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.teammate.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(11,53,88,0.5)', border: '1px solid rgba(157,216,247,0.1)' }}
              >
                <span className="text-sm font-bold w-5 text-center" style={{ color: i === 0 ? '#F59E0B' : 'rgba(242,251,255,0.4)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#F2FBFF' }}>{entry.teammate.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(242,251,255,0.45)' }}>
                    {entry.completedRequired}/{entry.totalRequired} required
                    {entry.missedRequired > 0 && ` · ${entry.missedRequired} missed`}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: '#9DD8F7' }}>{entry.points} pts</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-sm" style={{ color: 'rgba(242,251,255,0.4)' }}>No crew data yet.</p>
            )}
          </div>
        </section>

        {/* ── Recent completions feed ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>Recent Repairs</p>
          {recentFeed.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(242,251,255,0.4)' }}>No completions yet today.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentFeed.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
                  style={{ background: 'rgba(11,53,88,0.35)', border: '1px solid rgba(157,216,247,0.08)' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate" style={{ color: '#F2FBFF' }}>
                      <span style={{ color: '#9DD8F7' }}>{c.teammate_name}</span> — {c.task_name}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(242,251,255,0.4)' }}>
                      {formatTime(c.completed_at)}
                    </p>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: '#22C55E' }}>+{c.points_awarded}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BadgeCard({ emoji, label, name, color, subtitle }: {
  emoji: string; label: string; name: string; color: string; subtitle: string
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: `${color}10`, border: `1px solid ${color}40` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>{emoji} {label}</p>
      <p className="text-base font-bold" style={{ color: '#F2FBFF' }}>{name}</p>
      <p className="text-xs" style={{ color: 'rgba(242,251,255,0.5)' }}>{subtitle}</p>
    </div>
  )
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
