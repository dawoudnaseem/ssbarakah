'use client'

import { useState } from 'react'
import IcyModal from '@/components/IcyModal'
import IcyErrorModal from '@/components/IcyErrorModal'
import { finalizeDay } from '@/lib/finalization'
import { todayString } from '@/lib/dateUtils'

export default function FinalizeSection() {
  const [confirming, setConfirming] = useState(false)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFinalize() {
    setConfirming(false)
    setRunning(true)
    try {
      await finalizeDay(todayString())
      setDone(true)
    } catch (err) {
      console.error(err)
      setError('Finalization failed. Check console.')
    } finally {
      setRunning(false)
    }
  }

  if (done) {
    return (
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#F2FBFF' }}>End Today&apos;s Voyage</h2>
        <div className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <p className="font-semibold" style={{ color: '#22C55E' }}>
            Today&apos;s voyage has ended. Results locked, badges assigned.
          </p>
          <button
            onClick={() => setDone(false)}
            className="self-start px-4 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
            Reset
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#F2FBFF' }}>End Today&apos;s Voyage</h2>

      <div className="rounded-xl p-5 flex flex-col gap-4"
        style={{ background: 'rgba(157,216,247,0.04)', border: '1px solid rgba(157,216,247,0.1)' }}>
        <p className="text-sm" style={{ color: 'rgba(157,216,247,0.7)' }}>
          Manually end today&apos;s voyage. Locks results, assigns Chad/Chud badges, and seeds tomorrow&apos;s recurring tasks.
        </p>
        <button
          onClick={() => setConfirming(true)}
          disabled={running}
          className="self-start px-6 py-3 rounded-xl font-bold text-base"
          style={{
            background: running ? 'rgba(220,38,38,0.5)' : '#DC2626',
            color: '#fff',
            cursor: running ? 'not-allowed' : 'pointer',
          }}>
          {running ? 'Running…' : '⚡ End Today\'s Voyage'}
        </button>
      </div>

      {confirming && (
        <IcyModal onClose={() => setConfirming(false)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: '#F2FBFF' }}>End Today&apos;s Voyage?</p>
            <p className="text-sm" style={{ color: 'rgba(157,216,247,0.6)' }}>
              This will lock today&apos;s results and assign badges. Cannot be undone for today. Proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button
                onClick={handleFinalize}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: '#DC2626', color: '#fff' }}>
                Confirm
              </button>
            </div>
          </div>
        </IcyModal>
      )}

      {error && <IcyErrorModal message={error} onDismiss={() => setError(null)} />}
    </div>
  )
}
