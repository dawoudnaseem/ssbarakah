'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { changeTeammatePassword } from '@/lib/auth'
import IcyModal from '@/components/IcyModal'
import type { Teammate } from '@/types/database'

const inputStyle: React.CSSProperties = {
  background: 'rgba(6,24,38,0.7)',
  border: '1px solid rgba(157,216,247,0.25)',
  borderRadius: '8px',
  color: '#F2FBFF',
  padding: '7px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

export default function CrewSection() {
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [loading, setLoading]         = useState(true)
  const [editName, setEditName]       = useState<Record<string, string>>({})
  const [editPw, setEditPw]           = useState<Record<string, string>>({})
  const [saving, setSaving]           = useState<Record<string, boolean>>({})
  const [toDelete, setToDelete]       = useState<Teammate | null>(null)
  const [newName, setNewName]         = useState('')
  const [newPw, setNewPw]             = useState('')
  const [adding, setAdding]           = useState(false)

  async function fetchTeammates() {
    setLoading(true)
    const { data } = await supabase.from('teammates').select('*').order('name')
    setTeammates((data ?? []) as Teammate[])
    setLoading(false)
  }

  useEffect(() => { fetchTeammates() }, [])

  async function saveRow(tm: Teammate) {
    if (saving[tm.id]) return
    setSaving(s => ({ ...s, [tm.id]: true }))
    try {
      const name = editName[tm.id] ?? tm.name
      if (name !== tm.name) {
        await supabase.from('teammates').update({ name, updated_at: new Date().toISOString() }).eq('id', tm.id)
      }
      const pw = editPw[tm.id]
      if (pw) {
        await changeTeammatePassword(tm.id, pw)
      }
      setEditName(e => { const n = { ...e }; delete n[tm.id]; return n })
      setEditPw(e => { const n = { ...e }; delete n[tm.id]; return n })
      fetchTeammates()
    } finally {
      setSaving(s => ({ ...s, [tm.id]: false }))
    }
  }

  async function toggleActive(tm: Teammate) {
    await supabase.from('teammates').update({ is_active: !tm.is_active, updated_at: new Date().toISOString() }).eq('id', tm.id)
    fetchTeammates()
  }

  async function confirmDelete() {
    if (!toDelete) return
    await supabase.from('teammates').delete().eq('id', toDelete.id)
    setToDelete(null)
    fetchTeammates()
  }

  async function addTeammate() {
    if (!newName.trim() || !newPw.trim()) return
    setAdding(true)
    await supabase.from('teammates').insert({
      name: newName.trim(),
      plain_password: newPw.trim(),
      is_active: true,
      current_chad: false,
      current_chud: false,
    })
    setNewName('')
    setNewPw('')
    setAdding(false)
    fetchTeammates()
  }

  const isDirty = (id: string) => id in editName || id in editPw

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#F2FBFF' }}>Crew</h2>

      {loading ? (
        <p className="mb-6" style={{ color: '#9DD8F7' }}>Loading…</p>
      ) : teammates.length === 0 ? (
        <p className="mb-6" style={{ color: 'rgba(157,216,247,0.45)', fontSize: 13 }}>No crew members yet.</p>
      ) : (
      <div className="flex flex-col gap-3 mb-6">
        {teammates.map(tm => (
          <div key={tm.id} className="rounded-xl p-4 flex flex-wrap items-center gap-3"
            style={{ background: 'rgba(157,216,247,0.04)', border: '1px solid rgba(157,216,247,0.1)' }}>

            <input style={{ ...inputStyle, width: '140px', opacity: tm.is_active ? 1 : 0.45 }}
              value={editName[tm.id] ?? tm.name}
              onChange={e => setEditName(n => ({ ...n, [tm.id]: e.target.value }))}
            />

            <input style={{ ...inputStyle, width: '130px' }}
              type="password"
              placeholder="New password"
              value={editPw[tm.id] ?? ''}
              onChange={e => setEditPw(p => ({ ...p, [tm.id]: e.target.value }))}
            />

            <button onClick={() => toggleActive(tm)}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: tm.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.12)',
                color:      tm.is_active ? '#22C55E' : '#DC2626',
                border:     `1px solid ${tm.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
              }}>
              {tm.is_active ? 'Active' : 'Inactive'}
            </button>

            {isDirty(tm.id) && (
              <button onClick={() => saveRow(tm)} disabled={saving[tm.id]}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: '#9DD8F7', color: '#061826' }}>
                {saving[tm.id] ? 'Saving…' : 'Save'}
              </button>
            )}

            <button onClick={() => setToDelete(tm)}
              className="ml-auto px-3 py-1 rounded-lg text-xs"
              style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' }}>
              Remove
            </button>
          </div>
        ))}
      </div>
      )}

      <div className="rounded-xl p-4 flex flex-wrap items-center gap-3"
        style={{ border: '1px dashed rgba(157,216,247,0.2)' }}>
        <span className="text-sm font-semibold" style={{ color: 'rgba(157,216,247,0.6)' }}>Add Teammate</span>
        <input style={{ ...inputStyle, width: '140px' }} placeholder="Name"
          value={newName} onChange={e => setNewName(e.target.value)} />
        <input style={{ ...inputStyle, width: '130px' }} type="password" placeholder="Password"
          value={newPw} onChange={e => setNewPw(e.target.value)} />
        <button onClick={addTeammate} disabled={adding || !newName.trim() || !newPw.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: '#9DD8F7', color: '#061826', opacity: (!newName.trim() || !newPw.trim()) ? 0.5 : 1 }}>
          {adding ? 'Adding…' : 'Add →'}
        </button>
      </div>

      {toDelete && (
        <IcyModal onClose={() => setToDelete(null)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: '#F2FBFF' }}>Remove {toDelete.name}?</p>
            <p className="text-sm" style={{ color: 'rgba(157,216,247,0.6)' }}>
              This will permanently delete the teammate and all their data.
            </p>
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
