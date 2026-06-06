'use client'

import IcyModal from './IcyModal'

interface IcyErrorModalProps {
  message: string
  onDismiss: () => void
}

export default function IcyErrorModal({ message, onDismiss }: IcyErrorModalProps) {
  return (
    <IcyModal onClose={onDismiss} accentColor="#DC2626">
      <div className="flex flex-col items-center gap-4 px-6 pb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)' }}
        >
          ❄️
        </div>
        <p className="text-sm text-center leading-relaxed" style={{ color: '#fca5a5' }}>
          {message}
        </p>
        <button
          onClick={onDismiss}
          className="mt-1 px-6 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', minHeight: '44px' }}
        >
          Dismiss
        </button>
      </div>
    </IcyModal>
  )
}
