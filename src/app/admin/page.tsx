'use client'

import { useState, useEffect } from 'react'
import { validateAdminCode, setAdminSession, isAdminAuthenticated, clearAdminSession } from '@/lib/auth'
import IcyErrorModal from '@/components/IcyErrorModal'
import AdminSidebar from '@/components/admin/AdminSidebar'
import StatusSection from '@/components/admin/StatusSection'

type AdminSection = 'status' | 'crew' | 'missions' | 'finalize'

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
]

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [section, setSection] = useState<AdminSection>('status')

  useEffect(() => {
    if (isAdminAuthenticated()) setAuthenticated(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validateAdminCode(code)) {
      setAdminSession()
      setAuthenticated(true)
    } else {
      setCode('')
      setError(true)
    }
  }

  function handleLogout() {
    clearAdminSession()
    setAuthenticated(false)
    setSection('status')
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #061826 0%, #0B3558 60%, #0d4a6e 100%)' }}>

        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ width: s.w, height: s.w, top: s.top, left: s.left, background: '#fff', opacity: s.op }} />
        ))}

        {/* Small iceberg left */}
        <div className="absolute animate-float" style={{ bottom: '18%', left: '6%', opacity: 0.45 }}>
          <svg width="80" height="70" viewBox="0 0 80 70" aria-hidden="true">
            <polygon points="40,0 75,70 5,70" fill="#9DD8F7" opacity="0.25" />
            <polygon points="40,10 65,70 15,70" fill="#C8ECFF" opacity="0.15" />
          </svg>
        </div>

        {/* Large iceberg right */}
        <div className="absolute animate-float" style={{ bottom: '12%', right: '5%', opacity: 0.5, animationDelay: '1.8s' }}>
          <svg width="130" height="110" viewBox="0 0 130 110" aria-hidden="true">
            <polygon points="65,0 125,110 5,110" fill="#9DD8F7" opacity="0.25" />
            <polygon points="65,12 110,110 20,110" fill="#C8ECFF" opacity="0.15" />
          </svg>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '60px', overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" width="100%" height="60">
            <path d="M0,30 C240,10 480,50 720,25 C960,0 1200,45 1440,25 L1440,60 L0,60 Z"
              fill="rgba(11,53,88,0.85)" />
          </svg>
        </div>

        {/* Faint ship silhouette */}
        <div className="absolute" style={{ bottom: '26%', left: '50%', transform: 'translateX(-50%)', opacity: 0.12 }}>
          <svg width="160" height="80" viewBox="0 0 340 170" aria-hidden="true">
            <rect x="60" y="90" width="220" height="50" rx="6" fill="#9DD8F7" />
            <polygon points="160,20 170,90 150,90" fill="#9DD8F7" />
            <rect x="155" y="22" width="3" height="68" fill="#9DD8F7" />
            <rect x="60" y="138" width="220" height="8" rx="3" fill="#7bc4e8" />
            <rect x="100" y="90" width="140" height="30" rx="4" fill="rgba(157,216,247,0.3)" />
          </svg>
        </div>

        {/* Gate card */}
        <form onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-sm mx-4 rounded-2xl px-8 py-10 flex flex-col items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(157,216,247,0.12), rgba(6,24,38,0.88))',
            border: '1px solid rgba(157,216,247,0.3)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
          }}>
          <p className="text-xl font-bold" style={{ color: '#F2FBFF' }}>⚓ Admiral&apos;s Deck</p>
          <p className="text-xs text-center" style={{ color: 'rgba(157,216,247,0.5)' }}>
            Restricted — crew code required
          </p>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter admin code"
            autoFocus
            className="w-full rounded-lg px-4 py-3 text-center text-base tracking-widest outline-none"
            style={{
              background: 'rgba(6,24,38,0.7)',
              border: '1px solid rgba(157,216,247,0.3)',
              color: '#9DD8F7',
            }}
          />
          <button type="submit"
            className="w-full rounded-lg py-3 font-bold text-sm"
            style={{ background: '#9DD8F7', color: '#061826' }}>
            Board →
          </button>
          <p className="text-xs" style={{ color: 'rgba(157,216,247,0.3)' }}>
            Session ends when you close this tab
          </p>
        </form>

        {error && <IcyErrorModal message="Invalid admin code." onDismiss={() => setError(false)} />}
      </main>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#061826', paddingTop: '56px' }}>
      <AdminSidebar active={section} onSelect={setSection} onLogout={handleLogout} />
      <main className="flex-1 p-6 overflow-y-auto" style={{ marginLeft: '192px' }}>
        {section === 'status' && <StatusSection />}
        {section === 'crew'     && <div style={{ color: '#9DD8F7' }}>Crew — coming in Task 6</div>}
        {section === 'missions' && <div style={{ color: '#9DD8F7' }}>Missions — coming in Task 7</div>}
        {section === 'finalize' && <div style={{ color: '#9DD8F7' }}>Finalize — coming in Task 8</div>}
      </main>
    </div>
  )
}
