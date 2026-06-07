'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentTeammate, logoutTeammate } from '@/lib/auth'
import type { Teammate } from '@/types/database'
import LoginModal from './LoginModal'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [teammate, setTeammate] = useState<Teammate | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTeammate(getCurrentTeammate())
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logoutTeammate()
    setTeammate(null)
    setShowDropdown(false)
    router.push('/')
  }

  function handleLoginSuccess() {
    setTeammate(getCurrentTeammate())
    setShowLoginModal(false)
  }

  const navLinks = [
    { href: '/', label: 'Ship' },
    { href: '/history', label: 'History' },
    { href: '/admin', label: 'Admin' },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14"
        style={{
          background: 'rgba(6,24,38,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(157,216,247,0.12)',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-bold tracking-wide whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ color: '#9DD8F7' }}
        >
          ⚓ S.S. Barakah
        </Link>

        {/* Center links — desktop */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-opacity hover:opacity-80"
              style={{
                color: pathname === link.href ? '#F2FBFF' : 'rgba(157,216,247,0.65)',
                borderBottom: pathname === link.href ? '1.5px solid #9DD8F7' : '1.5px solid transparent',
                paddingBottom: '2px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {teammate ? (
            /* Logged in — avatar + dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{ background: 'rgba(157,216,247,0.1)', border: '1px solid rgba(157,216,247,0.2)' }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#9DD8F7', color: '#061826' }}
                >
                  {teammate.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm hidden sm:block" style={{ color: '#F2FBFF' }}>{teammate.name}</span>
                <span className="text-xs" style={{ color: 'rgba(157,216,247,0.6)' }}>▾</span>
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 overflow-hidden"
                  style={{
                    background: 'rgba(14,55,90,0.96)',
                    backdropFilter: 'blur(24px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                    border: '1px solid rgba(157,216,247,0.30)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(157,216,247,0.15)',
                    zIndex: 56,
                  }}
                >
                  <Link
                    href={`/teammate/${teammate.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: '#F2FBFF' }}
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: '#fca5a5' }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out — Board Ship button */
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
              style={{ background: '#9DD8F7', color: '#061826', minHeight: '36px' }}
            >
              Board Ship →
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden ml-1 p-2 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: '#9DD8F7' }}
            onClick={() => setShowDrawer(v => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {showDrawer && (
        <div
          className="fixed inset-0 sm:hidden"
          style={{ zIndex: 50 }}
          onClick={() => setShowDrawer(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 flex flex-col py-2"
            style={{
              background: 'rgba(14,55,90,0.82)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              borderBottom: '1px solid rgba(157,216,247,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(157,216,247,0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowDrawer(false)}
                className="px-6 py-4 text-sm transition-colors hover:bg-white/5"
                style={{
                  color: pathname === link.href ? '#F2FBFF' : 'rgba(157,216,247,0.7)',
                  borderLeft: pathname === link.href ? '2px solid #9DD8F7' : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  )
}
