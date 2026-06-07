'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_FOCUS = 25
const DEFAULT_BREAK = 5

export default function PomodoroTimer() {
  const [focusMins, setFocusMins] = useState(DEFAULT_FOCUS)
  const [breakMins, setBreakMins] = useState(DEFAULT_BREAK)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS * 60)
  const [running, setRunning] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)

  const endTimeRef = useRef<number | null>(null)
  const modeRef = useRef<'focus' | 'break'>('focus')
  const focusMinsRef = useRef(DEFAULT_FOCUS)
  const breakMinsRef = useRef(DEFAULT_BREAK)

  // Keep refs in sync with state so the interval never has stale closures
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { focusMinsRef.current = focusMins }, [focusMins])
  useEffect(() => { breakMinsRef.current = breakMins }, [breakMins])

  // Tick every second — deps only on `running` so interval is never recreated mid-session
  useEffect(() => {
    if (!running) return
    const tick = setInterval(() => {
      if (!endTimeRef.current) return
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) {
        const nextMode = modeRef.current === 'focus' ? 'break' : 'focus'
        const nextSecs = (nextMode === 'focus' ? focusMinsRef.current : breakMinsRef.current) * 60
        endTimeRef.current = Date.now() + nextSecs * 1000
        modeRef.current = nextMode
        setMode(nextMode)
        setShowBreathing(false)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [running])

  // visibilitychange drift correction
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (!running || !endTimeRef.current) return
      setSecondsLeft(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  function start() {
    endTimeRef.current = Date.now() + secondsLeft * 1000
    setRunning(true)
  }

  function pause() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setShowBreathing(false)
    modeRef.current = 'focus'
    setMode('focus')
    setFocusMins(DEFAULT_FOCUS)
    setBreakMins(DEFAULT_BREAK)
    setSecondsLeft(DEFAULT_FOCUS * 60)
    endTimeRef.current = null
  }

  // Breathing phase: 0=breathe-in, 1=hold-big, 2=breathe-out, 3=hold-small
  const PHASE_LABELS = ['Breathe in', 'Hold', 'Breathe out', 'Hold']
  const [breathPhase, setBreathPhase] = useState(0)
  // breathReady delays the first scale transition by one frame so the circle
  // renders small before growing on phase 0 (breathe in)
  const [breathReady, setBreathReady] = useState(false)

  useEffect(() => {
    if (!showBreathing) {
      setBreathPhase(0)
      setBreathReady(false)
      return
    }
    // Let the browser paint the small circle first, then start growing
    const raf = requestAnimationFrame(() => setBreathReady(true))
    const t = setInterval(() => {
      setBreathPhase(p => (p + 1) % 4)
    }, 5000)
    return () => { cancelAnimationFrame(raf); clearInterval(t) }
  }, [showBreathing])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  // Circle is large during hold-big (phase 1) and after breathe-in completes.
  // Phase 0 transitions FROM small TO large (needs breathReady to start the transition).
  const circleExpanded = breathReady && (breathPhase === 0 || breathPhase === 1)

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(11,53,88,0.4)', border: '1px solid rgba(157,216,247,0.1)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>Focus Timer</p>

      {/* Duration inputs — only shown when stopped */}
      {!running && (
        <div className="flex gap-4 mb-4">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs" style={{ color: 'rgba(157,216,247,0.5)' }}>Focus (min)</span>
            <input
              type="number"
              min={1}
              value={focusMins}
              onChange={e => {
                const v = Math.max(1, Number(e.target.value))
                setFocusMins(v)
                if (mode === 'focus') setSecondsLeft(v * 60)
              }}
              className="rounded-lg px-3 py-2 text-sm w-full"
              style={{ background: 'rgba(6,24,38,0.6)', border: '1px solid rgba(157,216,247,0.15)', color: '#F2FBFF' }}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs" style={{ color: 'rgba(157,216,247,0.5)' }}>Rest (min)</span>
            <input
              type="number"
              min={1}
              value={breakMins}
              onChange={e => {
                const v = Math.max(1, Number(e.target.value))
                setBreakMins(v)
                if (mode === 'break') setSecondsLeft(v * 60)
              }}
              className="rounded-lg px-3 py-2 text-sm w-full"
              style={{ background: 'rgba(6,24,38,0.6)', border: '1px solid rgba(157,216,247,0.15)', color: '#F2FBFF' }}
            />
          </label>
        </div>
      )}

      {/* MM:SS display */}
      <p className="text-center font-bold tracking-widest mb-1" style={{ fontSize: '36px', color: '#F2FBFF', letterSpacing: '6px' }}>
        {mm}:{ss}
      </p>

      {/* Mode label */}
      <p className="text-center text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: mode === 'focus' ? '#9DD8F7' : '#22C55E' }}>
        {mode === 'focus' ? 'Focus' : 'Break'}
      </p>

      {/* Buttons */}
      <div className="flex gap-3 justify-center mb-3">
        <button
          onClick={running ? pause : start}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: '#9DD8F7', color: '#061826' }}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#F2FBFF', border: '1px solid rgba(157,216,247,0.2)' }}
        >
          Reset
        </button>
      </div>

      {/* Breathing exercise button — break mode only */}
      {mode === 'break' && (
        <div className="flex justify-center">
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
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{ background: '#020810' }}
        >
          {/* Outer wrapper handles scale transform — children stay unscaled */}
          <div style={{ position: 'relative' }}>
            {/* Animated ice circle */}
            <div
              style={{
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                // Translucent ice: layered radial gradient
                background: 'radial-gradient(circle at 38% 32%, rgba(220,245,255,0.28) 0%, rgba(157,216,247,0.14) 45%, rgba(80,160,210,0.08) 100%)',
                // Shiny blue edge: bright border + outer glow + inner highlight
                border: '2px solid rgba(200,238,255,0.9)',
                boxShadow: '0 0 28px rgba(157,216,247,0.55), 0 0 60px rgba(100,180,230,0.2), inset 0 0 30px rgba(200,240,255,0.08), inset 2px 2px 8px rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                transform: circleExpanded ? 'scale(1)' : 'scale(0.55)',
                transition: breathPhase === 0 || breathPhase === 2 ? 'transform 5s ease-in-out' : 'transform 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Small fixed timer inside circle — does NOT scale */}
              <span style={{ fontSize: '14px', color: 'rgba(200,238,255,0.8)', fontWeight: 'bold', letterSpacing: '2px' }}>
                {mm}:{ss}
              </span>
              {/* Instruction text — scales with circle */}
              <span style={{ fontSize: '18px', color: '#F2FBFF', fontWeight: '600', textAlign: 'center', padding: '0 24px' }}>
                {PHASE_LABELS[breathPhase]}
              </span>
            </div>

          </div>

          {/* Fixed stop button */}
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
