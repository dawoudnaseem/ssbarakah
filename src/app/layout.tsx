import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import ConditionalNav from '@/components/ConditionalNav'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'S.S. Barakah',
  description: 'Complete your tasks. Save the ship. Earn the barakah.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.className} h-full`}>
      <body className="min-h-full flex flex-col">
        <ConditionalNav />
        {children}
      </body>
    </html>
  )
}
