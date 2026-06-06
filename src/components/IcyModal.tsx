'use client'

interface IcyModalProps {
  onClose: () => void
  children: React.ReactNode
  accentColor?: string
  maxWidth?: string
}

// 8 icicles: [x-offset-%, width, height] — all values in SVG user units (viewBox width = 400)
const ICICLES: [number, number, number][] = [
  [18,  14, 38],
  [60,  10, 26],
  [98,  16, 44],
  [142, 11, 30],
  [182, 15, 42],
  [228, 10, 22],
  [268, 16, 46],
  [318, 12, 34],
]

export default function IcyModal({ onClose, children, maxWidth = 'max-w-sm' }: IcyModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,24,38,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden`}
        style={{
          background: 'linear-gradient(160deg, rgba(200,230,255,0.18) 0%, rgba(11,53,88,0.75) 100%)',
          border: '1px solid rgba(200,235,255,0.35)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(157,216,247,0.08), inset 0 1px 0 rgba(255,255,255,0.25)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icicles along top inner edge */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
          <svg
            viewBox="0 0 400 50"
            preserveAspectRatio="none"
            width="100%"
            height="52px"
            aria-hidden
          >
            {ICICLES.map(([x, w, h], i) => (
              <g key={i}>
                {/* Main icicle body */}
                <polygon
                  points={`${x},0 ${x + w},0 ${x + w / 2},${h}`}
                  fill="rgba(200,235,255,0.55)"
                />
                {/* Highlight line down left edge */}
                <line
                  x1={x + 2} y1={0}
                  x2={x + w / 2 - 1} y2={h - 4}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Content area — padded to clear icicles */}
        <div className="relative" style={{ zIndex: 2, paddingTop: '60px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
