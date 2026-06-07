'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_FOCUS = 25
const DEFAULT_BREAK = 5
const MAX_FOCUS = 120

// SVG geometry
const CX = 110
const CY = 110
const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function minsToAngleRad(mins: number): number {
  return (mins / MAX_FOCUS) * 2 * Math.PI
}

function angleRadToMins(angle: number): number {
  return Math.max(1, Math.min(MAX_FOCUS, Math.round((angle / (2 * Math.PI)) * MAX_FOCUS)))
}

function handleXY(mins: number): { x: number; y: number } {
  const a = minsToAngleRad(mins)
  return { x: CX + RADIUS * Math.sin(a), y: CY - RADIUS * Math.cos(a) }
}

export default function PomodoroTimer() {
  const [focusMins, setFocusMins] = useState(DEFAULT_FOCUS)
  const [mode, setMode]           = useState<'focus' | 'break'>('focus')
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS * 60)
  const [running, setRunning]     = useState(false)
  const [dragging, setDragging]   = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)

  // Refs — keep mutable values accessible in intervals without stale closures
  const endTimeRef    = useRef<number | null>(null)
  const totalSecsRef  = useRef(DEFAULT_FOCUS * 60)
  const modeRef       = useRef<'focus' | 'break'>('focus')
  const focusMinsRef  = useRef(DEFAULT_FOCUS)
  const svgRef        = useRef<SVGSVGElement>(null)

  useEffect(() => { modeRef.current = mode },      [mode])
  useEffect(() => { focusMinsRef.current = focusMins }, [focusMins])

  // ── Tick ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return
    const tick = setInterval(() => {
      if (!endTimeRef.current) return
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) {
        const nextMode = modeRef.current === 'focus' ? 'break' : 'focus'
        const nextSecs = nextMode === 'focus'
          ? focusMinsRef.current * 60
          : DEFAULT_BREAK * 60
        totalSecsRef.current  = nextSecs
        endTimeRef.current    = Date.now() + nextSecs * 1000
        modeRef.current       = nextMode
        setMode(nextMode)
        setSecondsLeft(nextSecs)
        setShowBreathing(false)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [running])

  // ── visibilitychange drift correction ─────────────────────────────────────
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (!running || !endTimeRef.current) return
      setSecondsLeft(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  // ── Timer controls ────────────────────────────────────────────────────────
  function start() {
    if (endTimeRef.current === null) {
      // Fresh start — lock in the selected focus minutes
      const secs = focusMins * 60
      totalSecsRef.current = secs
      setSecondsLeft(secs)
      endTimeRef.current = Date.now() + secs * 1000
    } else {
      // Resume from pause
      endTimeRef.current = Date.now() + secondsLeft * 1000
    }
    setRunning(true)
  }

  function pause() { setRunning(false) }

  function reset() {
    setRunning(false)
    setShowBreathing(false)
    endTimeRef.current   = null
    modeRef.current      = 'focus'
    setMode('focus')
    totalSecsRef.current = focusMins * 60
    setSecondsLeft(focusMins * 60)
  }

  function skipBreak() {
    setShowBreathing(false)
    const secs = focusMinsRef.current * 60
    totalSecsRef.current = secs
    endTimeRef.current   = Date.now() + secs * 1000
    modeRef.current      = 'focus'
    setMode('focus')
    setSecondsLeft(secs)
    if (!running) setRunning(true)
  }

  // ── Drag — circular selector ───────────────────────────────────────────────
  function getAngleFromClient(clientX: number, clientY: number): number {
    if (!svgRef.current) return 0
    const rect = svgRef.current.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width  / 2)
    const dy = clientY - (rect.top  + rect.height / 2)
    let a = Math.atan2(dx, -dy)
    if (a < 0) a += 2 * Math.PI
    return a
  }

  useEffect(() => {
    if (!dragging) return
    function onMove(e: MouseEvent | TouchEvent) {
      const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
      const mins = angleRadToMins(getAngleFromClient(clientX, clientY))
      setFocusMins(mins)
      totalSecsRef.current = mins * 60
      setSecondsLeft(mins * 60)
    }
    function onUp() { setDragging(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [dragging]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ─────────────────────────────────────────────────────────
  const isIdle     = !running && endTimeRef.current === null
  const elapsed    = totalSecsRef.current - secondsLeft
  const progress   = totalSecsRef.current > 0 ? elapsed / totalSecsRef.current : 0
  // Starts at full dashoffset (empty) → drains to 0 (full circle)
  const progressOffset   = CIRCUMFERENCE * (1 - progress)
  const selectionOffset  = CIRCUMFERENCE * (1 - focusMins / MAX_FOCUS)
  const handle           = handleXY(focusMins)

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  // ── Breathing exercise ─────────────────────────────────────────────────────
  const PHASE_LABELS = ['Breathe in', 'Hold', 'Breathe out', 'Hold']
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathReady, setBreathReady] = useState(false)

  useEffect(() => {
    if (!showBreathing) { setBreathPhase(0); setBreathReady(false); return }
    const raf = requestAnimationFrame(() => setBreathReady(true))
    const t   = setInterval(() => setBreathPhase(p => (p + 1) % 4), 5000)
    return () => { cancelAnimationFrame(raf); clearInterval(t) }
  }, [showBreathing])

  const circleExpanded = breathReady && (breathPhase === 0 || breathPhase === 1)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(11,53,88,0.4)', border: '1px solid rgba(157,216,247,0.1)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9DD8F7' }}>Focus Timer</p>

      {/* ── Circle (selector or progress ring) ── */}
      <div className="flex justify-center mb-4">
        <svg
          ref={svgRef}
          width="220" height="220"
          viewBox="0 0 220 220"
          style={{ overflow: 'visible', touchAction: 'none', userSelect: 'none' }}
        >
          {/* Faint track */}
          <circle cx={CX} cy={CY} r={RADIUS} fill="none"
            stroke="rgba(157,216,247,0.12)" strokeWidth="4" />

          {isIdle ? (
            /* ── Selector arc + draggable handle ── */
            <>
              <circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none"
                stroke="#9DD8F7"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={selectionOffset}
                transform={`rotate(-90 ${CX} ${CY})`}
              />
              {/* Handle */}
              <circle
                cx={handle.x} cy={handle.y} r={10}
                fill="#9DD8F7"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2"
                style={{ cursor: 'grab' }}
                onMouseDown={e => { e.preventDefault(); setDragging(true) }}
                onTouchStart={() => setDragging(true)}
              />
              {/* Centre: selected minutes */}
              <text x={CX} y={CY - 4} textAnchor="middle" dominantBaseline="middle"
                fill="#F2FBFF" fontSize="38" fontWeight="700" fontFamily="monospace">
                {focusMins}
              </text>
              <text x={CX} y={CY + 24} textAnchor="middle" dominantBaseline="middle"
                fill="rgba(157,216,247,0.5)" fontSize="11" letterSpacing="1">
                minutes
              </text>
            </>
          ) : (
            /* ── Progress ring ── */
            <>
              <circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none"
                stroke={mode === 'focus' ? '#9DD8F7' : '#22C55E'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={progressOffset}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              {/* Centre: MM:SS + mode */}
              <text x={CX} y={CY - 4} textAnchor="middle" dominantBaseline="middle"
                fill="#F2FBFF" fontSize="34" fontWeight="700" fontFamily="monospace" letterSpacing="2">
                {mm}:{ss}
              </text>
              <text x={CX} y={CY + 24} textAnchor="middle" dominantBaseline="middle"
                fill={mode === 'focus' ? '#9DD8F7' : '#22C55E'} fontSize="11" fontWeight="600" letterSpacing="2">
                {mode === 'focus' ? 'FOCUS' : 'BREAK'}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* ── Buttons ── */}
      <div className="flex gap-3 justify-center mb-3">
        <button
          onClick={running ? pause : start}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: '#9DD8F7', color: '#061826' }}
        >
          {running ? 'Pause' : (endTimeRef.current !== null ? 'Resume' : 'Start')}
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#F2FBFF', border: '1px solid rgba(157,216,247,0.2)' }}
        >
          Reset
        </button>
      </div>

      {/* ── Break controls ── */}
      {mode === 'break' && !isIdle && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={skipBreak}
            className="rounded-lg px-4 py-2 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(157,216,247,0.7)', border: '1px solid rgba(157,216,247,0.15)' }}
          >
            Skip break →
          </button>
          <button
            onClick={() => setShowBreathing(true)}
            className="rounded-lg px-4 py-2 text-sm"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            🫁 Breathing Exercise
          </button>
        </div>
      )}

      {/* ── Breathing Exercise Overlay ── */}
      {showBreathing && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{ background: '#020810' }}>
          <div
            style={{
              width: '260px', height: '260px', borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, rgba(220,245,255,0.28) 0%, rgba(157,216,247,0.14) 45%, rgba(80,160,210,0.08) 100%)',
              border: '2px solid rgba(200,238,255,0.9)',
              boxShadow: '0 0 28px rgba(157,216,247,0.55), 0 0 60px rgba(100,180,230,0.2), inset 0 0 30px rgba(200,240,255,0.08), inset 2px 2px 8px rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              transform: circleExpanded ? 'scale(1)' : 'scale(0.55)',
              transition: breathPhase === 0 || breathPhase === 2 ? 'transform 5s ease-in-out' : 'transform 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '8px',
            }}
          >
            <span style={{ fontSize: '14px', color: 'rgba(200,238,255,0.8)', fontWeight: 'bold', letterSpacing: '2px' }}>
              {mm}:{ss}
            </span>
            <span style={{ fontSize: '18px', color: '#F2FBFF', fontWeight: '600', textAlign: 'center', padding: '0 24px' }}>
              {PHASE_LABELS[breathPhase]}
            </span>
          </div>
          <button
            onClick={() => setShowBreathing(false)}
            className="fixed bottom-10 rounded-lg px-6 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#F2FBFF', border: '1px solid rgba(157,216,247,0.2)' }}
          >
            Stop exercise
          </button>
        </div>
      )}
    </div>
  )
}
