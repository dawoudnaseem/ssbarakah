'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentTeammate } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const teammate = getCurrentTeammate()
    if (teammate) {
      router.replace(`/teammate/${teammate.id}`)
    } else {
      router.replace('/login')
    }
  }, [router])

  return null
}
