'use client'

import { useState } from 'react'
import type { PresetTask } from '@/types/database'

// ─── Shared helpers (also used by teammate dashboard) ────────────────────────

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9DD8F7' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer gap-3">
      <span className="text-sm" style={{ color: 'rgba(242,251,255,0.75)' }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-colors"
        style={{ background: checked ? '#9DD8F7' : 'rgba(157,216,247,0.2)', minWidth: '40px', minHeight: '24px' }}
      >
        <span
          className="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
          style={{ background: '#061826', transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  )
}

export const inputStyle: React.CSSProperties = {
  background: 'rgba(6,24,38,0.7)',
  border: '1px solid rgba(157,216,247,0.25)',
  color: '#F2FBFF',
  caretColor: '#9DD8F7',
}

// ─── PresetRow ────────────────────────────────────────────────────────────────

export function PresetRow({ preset, onAdd }: { preset: PresetTask; onAdd: (p: PresetTask) => void }) {
  return (
    <li
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{ background: 'rgba(6,24,38,0.5)', border: '1px solid rgba(157,216,247,0.1)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#F2FBFF' }}>{preset.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: '#9DD8F7' }}>{preset.default_points} pts</span>
          {preset.is_repeatable && (
            <span className="text-xs" style={{ color: 'rgba(242,251,255,0.4)' }}>
              repeatable ×{preset.default_max_completions}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onAdd(preset)}
        className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold"
        style={{ background: '#9DD8F7', color: '#061826', minHeight: '44px' }}
      >
        Add
      </button>
    </li>
  )
}

// ─── PresetTaskSelector (modal panel) ────────────────────────────────────────

interface PresetTaskSelectorProps {
  presets: PresetTask[]
  onAdd: (preset: PresetTask, recurring: boolean) => void
  onClose: () => void
}

export function PresetTaskSelector({ presets, onAdd, onClose }: PresetTaskSelectorProps) {
  const [recurring, setRecurring] = useState(false)
  const islamic = presets.filter(p => p.is_islamic)
  const regular = presets.filter(p => !p.is_islamic)

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ background: 'rgba(11,53,88,0.85)', border: '1px solid rgba(157,216,247,0.2)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: '#9DD8F7' }}>Select Preset Task</p>
        <button onClick={onClose} className="text-xs" style={{ color: 'rgba(242,251,255,0.5)' }}>✕ Close</button>
      </div>

      <Toggle label="Repeat every day (recurring)" checked={recurring} onChange={setRecurring} />

      {islamic.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F59E0B' }}>Islamic Tasks</p>
          <ul className="flex flex-col gap-2">
            {islamic.map(p => (
              <PresetRow key={p.id} preset={p} onAdd={preset => onAdd(preset, recurring)} />
            ))}
          </ul>
        </div>
      )}

      {regular.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9DD8F7' }}>Regular Tasks</p>
          <ul className="flex flex-col gap-2">
            {regular.map(p => (
              <PresetRow key={p.id} preset={p} onAdd={preset => onAdd(preset, recurring)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
