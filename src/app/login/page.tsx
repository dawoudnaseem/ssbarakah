'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginTeammate } from '@/lib/auth'

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
      setError('Invalid name or password. Try again.')
      return
    }
    router.push(`/teammate/${teammate.id}`)
  }

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(180deg, #061826 0%, #0B3558 100%)' }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 60 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Iceberg — left side */}
      <div className="absolute bottom-24 left-4 sm:left-12 animate-float pointer-events-none" aria-hidden>
        <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
          <polygon points="45,0 90,70 0,70" fill="#9DD8F7" opacity="0.85" />
          <polygon points="45,0 90,70 0,70" fill="white" opacity="0.15" />
          <polygon points="20,70 70,70 80,110 10,110" fill="#0B3558" opacity="0.9" />
        </svg>
      </div>

      {/* Iceberg — right side (smaller) */}
      <div className="absolute bottom-28 right-6 sm:right-16 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} aria-hidden>
        <svg width="55" height="70" viewBox="0 0 55 70" fill="none">
          <polygon points="27,0 55,45 0,45" fill="#9DD8F7" opacity="0.7" />
          <polygon points="10,45 45,45 50,70 5,70" fill="#0B3558" opacity="0.9" />
        </svg>
      </div>

      {/* Ship silhouette */}
      <div className="animate-bob mb-6 pointer-events-none" aria-hidden>
        <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
          {/* Hull */}
          <path d="M20 50 L140 50 L125 70 L35 70 Z" fill="#061826" stroke="#9DD8F7" strokeWidth="1.5" />
          {/* Deck */}
          <rect x="35" y="35" width="90" height="15" fill="#0B3558" stroke="#9DD8F7" strokeWidth="1" />
          {/* Cabin */}
          <rect x="55" y="18" width="45" height="17" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
          {/* Mast */}
          <line x1="80" y1="5" x2="80" y2="35" stroke="#9DD8F7" strokeWidth="2" />
          {/* Flag */}
          <polygon points="80,5 95,11 80,17" fill="#F59E0B" />
          {/* Windows */}
          <rect x="62" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
          <rect x="75" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
          <rect x="88" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
          {/* Crack / iceberg damage */}
          <path d="M110 50 L115 42 L120 50" stroke="#DC2626" strokeWidth="1.5" fill="none" opacity="0.8" />
        </svg>
      </div>

      {/* Login card */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{
          background: 'rgba(11, 53, 88, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(157, 216, 247, 0.2)',
        }}
      >
        <h1
          className="text-3xl font-bold text-center mb-1 tracking-wide"
          style={{ color: '#F2FBFF' }}
        >
          S.S. Barakah
        </h1>
        <p className="text-center text-sm mb-6" style={{ color: '#9DD8F7' }}>
          Complete your tasks. Save the ship. Earn the barakah.
        </p>

        <p className="text-xs text-center mb-6 leading-relaxed" style={{ color: 'rgba(242,251,255,0.55)' }}>
          The ship has struck an iceberg. Every task you complete is a repair.
          Log in to begin today&apos;s mission.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
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
              className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2"
              style={{
                background: 'rgba(6, 24, 38, 0.7)',
                border: '1px solid rgba(157, 216, 247, 0.25)',
                color: '#F2FBFF',
                caretColor: '#9DD8F7',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
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
              className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2"
              style={{
                background: 'rgba(6, 24, 38, 0.7)',
                border: '1px solid rgba(157, 216, 247, 0.25)',
                color: '#F2FBFF',
                caretColor: '#9DD8F7',
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-center rounded-lg py-2 px-3" style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg py-3 font-bold text-sm tracking-wide transition-opacity disabled:opacity-50"
            style={{ background: '#9DD8F7', color: '#061826' }}
          >
            {loading ? 'Boarding...' : 'Board the Ship →'}
          </button>
        </form>
      </div>

      {/* Ocean / wave bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden pointer-events-none" aria-hidden>
        <div className="animate-wave flex" style={{ width: '200%' }}>
          <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="h-20" style={{ width: '50%' }}>
            <path d="M0 30 Q100 10 200 30 Q300 50 400 30 Q500 10 600 30 Q700 50 800 30 L800 60 L0 60 Z" fill="#0B3558" opacity="0.8" />
          </svg>
          <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="h-20" style={{ width: '50%' }}>
            <path d="M0 30 Q100 10 200 30 Q300 50 400 30 Q500 10 600 30 Q700 50 800 30 L800 60 L0 60 Z" fill="#0B3558" opacity="0.8" />
          </svg>
        </div>
      </div>
    </main>
  )
}
