'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginTeammate } from '@/lib/auth'
import IcyErrorModal from '@/components/IcyErrorModal'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const teammate = await loginTeammate(name.trim(), password)
    setLoading(false)
    if (!teammate) {
      setError('Invalid name or password. The sea denies you passage.')
      return
    }
    router.push(`/teammate/${teammate.id}`)
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(180deg, #061826 0%, #0B3558 100%)' }}
    >
      {/* ── Stars ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ width: s.w, height: s.w, top: s.top, left: s.left, opacity: s.op }}
          />
        ))}
      </div>

      {/* ── Title ── */}
      <div className="relative z-10 flex flex-col items-center pt-10 sm:pt-14 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-wide" style={{ color: '#F2FBFF', letterSpacing: '0.05em' }}>
          S.S. Barakah
        </h1>
        <p className="mt-2 text-sm sm:text-base text-center max-w-xs" style={{ color: '#9DD8F7' }}>
          Complete your tasks. Save the ship. Earn the barakah.
        </p>
      </div>

      {/* ── Scene: ship + icebergs ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4" style={{ minHeight: '300px' }}>

        {/* Smaller iceberg — left */}
        <div
          className="absolute animate-float pointer-events-none"
          style={{ bottom: '5%', left: '4%', animationDelay: '0.8s' }}
          aria-hidden
        >
          <svg width="70" height="90" viewBox="0 0 70 90" fill="none">
            <polygon points="35,0 70,56 0,56" fill="#9DD8F7" opacity="0.75" />
            <polygon points="35,0 70,56 0,56" fill="white" opacity="0.12" />
            <polygon points="8,56 62,56 68,90 2,90" fill="#0B3558" opacity="0.95" />
          </svg>
        </div>

        {/* Large ship — center, tilted 5° */}
        <div
          className="animate-bob pointer-events-none"
          style={{ transform: 'rotate(5deg)', transformOrigin: 'center bottom' }}
          aria-hidden
        >
          <svg width="340" height="170" viewBox="0 0 340 170" fill="none">
            {/* Hull */}
            <path d="M30 110 L310 110 L290 148 L50 148 Z" fill="#061826" stroke="#9DD8F7" strokeWidth="2" />
            {/* Deck */}
            <rect x="55" y="80" width="230" height="30" fill="#0B3558" stroke="#9DD8F7" strokeWidth="1.5" />
            {/* Cabin — main */}
            <rect x="90" y="42" width="140" height="38" fill="#061826" stroke="#9DD8F7" strokeWidth="1.5" />
            {/* Cabin — upper */}
            <rect x="115" y="20" width="90" height="22" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
            {/* Mast */}
            <line x1="170" y1="4" x2="170" y2="80" stroke="#9DD8F7" strokeWidth="3" />
            {/* Flag */}
            <polygon points="170,4 202,14 170,24" fill="#F59E0B" />
            {/* Windows — lower cabin */}
            <rect x="100" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
            <rect x="125" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
            <rect x="150" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
            <rect x="175" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
            <rect x="200" y="50" width="16" height="12" rx="2" fill="#9DD8F7" opacity="0.55" />
            {/* Windows — upper cabin */}
            <rect x="130" y="26" width="12" height="9" rx="1.5" fill="#9DD8F7" opacity="0.45" />
            <rect x="150" y="26" width="12" height="9" rx="1.5" fill="#9DD8F7" opacity="0.45" />
            <rect x="170" y="26" width="12" height="9" rx="1.5" fill="#9DD8F7" opacity="0.45" />
            {/* Porthole row on hull */}
            <circle cx="100" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
            <circle cx="130" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
            <circle cx="160" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
            <circle cx="190" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
            <circle cx="220" cy="125" r="5" fill="none" stroke="#9DD8F7" strokeWidth="1" opacity="0.4" />
            {/* Rigging */}
            <line x1="170" y1="8" x2="60" y2="80" stroke="#9DD8F7" strokeWidth="0.8" opacity="0.35" />
            <line x1="170" y1="8" x2="280" y2="80" stroke="#9DD8F7" strokeWidth="0.8" opacity="0.35" />
            {/* Iceberg crack on hull */}
            <path d="M240 110 L250 95 L258 105 L264 90" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M258 105 L270 115" stroke="#DC2626" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
          </svg>
        </div>

        {/* Massive iceberg — right, threatening */}
        <div
          className="absolute animate-float pointer-events-none"
          style={{ bottom: '0%', right: '2%', animationDelay: '1.8s' }}
          aria-hidden
        >
          <svg width="130" height="200" viewBox="0 0 130 200" fill="none">
            <polygon points="65,0 130,110 0,110" fill="#9DD8F7" opacity="0.9" />
            <polygon points="65,0 130,110 0,110" fill="white" opacity="0.18" />
            {/* internal crevasses */}
            <line x1="65" y1="10" x2="75" y2="60" stroke="white" strokeWidth="1" opacity="0.3" />
            <line x1="55" y1="30" x2="45" y2="80" stroke="white" strokeWidth="0.8" opacity="0.2" />
            <polygon points="10,110 120,110 128,200 2,200" fill="#0B3558" opacity="0.95" />
          </svg>
        </div>
      </div>

      {/* ── Wave layer ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '28%' }} aria-hidden>
        {/* Back wave — darker */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-wave flex h-full" style={{ width: '200%' }}>
            <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full" style={{ width: '50%' }}>
              <path d="M0 40 Q100 15 200 40 Q300 65 400 40 Q500 15 600 40 Q700 65 800 40 L800 100 L0 100 Z" fill="#061826" opacity="0.6" />
            </svg>
            <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full" style={{ width: '50%' }}>
              <path d="M0 40 Q100 15 200 40 Q300 65 400 40 Q500 15 600 40 Q700 65 800 40 L800 100 L0 100 Z" fill="#061826" opacity="0.6" />
            </svg>
          </div>
        </div>
        {/* Front wave */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-wave flex h-full" style={{ width: '200%', animationDuration: '6s', animationDelay: '-2s' }}>
            <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full" style={{ width: '50%' }}>
              <path d="M0 50 Q100 28 200 50 Q300 72 400 50 Q500 28 600 50 Q700 72 800 50 L800 100 L0 100 Z" fill="#0B3558" opacity="0.85" />
            </svg>
            <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full" style={{ width: '50%' }}>
              <path d="M0 50 Q100 28 200 50 Q300 72 400 50 Q500 28 600 50 Q700 72 800 50 L800 100 L0 100 Z" fill="#0B3558" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Crew Access panel — docked to bottom ── */}
      <div
        className="relative z-20 w-full"
        style={{
          background: 'rgba(6,24,38,0.82)',
          backdropFilter: 'blur(18px)',
          borderTop: '1px solid rgba(157,216,247,0.18)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 py-5">
          <form onSubmit={handleLogin}>
            {/* Desktop: horizontal row — Mobile: stacked */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Label */}
              <div className="sm:flex-shrink-0">
                <p className="text-base font-bold tracking-wide" style={{ color: '#F2FBFF' }}>Crew Access</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(157,216,247,0.65)' }}>Board the ship to begin</p>
              </div>

              {/* Name input */}
              <div className="flex flex-col gap-1 sm:flex-1">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="username"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Dawoud"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                  style={{
                    background: 'rgba(11,53,88,0.6)',
                    border: '1px solid rgba(157,216,247,0.25)',
                    color: '#F2FBFF',
                    caretColor: '#9DD8F7',
                  }}
                />
              </div>

              {/* Password input */}
              <div className="flex flex-col gap-1 sm:flex-1">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                  style={{
                    background: 'rgba(11,53,88,0.6)',
                    border: '1px solid rgba(157,216,247,0.25)',
                    color: '#F2FBFF',
                    caretColor: '#9DD8F7',
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="sm:flex-shrink-0 rounded-lg px-8 py-3 font-bold text-sm tracking-wide transition-opacity disabled:opacity-50 hover:opacity-85"
                style={{ background: '#9DD8F7', color: '#061826', minHeight: '48px' }}
              >
                {loading ? 'Boarding…' : 'Board →'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Icy Error Modal ── */}
      {error && <IcyErrorModal message={error} onDismiss={() => setError('')} />}
    </main>
  )
}

// Pre-computed star positions (stable across renders)
const STARS = [
  { w: '2px', top: '4%', left: '8%', op: 0.7 },
  { w: '1px', top: '7%', left: '22%', op: 0.5 },
  { w: '2px', top: '3%', left: '38%', op: 0.8 },
  { w: '1px', top: '10%', left: '55%', op: 0.45 },
  { w: '2px', top: '5%', left: '72%', op: 0.65 },
  { w: '1px', top: '2%', left: '88%', op: 0.55 },
  { w: '1px', top: '12%', left: '14%', op: 0.4 },
  { w: '2px', top: '15%', left: '31%', op: 0.75 },
  { w: '1px', top: '9%', left: '48%', op: 0.5 },
  { w: '2px', top: '18%', left: '65%', op: 0.6 },
  { w: '1px', top: '6%', left: '79%', op: 0.4 },
  { w: '1px', top: '20%', left: '92%', op: 0.55 },
  { w: '2px', top: '22%', left: '5%', op: 0.7 },
  { w: '1px', top: '25%', left: '18%', op: 0.35 },
  { w: '2px', top: '14%', left: '42%', op: 0.8 },
  { w: '1px', top: '28%', left: '60%', op: 0.45 },
  { w: '2px', top: '16%', left: '85%', op: 0.65 },
  { w: '1px', top: '30%', left: '28%', op: 0.3 },
  { w: '1px', top: '8%', left: '95%', op: 0.5 },
  { w: '2px', top: '32%', left: '73%', op: 0.4 },
  { w: '1px', top: '24%', left: '50%', op: 0.55 },
  { w: '1px', top: '11%', left: '3%', op: 0.6 },
  { w: '2px', top: '19%', left: '35%', op: 0.5 },
  { w: '1px', top: '27%', left: '82%', op: 0.45 },
  { w: '1px', top: '35%', left: '10%', op: 0.3 },
  { w: '2px', top: '1%', left: '63%', op: 0.7 },
  { w: '1px', top: '13%', left: '77%', op: 0.5 },
  { w: '1px', top: '33%', left: '45%', op: 0.35 },
  { w: '2px', top: '21%', left: '20%', op: 0.6 },
  { w: '1px', top: '17%', left: '90%', op: 0.4 },
]
