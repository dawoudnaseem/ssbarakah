'use client'

import { useEffect, useRef, useState } from 'react'
import { todayString } from '@/lib/dateUtils'

// ─── Pre-computed stars (no Math.random — hydration-safe) ─────────────────────
const INTRO_STARS = [
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
]

// Workers — same positions/colors as the main dashboard
const WORKERS = [
  { color: '#9DD8F7', x: '34%', y: '56%' },
  { color: '#22C55E', x: '43%', y: '52%' },
  { color: '#F59E0B', x: '53%', y: '56%' },
  { color: '#A78BFA', x: '62%', y: '52%' },
]

// ─── Phase timeline ───────────────────────────────────────────────────────────
// phase | at ms  | what
//   1   |   400  | ship sails in
//   2   |  2800  | Araf bubble
//   3   |  4200  | Dawoud bubble
//   4   |  5400  | Everyone bubble
//   5   |  6200  | iceberg slams in
//   6   |  6800  | impact: shake + red alarm + crack draw + alarm sound
//   7   |  8200  | red fades, ship tilts, workers panic
//   8   | 10000  | scene fades to black
//   complete | 11500 | onDone
const PHASE_TIMINGS: { at: number; phase: number }[] = [
  { at: 400,   phase: 1 },
  { at: 2800,  phase: 2 },
  { at: 4200,  phase: 3 },
  { at: 5400,  phase: 4 },
  { at: 6200,  phase: 5 },
  { at: 6800,  phase: 6 },
  { at: 8200,  phase: 7 },
  { at: 10000, phase: 8 },
]
const COMPLETE_AT = 11500

