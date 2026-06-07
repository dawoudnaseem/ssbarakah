'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import IcyModal from '@/components/IcyModal'
import IcyErrorModal from '@/components/IcyErrorModal'
import type { PresetTask } from '@/types/database'

const inputStyle: React.CSSProperties = {
  background: 'rgba(6,24,38,0.7)',
  border: '1px solid rgba(157,216,247,0.25)',
  borderRadius: '8px',
  color: '#F2FBFF',
  padding: '7px 12px',
  fontSize: '13px',
  outline: 'none',
}

const EMPTY_FORM = { name: '', is_islamic: false, default_points: 10, is_repeatable: false, can_be_recurring: true }

export default function MissionsSection() {
  const [tasks, setTasks] = useState<PresetTask[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, Partial<PresetTask>>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [toDelete, setToDelete] = useState<PresetTask | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase.from('preset_tasks').select('*').order('name')
    setTasks((data ?? []) as PresetTask[])
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  function field<K extends keyof PresetTask>(id: string, key: K, fallback: PresetTask[K]): PresetTask[K] {
    return (edits[id]?.[key] ?? fallback) as PresetTask[K]
  }

  function setEdit<K extends keyof PresetTask>(id: string, key: K, val: PresetTask[K]) {
    setEdits(e => ({ ...e, [id]: { ...e[id], [key]: val } }))
  }

  async function saveRow(t: PresetTask) {
    const patch = edits[t.id]
    if (!patch || Object.keys(patch).length === 0) return
    if (saving[t.id]) return
    setSaving(s => ({ ...s, [t.id]: true }))
    try {
      await supabase.from('preset_tasks').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', t.id)
      setEdits(e => { const n = { ...e }; delete n[t.id]; return n })
      fetchTasks()
    } finally {
      setSaving(s => ({ ...s, [t.id]: false }))
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      const { error } = await supabase.from('preset_tasks').delete().eq('id', toDelete.id)
      if (error) throw error
      setToDelete(null)
      fetchTasks()
    } catch {
      setToDelete(null)
      setDeleteError('Could not remove this mission. It may be referenced by existing tasks.')
    }
  }

  async function addTask() {
    if (!form.name.trim()) return
    setAdding(true)
    try {
      await supabase.from('preset_tasks').insert({
        name: form.name.trim(),
        description: null,
        category: form.is_islamic ? 'islamic' : 'regular',
        default_points: form.default_points,
        is_islamic: form.is_islamic,
        is_repeatable: form.is_repeatable,
        default_max_completions: 1,
        can_be_recurring: form.can_be_recurring,
      })
      setForm(EMPTY_FORM)
      fetchTasks()
    } finally {
      setAdding(false)
    }
  }

  const islamic = tasks.filter(t => t.is_islamic)
  const regular = tasks.filter(t => !t.is_islamic)

  function renderRow(t: PresetTask) {
    const dirty = t.id in edits && Object.keys(edits[t.id] ?? {}).length > 0
    return (
      <div key={t.id} className="flex flex-wrap items-center gap-2 py-3 px-4"
        style={{ borderTop: '1px solid rgba(157,216,247,0.06)' }}>
        <input style={{ ...inputStyle, width: '160px' }}
          value={String(field(t.id, 'name', t.name))}
          onChange={e => setEdit(t.id, 'name', e.target.value)}
        />
        <input type="number" style={{ ...inputStyle, width: '70px' }}
          value={Number(field(t.id, 'default_points', t.default_points))}
          onChange={e => setEdit(t.id, 'default_points', Number(e.target.value))}
        />
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox"
            checked={Boolean(field(t.id, 'is_repeatable', t.is_repeatable))}
            onChange={e => setEdit(t.id, 'is_repeatable', e.target.checked)}
          /> Repeatable
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox"
            checked={Boolean(field(t.id, 'can_be_recurring', t.can_be_recurring))}
            onChange={e => setEdit(t.id, 'can_be_recurring', e.target.checked)}
          /> Recurring
        </label>
        {dirty && (
          <button onClick={() => saveRow(t)} disabled={saving[t.id]}
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#9DD8F7', color: '#061826' }}>
            {saving[t.id] ? 'Saving…' : 'Save'}
          </button>
        )}
        <button onClick={() => setToDelete(t)}
          className="ml-auto px-2 py-1 rounded text-xs"
          style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' }}>
          ✕
        </button>
      </div>
    )
  }

  if (loading) return <p style={{ color: '#9DD8F7' }}>Loading…</p>

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#F2FBFF' }}>Missions (Preset Tasks)</h2>

      {[
        ['☪️ Islamic Tasks', islamic],
        ['📋 Regular Tasks', regular],
      ].map(([label, group]) => (
        <div key={String(label)} className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
            style={{ color: 'rgba(157,216,247,0.45)' }}>{String(label)}</p>
          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(157,216,247,0.1)' }}>
            {(group as PresetTask[]).length === 0
              ? <p className="px-4 py-3 text-xs" style={{ color: 'rgba(157,216,247,0.35)' }}>None yet.</p>
              : (group as PresetTask[]).map(renderRow)
            }
          </div>
        </div>
      ))}

      {/* Add form */}
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-3 mt-4"
        style={{ border: '1px dashed rgba(157,216,247,0.2)' }}>
        <span className="text-sm font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Add Mission</span>
        <input style={{ ...inputStyle, width: '160px' }} placeholder="Name"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input type="number" style={{ ...inputStyle, width: '70px' }}
          value={form.default_points}
          onChange={e => setForm(f => ({ ...f, default_points: Number(e.target.value) }))} />
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox" checked={form.is_islamic}
            onChange={e => setForm(f => ({ ...f, is_islamic: e.target.checked }))} /> Islamic
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox" checked={form.is_repeatable}
            onChange={e => setForm(f => ({ ...f, is_repeatable: e.target.checked }))} /> Repeatable
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'rgba(157,216,247,0.7)' }}>
          <input type="checkbox" checked={form.can_be_recurring}
            onChange={e => setForm(f => ({ ...f, can_be_recurring: e.target.checked }))} /> Recurring
        </label>
        <button onClick={addTask} disabled={adding || !form.name.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: '#9DD8F7', color: '#061826', opacity: !form.name.trim() ? 0.5 : 1 }}>
          {adding ? 'Adding…' : 'Add →'}
        </button>
      </div>

      {deleteError && (
        <IcyErrorModal message={deleteError} onDismiss={() => setDeleteError(null)} />
      )}

      {toDelete && (
        <IcyModal onClose={() => setToDelete(null)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold" style={{ color: '#F2FBFF' }}>Remove &quot;{toDelete.name}&quot;?</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: '#DC2626', color: '#fff' }}>
                Remove
              </button>
            </div>
          </div>
        </IcyModal>
      )}
    </div>
  )
}
