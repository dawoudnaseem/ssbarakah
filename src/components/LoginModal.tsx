'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginTeammate } from '@/lib/auth'
import IcyModal from './IcyModal'
import IcyErrorModal from './IcyErrorModal'

interface LoginModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
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
    onSuccess()
    router.push(`/teammate/${teammate.id}`)
  }

  return (
    <>
      <IcyModal onClose={onClose}>
        <div className="relative flex flex-col gap-5 px-8 pb-8">
          {/* Ship icon + title */}
          <div className="flex flex-col items-center gap-1">
            <svg width="60" height="32" viewBox="0 0 160 80" fill="none" aria-hidden="true">
              <path d="M20 50 L140 50 L125 70 L35 70 Z" fill="#061826" stroke="#9DD8F7" strokeWidth="1.5" />
              <rect x="35" y="35" width="90" height="15" fill="#0B3558" stroke="#9DD8F7" strokeWidth="1" />
              <rect x="55" y="18" width="45" height="17" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
              <line x1="80" y1="5" x2="80" y2="35" stroke="#9DD8F7" strokeWidth="2" />
              <polygon points="80,5 95,11 80,17" fill="#F59E0B" />
              <rect x="62" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
              <rect x="75" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
              <rect x="88" y="22" width="8" height="6" rx="1" fill="#9DD8F7" opacity="0.6" />
            </svg>
            <h2 className="text-xl font-bold tracking-wide" style={{ color: '#F2FBFF' }}>S.S. Barakah</h2>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="modal-name" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
                Name
              </label>
              <input
                id="modal-name"
                type="text"
                autoComplete="username"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dawoud"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                style={{
                  background: 'rgba(6,24,38,0.7)',
                  border: '1px solid rgba(157,216,247,0.25)',
                  color: '#F2FBFF',
                  caretColor: '#9DD8F7',
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="modal-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
                Password
              </label>
              <input
                id="modal-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                style={{
                  background: 'rgba(6,24,38,0.7)',
                  border: '1px solid rgba(157,216,247,0.25)',
                  color: '#F2FBFF',
                  caretColor: '#9DD8F7',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-bold text-sm tracking-wide transition-opacity disabled:opacity-50 hover:opacity-85"
              style={{ background: '#9DD8F7', color: '#061826', minHeight: '48px' }}
            >
              {loading ? 'Boarding…' : 'Board →'}
            </button>
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-xs opacity-50 hover:opacity-80 transition-opacity p-1"
            style={{ color: '#9DD8F7' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </IcyModal>

      {error && <IcyErrorModal message={error} onDismiss={() => setError('')} />}
    </>
  )
}
