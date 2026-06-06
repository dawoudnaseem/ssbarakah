'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

export default function ConditionalNav() {
  const pathname = usePathname()
  if (pathname === '/login') return null
  return (
    <>
      <NavBar />
      {/* Spacer to offset the fixed nav bar (h-14 = 56px) */}
      <div className="h-14" aria-hidden />
    </>
  )
}
