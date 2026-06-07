'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { todayString, yesterdayString } from '@/lib/dateUtils'
import { finalizeDay } from '@/lib/finalization'
import { calculateTeamProgress } from '@/lib/calculations'
import type { Teammate, DailyTask, DailyResult } from '@/types/database'
import type { LeaderboardEntry, RecentCompletion } from '@/types/leaderboard'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import RecentRepairsFeed from '@/components/leaderboard/RecentRepairsFeed'
import BadgeDisplay from '@/components/leaderboard/BadgeDisplay'
import SunkOverlay from '@/components/SunkOverlay'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  const today = useMemo(() => todayString(), [])
  const countdown = useCountdown()

  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [allTasks, setAllTasks] = useState<DailyTask[]>([])
  const [todayResult, setTodayResult] = useState<DailyResult | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentFeed, setRecentFeed] = useState<RecentCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const hasCheckedYesterdayRef = useRef(false)

  // ── Sinking animation state ──────────────────────────────────────────────────
  const [sinkingWorkers, setSinkingWorkers] = useState(false)
  const [deepSunk, setDeepSunk] = useState(false)
  const [failureOverlayDismissed, setFailureOverlayDismissed] = useState(false)
  const [successBannerDismissed, setSuccessBannerDismissed] = useState(false)
  const sinkTriggeredRef = useRef(false)

  const fetchData = useCallback(async () => {
    // Silently finalize yesterday once per mount
    if (!hasCheckedYesterdayRef.current) {
      hasCheckedYesterdayRef.current = true
      const yesterday = yesterdayString()
      const { data: yesterdayResult } = await supabase
        .from('daily_results')
        .select('id')
        .eq('result_date', yesterday)
        .maybeSingle()
      if (!yesterdayResult) {
        try { await finalizeDay(yesterday) } catch { /* silent — background housekeeping */ }
      }
    }

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

  // Read sessionStorage dismissed flag on mount
  useEffect(() => {
    const key = `ss_barakah_sunk_dismissed_${today}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(key) === '1') {
      setFailureOverlayDismissed(true)
    }
  }, [today])

  // Read sessionStorage success banner dismissed flag on mount
  useEffect(() => {
    const key = `ss_barakah_survived_${today}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(key) === '1') {
      setSuccessBannerDismissed(true)
    }
  }, [today])

  // Trigger sinking animation exactly once when todayResult becomes sunk
  useEffect(() => {
    const isSunk = todayResult?.outcome === 'sunk'
    if (isSunk && !sinkTriggeredRef.current) {
      sinkTriggeredRef.current = true
      setSinkingWorkers(true)
      const timer = setTimeout(() => setDeepSunk(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [todayResult, today])

  const requiredTasks = allTasks.filter(t => t.is_required)
  const hasNoRequiredTasks = requiredTasks.length === 0
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

  function handleDismissSuccess() {
    const key = `ss_barakah_survived_${today}`
    sessionStorage.setItem(key, '1')
    setSuccessBannerDismissed(true)
  }

  function handleDismissOverlay() {
    const key = `ss_barakah_sunk_dismissed_${today}`
    sessionStorage.setItem(key, '1')
    setFailureOverlayDismissed(true)
  }

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
          FAILURE OVERLAY — full-screen, above progress bar (z:60)
      ════════════════════════════════════════════════════════════ */}
      {isSunk && !failureOverlayDismissed && (
        <SunkOverlay
          leaderboard={leaderboard}
          chudEntry={chudEntry}
          onDismiss={handleDismissOverlay}
        />
      )}

      {/* ════════════════════════════════════════════════════════════
          SUCCESS BANNER — slides down from top when progress = 100
      ════════════════════════════════════════════════════════════ */}
      {progress === 100 && !isSunk && !successBannerDismissed && (
        <div
          style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            right: 0,
            zIndex: 55,
            background: 'rgba(6,24,38,0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(34,197,94,0.4)',
            animation: 'slide-down 0.6s ease-out',
            overflow: 'hidden',
          }}
        >
          {/* Confetti particles */}
          {CONFETTI_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                position: 'absolute',
                bottom: 0,
                left: p.left,
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: p.color,
                animationDelay: p.delay,
              }}
            />
          ))}

          {/* Dismiss button */}
          <button
            onClick={handleDismissSuccess}
            aria-label="Dismiss success banner"
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'rgba(157,216,247,0.7)',
              fontSize: '18px',
              cursor: 'pointer',
              borderRadius: '50%',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Banner content */}
          <div style={{ textAlign: 'center', padding: '20px 56px 20px 56px' }}>
            <p style={{ color: '#22C55E', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              ⛵ The ship survived!
            </p>
            {chadEntry && (
              <p style={{ color: '#F59E0B', fontSize: '14px', marginTop: '6px', marginBottom: 0 }}>
                Chad of the Day: {chadEntry.teammate.name} 🏆 — {chadEntry.points} pts
              </p>
            )}
          </div>
        </div>
      )}

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
              {hasNoRequiredTasks
                ? <p className="text-xs italic" style={{ color: 'rgba(157,216,247,0.6)' }}>No repairs assigned yet</p>
                : <p className="text-sm font-bold" style={{ color: '#9DD8F7' }}>{progress}%</p>
              }
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(157,216,247,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, background: progress === 100 ? '#22C55E' : progress <= 25 ? '#DC2626' : '#9DD8F7' }}
              />
            </div>
            {hasNoRequiredTasks && (
              <p className="text-xs mt-1.5 text-center" style={{ color: 'rgba(157,216,247,0.5)' }}>
                Choose your tasks to begin today&apos;s mission.
              </p>
            )}
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
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none wave-back"
          style={{ height: '44%', zIndex: 1 }} aria-hidden />

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
          <div style={{
            transform: `rotate(${shipTilt}deg) ${deepSunk ? 'translateY(300px)' : isSunk ? 'translateY(140px)' : ''}`,
            transition: deepSunk ? 'transform 4s ease-in' : 'transform 1.5s ease-in-out',
            transformOrigin: 'center bottom',
          }}>
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
                  <div key={i}
                    className={sinkingWorkers ? 'animate-worker-sink' : workerClass}
                    style={{
                      position: 'absolute', left: w.x, top: w.y,
                      width: '4%', height: 0, paddingBottom: '4%',
                      borderRadius: '50%', background: w.color,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 6px ${w.color}80`,
                      animationDelay: sinkingWorkers ? `${i * 0.5}s` : `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Light front wave — z:3, IN FRONT of ship + icebergs */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none wave-front"
          style={{ height: '40%', zIndex: 3 }} aria-hidden />

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

          <BadgeDisplay
            chadName={chadEntry?.teammate.name}
            chadPoints={chadEntry?.points}
            chudName={chudEntry?.teammate.name}
            chudMissed={chudEntry?.missedRequired}
          />

          <Leaderboard entries={leaderboard} />

          <RecentRepairsFeed items={recentFeed} />

          {/* Clears the fixed progress bar */}
          <div style={{ height: '80px' }} />

        </div>
      </div>

    </div>
  )
}

// ─── Pre-computed confetti positions ─────────────────────────────────────────

const CONFETTI_PARTICLES = [
  { left: '8%',  color: '#9DD8F7', delay: '0s'   },
  { left: '20%', color: '#22C55E', delay: '0.1s'  },
  { left: '32%', color: '#F59E0B', delay: '0.2s'  },
  { left: '44%', color: '#A78BFA', delay: '0.3s'  },
  { left: '56%', color: '#9DD8F7', delay: '0.4s'  },
  { left: '68%', color: '#22C55E', delay: '0.5s'  },
  { left: '80%', color: '#F59E0B', delay: '0.6s'  },
  { left: '92%', color: '#A78BFA', delay: '0.7s'  },
]

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
