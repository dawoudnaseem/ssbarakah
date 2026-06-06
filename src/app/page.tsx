'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { todayString } from '@/lib/dateUtils'
import { calculateTeamProgress } from '@/lib/calculations'
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
  'CRITICAL':        '#DC2626',
  'DAMAGED':         '#F59E0B',
  'STABILIZING':     '#9DD8F7',
  'ALMOST REPAIRED': '#22C55E',
  'SURVIVED':        '#22C55E',
  'SUNK':            '#DC2626',
}

// Workers: positions as % of the ship container (340×170 viewBox)
const WORKERS = [
  { color: '#9DD8F7', x: '34%', y: '56%' },
  { color: '#22C55E', x: '43%', y: '52%' },
  { color: '#F59E0B', x: '53%', y: '56%' },
  { color: '#A78BFA', x: '62%', y: '52%' },
]

function useCountdown() {
  const [label, setLabel] = useState('')
  useEffect(() => {
    function tick() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setLabel(`${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
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
      id: string; completed_at: string; points_awarded: number
      teammate_id: string; daily_task_id: string; task_date: string
    }>

    setTeammates(tms)
    setAllTasks(tasks)
    setTodayResult(result)

    const board: LeaderboardEntry[] = tms.map(tm => {
      const myTasks = tasks.filter(t => t.teammate_id === tm.id)
      const required = myTasks.filter(t => t.is_required)
      const points = completions
        .filter(c => c.teammate_id === tm.id)
        .reduce((sum, c) => sum + c.points_awarded, 0)
      return {
        teammate: tm,
        points,
        completedRequired: required.filter(t => t.is_completed).length,
        totalRequired: required.length,
        missedRequired: required.filter(t => !t.is_completed).length,
      }
    })
    board.sort((a, b) => b.points - a.points)
    setLeaderboard(board)

    const taskMap = new Map(tasks.map(t => [t.id, t.name]))
    const tmMap = new Map(tms.map(t => [t.id, t.name]))
    setRecentFeed(completions.slice(0, 10).map(c => ({
      id: c.id,
      completed_at: c.completed_at,
      points_awarded: c.points_awarded,
      task_name: taskMap.get(c.daily_task_id) ?? 'Task',
      teammate_name: tmMap.get(c.teammate_id) ?? 'Crew',
    })))

    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 15_000)
    return () => clearInterval(id)
  }, [fetchData])

  const progress = calculateTeamProgress(allTasks)
  const isSunk = todayResult?.outcome === 'sunk'
  const status = getMissionStatus(progress, isSunk)
  const statusColor = STATUS_COLORS[status]
  const shipTilt = isSunk ? -30 : -(15 - (progress / 100) * 15)

  let workerClass = 'animate-panic'
  if (progress === 100) workerClass = 'animate-celebrate'
  else if (progress >= 75) workerClass = 'animate-calm-worker'

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
    <div style={{ background: '#020810' }}>

      {/* ════════════════════════════════════════════════════════════
          FIXED overlays — always on top regardless of scroll
      ════════════════════════════════════════════════════════════ */}

      {/* Mission status chip — top-left, below navbar */}
      <div className="fixed left-4 pointer-events-none" style={{ top: '70px', zIndex: 40 }}>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase"
          style={{ background: `${statusColor}25`, border: `1px solid ${statusColor}70`, color: statusColor, backdropFilter: 'blur(8px)' }}
        >
          ⚓ {status}
        </span>
      </div>

      {/* Countdown — top-right, below navbar */}
      <div className="fixed right-4 pointer-events-none" style={{ top: '70px', zIndex: 40 }}>
        <span
          className="text-xs font-mono px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(6,24,38,0.65)', border: '1px solid rgba(157,216,247,0.2)', color: 'rgba(157,216,247,0.85)', backdropFilter: 'blur(8px)' }}
        >
          ⏱ {countdown}
        </span>
      </div>

      {/* Progress bar — fixed bottom */}
      <div className="fixed left-0 right-0 bottom-0" style={{ zIndex: 50 }}>
        <div style={{ background: 'rgba(6,24,38,0.88)', backdropFilter: 'blur(18px)', borderTop: '1px solid rgba(157,216,247,0.18)' }}>
          <div className="max-w-2xl mx-auto px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>Ship Repairs</p>
              <p className="text-sm font-bold" style={{ color: '#9DD8F7' }}>{progress}%</p>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(157,216,247,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, background: progress === 100 ? '#22C55E' : progress <= 25 ? '#DC2626' : '#9DD8F7' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SCENE — full-viewport Arctic surface, scrolls normally
          Wave math: target waterline at ~30% from scene bottom.
          Back wave:  height 44%, crest at y=32 → surface 44%×0.68 ≈ 30%
          Front wave: height 40%, crest at y=25 → surface 40%×0.75 ≈ 30%
          Ship keel (bottom of hull) positioned at 29% → sits on the front wave.
      ════════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '100svh', background: 'linear-gradient(180deg, #061826 0%, #0B3558 100%)' }}
      >
        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {STARS.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: s.w, height: s.w, top: s.top, left: s.left, opacity: s.op }} />
          ))}
        </div>

        {/* Dark back wave — z:1, behind ship + icebergs */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
          style={{ height: '44%', zIndex: 1 }} aria-hidden>
          <div className="animate-wave flex h-full" style={{ width: '200%' }}>
            {[0, 1].map(k => (
              <svg key={k} viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full" style={{ width: '50%' }}>
                <path d="M0 32 Q100 10 200 32 Q300 54 400 32 Q500 10 600 32 Q700 54 800 32 L800 100 L0 100 Z" fill="#041220" opacity="0.98" />
              </svg>
            ))}
          </div>
        </div>

        {/* Small iceberg — left, base touching waterline */}
        <div className="absolute pointer-events-none animate-float"
          style={{ bottom: '28%', left: '5%', zIndex: 2, animationDelay: '0.8s' }} aria-hidden>
          <svg width="70" height="90" viewBox="0 0 70 90" fill="none">
            <polygon points="35,0 70,56 0,56" fill="#9DD8F7" opacity="0.75" />
            <polygon points="35,0 70,56 0,56" fill="white" opacity="0.12" />
            <polygon points="8,56 62,56 68,90 2,90" fill="#0B3558" opacity="0.95" />
          </svg>
        </div>

        {/* Large threatening iceberg — right */}
        <div className="absolute pointer-events-none animate-float"
          style={{ bottom: '25%', right: '4%', zIndex: 2, animationDelay: '1.8s' }} aria-hidden>
          <svg width="130" height="200" viewBox="0 0 130 200" fill="none">
            <polygon points="65,0 130,110 0,110" fill="#9DD8F7" opacity="0.9" />
            <polygon points="65,0 130,110 0,110" fill="white" opacity="0.18" />
            <line x1="65" y1="10" x2="75" y2="60" stroke="white" strokeWidth="1" opacity="0.3" />
            <line x1="55" y1="30" x2="45" y2="80" stroke="white" strokeWidth="0.8" opacity="0.2" />
            <polygon points="10,110 120,110 128,200 2,200" fill="#0B3558" opacity="0.95" />
          </svg>
        </div>

        {/*
          Ship — three-wrapper pattern:
            1. Centering wrapper: left 50% + translateX(-50%) — never animated
            2. Tilt wrapper: CSS rotate based on progress — transitions smoothly
            3. Bob wrapper: animate-bob-simple (translateY only) — doesn't overwrite parents' transforms
        */}
        <div
          className="absolute pointer-events-none"
          style={{ left: '50%', bottom: '21%', transform: 'translateX(-50%)', zIndex: 2 }}
          aria-hidden
        >
          {/* Tilt */}
          <div style={{ transform: `rotate(${shipTilt}deg) ${isSunk ? 'translateY(140px)' : ''}`, transition: 'transform 1.5s ease-in-out', transformOrigin: 'center bottom' }}>
            {/* Bob */}
            <div className="animate-bob-simple">
              {/* Responsive ship container — scales down on narrow screens */}
              <div style={{ width: 'min(520px, 92vw)', position: 'relative' }}>
                <svg viewBox="0 0 340 170" style={{ width: '100%', height: 'auto', display: 'block' }} fill="none">
                  <path d="M30 110 L310 110 L290 148 L50 148 Z" fill="#061826" stroke="#9DD8F7" strokeWidth="2" />
                  <rect x="55" y="80" width="230" height="30" fill="#0B3558" stroke="#9DD8F7" strokeWidth="1.5" />
                  <rect x="90" y="42" width="140" height="38" fill="#061826" stroke="#9DD8F7" strokeWidth="1.5" />
                  <rect x="115" y="20" width="90" height="22" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
                  <line x1="170" y1="4" x2="170" y2="80" stroke="#9DD8F7" strokeWidth="3" />
                  <polygon points="170,4 202,14 170,24" fill="#F59E0B" />
                  <rect x="100" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
                  <rect x="125" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
                  <rect x="150" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
                  <rect x="175" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
                  <rect x="200" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
                  <rect x="130" y="26" width="12" height="9" rx="1.5" fill="#9DD8F7" opacity="0.45" />
                  <rect x="150" y="26" width="12" height="9" rx="1.5" fill="#9DD8F7" opacity="0.45" />
                  <rect x="170" y="26" width="12" height="9" rx="1.5" fill="#9DD8F7" opacity="0.45" />
                  <circle cx="100" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
                  <circle cx="130" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
                  <circle cx="160" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
                  <circle cx="190" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
                  <circle cx="220" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
                  <line x1="170" y1="8" x2="60" y2="80" stroke="#9DD8F7" strokeWidth="0.8" opacity="0.35" />
                  <line x1="170" y1="8" x2="280" y2="80" stroke="#9DD8F7" strokeWidth="0.8" opacity="0.35" />
                  <path d="M240 110 L250 95 L258 105 L264 90" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M258 105 L270 115" stroke="#DC2626" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
                </svg>

                {/* Workers — absolute over SVG, positions in % so they scale with the container */}
                {WORKERS.map((w, i) => (
                  <div key={i} className={workerClass} style={{
                    position: 'absolute', left: w.x, top: w.y,
                    width: '4%', height: 0, paddingBottom: '4%',
                    borderRadius: '50%', background: w.color,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 6px ${w.color}80`,
                    animationDelay: `${i * 0.12}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Light front wave — z:3, IN FRONT of ship + icebergs */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
          style={{ height: '40%', zIndex: 3 }} aria-hidden>
          <div className="animate-wave flex h-full" style={{ width: '200%', animationDuration: '6s', animationDelay: '-2s' }}>
            {[0, 1].map(k => (
              <svg key={k} viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full" style={{ width: '50%' }}>
                <path d="M0 25 Q100 8 200 25 Q300 42 400 25 Q500 8 600 25 Q700 42 800 25 L800 100 L0 100 Z" fill="#0B3558" opacity="0.94" />
              </svg>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
          style={{ bottom: '6%', zIndex: 4, opacity: 0.4 }}>
          <p className="text-xs tracking-widest uppercase" style={{ color: '#9DD8F7' }}>scroll to dive</p>
          <div style={{ width: '1px', height: '22px', background: 'linear-gradient(180deg, #9DD8F7, transparent)' }} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          ABYSS TRANSITION — ocean surface → deep dark
      ════════════════════════════════════════════════════════════ */}
      <div style={{ height: '100px', background: 'linear-gradient(180deg, #0B3558 0%, #020810 100%)' }} />

      {/* ════════════════════════════════════════════════════════════
          DATA — deep underwater widgets
      ════════════════════════════════════════════════════════════ */}
      <div className="px-4 py-6" style={{ background: '#020810' }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-5">

          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: '1px', background: 'rgba(157,216,247,0.07)' }} />
            <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(157,216,247,0.22)' }}>— deep waters —</p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(157,216,247,0.07)' }} />
          </div>

          {isSunk && (
            <div className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.35)' }}>
              <p className="text-lg font-bold mb-1" style={{ color: '#DC2626' }}>💀 The ship has sunk.</p>
              {chudEntry && (
                <p className="text-sm" style={{ color: 'rgba(242,251,255,0.65)' }}>
                  Chud of the Day: <strong>{chudEntry.teammate.name}</strong> — {chudEntry.missedRequired} tasks missed
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <BadgeCard emoji="⚓" label="Chad of the Day" name={chadEntry?.teammate.name ?? '—'}
              color="#F59E0B" subtitle={chadEntry ? `${chadEntry.points} pts` : 'Not yet assigned'} />
            <BadgeCard emoji="💀" label="Chud of the Day" name={chudEntry?.teammate.name ?? 'None'}
              color="#DC2626" subtitle={chudEntry ? `${chudEntry.missedRequired} missed` : 'Everyone held it down'} />
          </div>

          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(157,216,247,0.55)' }}>Crew Leaderboard</p>
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, i) => (
                <div key={entry.teammate.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(9,26,44,0.8)', border: '1px solid rgba(157,216,247,0.07)' }}>
                  <span className="text-sm font-bold w-5 text-center"
                    style={{ color: i === 0 ? '#F59E0B' : 'rgba(242,251,255,0.3)' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#F2FBFF' }}>{entry.teammate.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(242,251,255,0.35)' }}>
                      {entry.completedRequired}/{entry.totalRequired} required
                      {entry.missedRequired > 0 && ` · ${entry.missedRequired} missed`}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#9DD8F7' }}>{entry.points} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No crew data yet.</p>
              )}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(157,216,247,0.55)' }}>Recent Repairs</p>
            {recentFeed.length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(242,251,255,0.3)' }}>No completions yet today.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentFeed.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
                    style={{ background: 'rgba(9,26,44,0.6)', border: '1px solid rgba(157,216,247,0.06)' }}>
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

          {/* Clears the fixed progress bar */}
          <div style={{ height: '80px' }} />

        </div>
      </div>

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

// ─── Pre-computed stars ───────────────────────────────────────────────────────

const STARS = [
  { w: '2px', top: '4%',  left: '8%',  op: 0.7  },
  { w: '1px', top: '7%',  left: '22%', op: 0.5  },
  { w: '2px', top: '3%',  left: '38%', op: 0.8  },
  { w: '1px', top: '10%', left: '55%', op: 0.45 },
  { w: '2px', top: '5%',  left: '72%', op: 0.65 },
  { w: '1px', top: '2%',  left: '88%', op: 0.55 },
  { w: '1px', top: '12%', left: '14%', op: 0.4  },
  { w: '2px', top: '15%', left: '31%', op: 0.75 },
  { w: '1px', top: '9%',  left: '48%', op: 0.5  },
  { w: '2px', top: '18%', left: '65%', op: 0.6  },
  { w: '1px', top: '6%',  left: '79%', op: 0.4  },
  { w: '1px', top: '20%', left: '92%', op: 0.55 },
  { w: '2px', top: '22%', left: '5%',  op: 0.7  },
  { w: '1px', top: '25%', left: '18%', op: 0.35 },
  { w: '2px', top: '14%', left: '42%', op: 0.8  },
  { w: '1px', top: '28%', left: '60%', op: 0.45 },
  { w: '2px', top: '16%', left: '85%', op: 0.65 },
  { w: '1px', top: '30%', left: '28%', op: 0.3  },
  { w: '1px', top: '8%',  left: '95%', op: 0.5  },
  { w: '2px', top: '32%', left: '73%', op: 0.4  },
  { w: '1px', top: '24%', left: '50%', op: 0.55 },
  { w: '1px', top: '11%', left: '3%',  op: 0.6  },
  { w: '2px', top: '19%', left: '35%', op: 0.5  },
  { w: '1px', top: '27%', left: '82%', op: 0.45 },
  { w: '1px', top: '35%', left: '10%', op: 0.3  },
  { w: '2px', top: '1%',  left: '63%', op: 0.7  },
  { w: '1px', top: '13%', left: '77%', op: 0.5  },
  { w: '1px', top: '33%', left: '45%', op: 0.35 },
  { w: '2px', top: '21%', left: '20%', op: 0.6  },
  { w: '1px', top: '17%', left: '90%', op: 0.4  },
]