export default function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const doneRef = useRef(false)

  function clearAllTimeouts() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    clearAllTimeouts()
    try {
      localStorage.setItem('ss_barakah_last_intro', todayString())
    } catch {
      /* localStorage unavailable — fail silently */
    }
    onDone()
  }

  function handleSkip() {
    finish()
  }

  useEffect(() => {
    PHASE_TIMINGS.forEach(({ at, phase: p }) => {
      timeoutsRef.current.push(
        setTimeout(() => {
          setPhase(p)
          if (p === 6) {
            audioRef.current?.play().catch(() => {})
          }
        }, at)
      )
    })
    timeoutsRef.current.push(setTimeout(finish, COMPLETE_AT))

    return () => {
      clearAllTimeouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scene-wrapper class: shake at phase 6, fade-out at phase 8
  let sceneClass = ''
  if (phase === 6) sceneClass = 'animate-screen-shake'
  if (phase >= 8) sceneClass = 'animate-intro-fade-out'

  // Ship sail-in: starts off-screen left, transitions to center once phase >= 1
  const shipTransform = phase >= 1 ? 'translateX(0)' : 'translateX(-110vw)'

  // Iceberg slam: starts off-screen right, transitions in once phase >= 5
  const icebergTransform = phase >= 5 ? 'translateX(0)' : 'translateX(110vw)'

  // Ship tilt after impact (phase >= 7)
  const shipTilt = phase >= 7 ? -20 : 0

  // Workers visible & panicking from phase 7
  const workersVisible = phase >= 7

  return (
    <div
      className={sceneClass}
      role="dialog"
      aria-label="Ship intro animation"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #020810 0%, #061826 40%, #0B3558 100%)',
      }}
    >
      {/* Alarm audio — not visible */}
      <audio ref={audioRef} src="/sounds/alarm.mp3" preload="auto" />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {INTRO_STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: s.w,
              height: s.w,
              top: s.top,
              left: s.left,
              opacity: phase >= 1 ? s.op : s.op * 0.3,
              transition: 'opacity 1.2s ease-out',
            }}
          />
        ))}
      </div>

      {/* Ocean — dark wave strip at bottom ~30% */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none wave-back"
        style={{ height: '30%', zIndex: 1, background: '#041220' }}
        aria-hidden="true"
      />

      {/* Red alarm overlay */}
      <div
        className={phase === 6 ? 'animate-pulse-red' : ''}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          background: 'rgba(220,38,38,0.65)',
          opacity: phase === 6 ? undefined : 0,
          transition: phase >= 7 ? 'opacity 0.6s ease-out' : undefined,
        }}
      />

      {/* Iceberg — slams in from the right */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          bottom: '24%',
          right: '2%',
          zIndex: 4,
          transform: icebergTransform,
          transition: phase >= 5 ? 'transform 0.5s ease-in' : undefined,
        }}
      >
        <svg width="130" height="200" viewBox="0 0 130 200" fill="none">
          <polygon points="65,0 130,110 0,110" fill="#9DD8F7" opacity="0.9" />
          <polygon points="65,0 130,110 0,110" fill="white" opacity="0.18" />
          <line x1="65" y1="10" x2="75" y2="60" stroke="white" strokeWidth="1" opacity="0.3" />
          <line x1="55" y1="30" x2="45" y2="80" stroke="white" strokeWidth="0.8" opacity="0.2" />
          <polygon points="10,110 120,110 128,200 2,200" fill="#0B3558" opacity="0.95" />
        </svg>
      </div>

      {/* Ship — centering wrapper (sail-in transform lives here) */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          left: '50%',
          bottom: '24%',
          marginLeft: 'calc(min(75vw, 560px) / -2)',
          zIndex: 3,
          transform: shipTransform,
          transition: phase >= 1 ? 'transform 2s ease-out' : undefined,
        }}
      >
        {/* Tilt wrapper */}
        <div
          style={{
            transform: `rotate(${shipTilt}deg)`,
            transition: 'transform 1.2s ease-in-out',
            transformOrigin: 'center bottom',
          }}
        >
          {/* Ship container — relative for absolutely-positioned bubbles + workers */}
          <div style={{ width: 'min(75vw, 560px)', position: 'relative' }}>
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
              {/* Animated crack — draws itself at phase 6 */}
              <path
                d="M240 110 L250 95 L258 105 L264 90"
                stroke="#DC2626"
                strokeWidth="2"
                fill="none"
                opacity="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 80,
                  strokeDashoffset: phase >= 6 ? 0 : 80,
                  transition: phase >= 6 ? 'stroke-dashoffset 0.4s ease-out' : undefined,
                }}
              />
              <path
                d="M258 105 L270 115"
                stroke="#DC2626"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: phase >= 6 ? 0 : 30,
                  transition: phase >= 6 ? 'stroke-dashoffset 0.4s ease-out 0.1s' : undefined,
                }}
              />
            </svg>

            {/* Workers — visible from phase 7, panicking */}
            {WORKERS.map((w, i) => (
              <div
                key={i}
                className={workersVisible ? 'animate-panic' : ''}
                style={{
                  position: 'absolute',
                  left: w.x,
                  top: w.y,
                  width: '4%',
                  height: 0,
                  paddingBottom: '4%',
                  borderRadius: '50%',
                  background: w.color,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 6px ${w.color}80`,
                  opacity: workersVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease-out',
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}

            {/* ── Dialog bubbles (positioned relative to ship container) ── */}

            {/* Araf — top-left of deck */}
            {phase === 2 && (
              <Bubble style={{ bottom: '72%', left: '20%' }}>
                Yo, word on the street is there&apos;s an iceberg in front of us.
              </Bubble>
            )}

            {/* Dawoud — top-right */}
            {phase === 3 && (
              <Bubble style={{ bottom: '72%', right: '15%' }}>
                Wdym bro?
              </Bubble>
            )}

            {/* Everyone — centered, panic */}
            {phase === 4 && (
              <Bubble
                panic
                style={{ bottom: '78%', left: '50%', transform: 'translateX(-50%)' }}
              >
                AHHHHHHHHHHH
              </Bubble>
            )}
          </div>
        </div>
      </div>

      {/* Skip button — absolute bottom-right within the fixed overlay */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          background: 'rgba(2,8,16,0.7)',
          color: '#9DD8F7',
          border: '1px solid rgba(157,216,247,0.3)',
          borderRadius: '9999px',
          padding: '8px 18px',
          fontSize: '14px',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        Skip ›
      </button>
    </div>
  )
}

// ─── Speech bubble ────────────────────────────────────────────────────────────
function Bubble({
  children,
  style,
  panic = false,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  panic?: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 6,
        maxWidth: panic ? '220px' : '180px',
        padding: panic ? '12px 18px' : '8px 14px',
        borderRadius: '14px',
        background: panic ? 'rgba(220,38,38,0.22)' : 'rgba(242,251,255,0.92)',
        border: panic ? '1px solid rgba(220,38,38,0.7)' : '1px solid rgba(157,216,247,0.6)',
        color: panic ? '#FECACA' : '#061826',
        fontSize: panic ? '22px' : '14px',
        fontWeight: panic ? 800 : 600,
        lineHeight: 1.25,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(6px)',
        animation: 'overlay-fade-in 0.25s ease-out',
        whiteSpace: panic ? 'nowrap' : 'normal',
        ...style,
      }}
    >
      {children}
      {/* Arrow */}
      <span
        style={{
          position: 'absolute',
          bottom: '-7px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          width: '12px',
          height: '12px',
          background: panic ? 'rgba(220,38,38,0.22)' : 'rgba(242,251,255,0.92)',
          borderRight: panic ? '1px solid rgba(220,38,38,0.7)' : '1px solid rgba(157,216,247,0.6)',
          borderBottom: panic ? '1px solid rgba(220,38,38,0.7)' : '1px solid rgba(157,216,247,0.6)',
        }}
      />
    </div>
  )
}
