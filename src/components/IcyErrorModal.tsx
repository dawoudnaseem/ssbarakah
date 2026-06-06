'use client'

interface IcyErrorModalProps {
  message: string
  onDismiss: () => void
}

export default function IcyErrorModal({ message, onDismiss }: IcyErrorModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,24,38,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{
          background: 'rgba(11,53,88,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(220,38,38,0.5)',
          boxShadow: '0 0 32px rgba(220,38,38,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
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
          style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
