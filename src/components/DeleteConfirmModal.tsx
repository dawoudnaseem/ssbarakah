'use client'

import IcyModal from './IcyModal'
import type { DailyTask } from '@/types/database'

interface DeleteConfirmModalProps {
  task: DailyTask
  isRecurring: boolean
  onCancel: () => void
  onDeleteToday: () => void
  onDeleteForever: () => void
}

export default function DeleteConfirmModal({
  task,
  isRecurring,
  onCancel,
  onDeleteToday,
  onDeleteForever,
}: DeleteConfirmModalProps) {
  return (
    <IcyModal onClose={onCancel} accentColor="#DC2626">
      <div className="flex flex-col gap-5 px-6 pb-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)' }}
          >
            🔧
          </div>
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: '#F2FBFF' }}>
            &ldquo;{task.name}&rdquo;
          </p>
          <p className="text-sm" style={{ color: 'rgba(242,251,255,0.7)' }}>
            Remove this repair from today&apos;s log?
          </p>
          {isRecurring && (
            <p className="text-xs" style={{ color: 'rgba(242,251,255,0.5)' }}>
              This task repeats daily. Remove just today, or stop it forever?
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {isRecurring ? (
            <>
              <button
                onClick={onDeleteToday}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', minHeight: '44px' }}
              >
                Remove today only
              </button>
              <button
                onClick={onDeleteForever}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(220,38,38,0.35)', border: '1px solid rgba(220,38,38,0.6)', color: '#fca5a5', minHeight: '44px' }}
              >
                Remove forever
              </button>
            </>
          ) : (
            <button
              onClick={onDeleteToday}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(220,38,38,0.5)', color: '#fca5a5', minHeight: '44px' }}
            >
              Remove
            </button>
          )}

          <button
            onClick={onCancel}
            className="w-full rounded-lg py-2.5 text-sm transition-opacity hover:opacity-80"
            style={{ background: 'rgba(157,216,247,0.08)', border: '1px solid rgba(157,216,247,0.2)', color: 'rgba(242,251,255,0.6)', minHeight: '44px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </IcyModal>
  )
}
