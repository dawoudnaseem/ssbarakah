'use client'

// Worker colours — one per teammate slot (no faces; Islamic values)
const WORKER_COLORS = ['#9DD8F7', '#22C55E', '#F59E0B', '#A78BFA']

// Worker positions as % of container width/height (deck area of ship)
const WORKER_POSITIONS = [
  { left: '38%', top: '54%' },
  { left: '46%', top: '50%' },
  { left: '54%', top: '54%' },
  { left: '62%', top: '50%' },
]

interface ShipSceneProps {
  progress: number  // 0–100
  isSunk: boolean
}

export function ShipScene({ progress, isSunk }: ShipSceneProps) {
  const tilt = isSunk ? -30 : -(15 - (progress / 100) * 15)

  let workerClass = 'animate-panic'
  if (progress === 100) workerClass = 'animate-celebrate'
  else if (progress >= 75) workerClass = 'animate-calm-worker'

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: '260px', background: 'linear-gradient(180deg, #061826 0%, #0B3558 60%, #0d4a7a 100%)' }}>

      {/* Stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: 'white', opacity: s.opacity }}
        />
      ))}

      {/* Iceberg — right side, static threat */}
      <div className="absolute animate-float" style={{ right: '4%', bottom: '28%', animationDelay: '1s' }}>
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
          <polygon points="40,0 75,60 65,65 55,55 45,65 35,55 20,65 10,60" fill="#C8EAF8" opacity="0.9" />
          <polygon points="20,65 10,60 5,100 75,100 75,60 65,65" fill="#9DD8F7" opacity="0.7" />
        </svg>
      </div>

      {/* Ocean waves */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '70px', overflow: 'hidden' }}>
        <div className="animate-wave" style={{ width: '200%', height: '100%', background: 'linear-gradient(180deg, transparent 0%, rgba(11,53,88,0.8) 40%, #061826 100%)', transform: 'translateX(0)' }} />
      </div>
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '50px', overflow: 'hidden', opacity: 0.6 }}>
        <div className="animate-wave" style={{ width: '200%', height: '100%', background: 'linear-gradient(180deg, transparent 20%, rgba(9,44,74,0.9) 100%)', animationDuration: '6s', animationDelay: '-3s' }} />
      </div>

      {/* Ship container — centered, rotates based on progress */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: '22%',
          transform: `translateX(-50%) rotate(${tilt}deg) ${isSunk ? 'translateY(60px)' : ''}`,
          transition: 'transform 1.2s ease-in-out',
          width: '180px',
        }}
      >
        {/* Ship SVG */}
        <svg width="180" height="110" viewBox="0 0 180 110" fill="none">
          {/* Hull */}
          <path d="M20 70 L160 70 L145 100 L35 100 Z" fill="#1e3a5f" stroke="#9DD8F7" strokeWidth="1.5" />
          {/* Main deck */}
          <rect x="25" y="50" width="130" height="22" fill="#162d4a" stroke="#9DD8F7" strokeWidth="1" />
          {/* Cabin */}
          <rect x="55" y="25" width="70" height="27" fill="#1a3350" stroke="#9DD8F7" strokeWidth="1" />
          {/* Mast */}
          <line x1="90" y1="5" x2="90" y2="50" stroke="#9DD8F7" strokeWidth="2" />
          {/* Yard */}
          <line x1="65" y1="15" x2="115" y2="15" stroke="#9DD8F7" strokeWidth="1.5" />
          {/* Sails */}
          <polygon points="90,15 115,15 90,48" fill="white" opacity="0.15" />
          <polygon points="90,15 65,15 90,48" fill="white" opacity="0.1" />
          {/* Portholes */}
          <circle cx="40" cy="60" r="4" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
          <circle cx="140" cy="60" r="4" fill="#061826" stroke="#9DD8F7" strokeWidth="1" />
          {/* Cabin windows */}
          <rect x="65" y="33" width="12" height="9" rx="2" fill="#061826" stroke="#9DD8F7" strokeWidth="0.8" />
          <rect x="103" y="33" width="12" height="9" rx="2" fill="#061826" stroke="#9DD8F7" strokeWidth="0.8" />
          {/* Hull crack (visible always — ship already hit the iceberg) */}
          <path d="M75 75 L80 85 L85 78 L90 90" stroke="#DC2626" strokeWidth="1.5" opacity="0.7" fill="none" />
          {/* Waterline */}
          <line x1="25" y1="70" x2="155" y2="70" stroke="#9DD8F7" strokeWidth="0.8" opacity="0.4" />
        </svg>

        {/* Workers on deck */}
        {WORKER_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className={workerClass}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: WORKER_COLORS[i],
              animationDelay: `${i * 0.15}s`,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 4px ${WORKER_COLORS[i]}60`,
            }}
          />
        ))}
      </div>

    </div>
  )
}

// 20 pre-computed star positions — no Math.random() to avoid hydration mismatch
const STARS = [
  { left: '5%',  top: '8%',  size: '2px', opacity: 0.8 },
  { left: '12%', top: '3%',  size: '1px', opacity: 0.6 },
  { left: '18%', top: '12%', size: '2px', opacity: 0.9 },
  { left: '25%', top: '5%',  size: '1px', opacity: 0.7 },
  { left: '32%', top: '9%',  size: '2px', opacity: 0.5 },
  { left: '40%', top: '2%',  size: '1px', opacity: 0.8 },
  { left: '47%', top: '7%',  size: '2px', opacity: 0.7 },
  { left: '55%', top: '4%',  size: '1px', opacity: 0.6 },
  { left: '60%', top: '11%', size: '2px', opacity: 0.9 },
  { left: '68%', top: '3%',  size: '1px', opacity: 0.5 },
  { left: '75%', top: '8%',  size: '2px', opacity: 0.8 },
  { left: '82%', top: '2%',  size: '1px', opacity: 0.7 },
  { left: '88%', top: '10%', size: '2px', opacity: 0.6 },
  { left: '93%', top: '5%',  size: '1px', opacity: 0.9 },
  { left: '9%',  top: '18%', size: '1px', opacity: 0.5 },
  { left: '22%', top: '20%', size: '2px', opacity: 0.4 },
  { left: '35%', top: '17%', size: '1px', opacity: 0.6 },
  { left: '50%', top: '19%', size: '2px', opacity: 0.5 },
  { left: '70%', top: '16%', size: '1px', opacity: 0.7 },
  { left: '85%', top: '19%', size: '2px', opacity: 0.4 },
]
