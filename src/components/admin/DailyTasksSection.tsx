'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import IcyModal from '@/components/IcyModal'
import IcyErrorModal from '@/components/IcyErrorModal'
import { todayString } from '@/lib/dateUtils'
import type { DailyTask, Teammate } from '@/types/database'

interface EditForm {
  name: string
  points: number
  is_required: boolean
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(6,24,38,0.7)',
  border: '1px solid rgba(157,216,247,0.25)',
  color: '#F2FBFF',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
}

export default function DailyTasksSection() {
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<DailyTask | null>(null)
  const [toEdit, setToEdit] = useState<DailyTask | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ name: '', points: 10, is_required: false })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [opError, setOpError] = useState<string | null>(null)

  const today = todayString()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [r1, r2] = await Promise.all([
      supabase.from('daily_tasks').select('*').eq('task_date', today).order('created_at', { ascending: true }),
      supabase.from('teammates').select('*').eq('is_active', true).order('name'),
    ])
    if (r1.error || r2.error) {
      setFetchError(r1.error?.message ?? r2.error?.message ?? 'Fetch error')
      setLoading(false)
      return
    }
    setTasks(r1.data ?? [])
    setTeammates(r2.data ?? [])
    setLoading(false)
  }, [today])

  useEffect(() => { fetchAll() }, [fetchAll])

  function openEdit(task: DailyTask) {
    setToEdit(task)
    setEditForm({ name: task.name, points: task.points, is_required: task.is_required })
  }

  async function saveEdit() {
    if (!toEdit) return
    setSaving(true)
    const { error } = await supabase
      .from('daily_tasks')
      .update({ name: editForm.name.trim(), points: editForm.points, is_required: editForm.is_required, updated_at: new Date().toISOString() })
      .eq('id', toEdit.id)
    if (error) { setOpError(error.message); setSaving(false); return }
    setTasks(prev => prev.map(t => t.id === toEdit.id ? { ...t, ...editForm, name: editForm.name.trim() } : t))
    setSaving(false)
    setToEdit(null)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)

    await supabase.from('task_completions').delete().eq('daily_task_id', toDelete.id)

    const { error } = await supabase.from('daily_tasks').delete().eq('id', toDelete.id)
    if (error) { setOpError(error.message); setDeleting(false); setToDelete(null); return }

    // Also remove from recurring_tasks so the task doesn't re-seed tomorrow
    if (toDelete.preset_task_id) {
      await supabase
        .from('recurring_tasks')
        .delete()
        .eq('teammate_id', toDelete.teammate_id)
        .eq('preset_task_id', toDelete.preset_task_id)
    } else {
      await supabase
        .from('recurring_tasks')
        .delete()
        .eq('teammate_id', toDelete.teammate_id)
        .eq('name', toDelete.name)
    }

    setTasks(prev => prev.filter(t => t.id !== toDelete.id))
    setDeleting(false)
    setToDelete(null)
  }

  if (loading) return <p className="text-sm" style={{ color: 'rgba(157,216,247,0.5)' }}>Loading tasks…</p>
  if (fetchError) return <p className="text-sm" style={{ color: '#DC2626' }}>{fetchError}</p>

  const tasksByTeammate = teammates.map(tm => ({
    teammate: tm,
    tasks: tasks.filter(t => t.teammate_id === tm.id),
  }))

  return (
    <div>
      <h2 className="text-lg font-bold mb-1" style={{ color: '#F2FBFF' }}>Today&apos;s Tasks</h2>
      <p className="text-xs mb-5" style={{ color: 'rgba(157,216,247,0.45)' }}>
        All crew tasks for {today}. Edit or delete as needed.
      </p>

      <div className="flex flex-col gap-6">
        {tasksByTeammate.map(({ teammate, tasks: tmTasks }) => (
          <div key={teammate.id}>
            {/* Teammate header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(157,216,247,0.15)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.3)' }}>
                {(teammate.name[0] ?? '?').toUpperCase()}
              </div>
              <span className="font-semibold text-sm" style={{ color: '#F2FBFF' }}>{teammate.name}</span>
              <span className="text-xs" style={{ color: 'rgba(157,216,247,0.4)' }}>
                {tmTasks.length} task{tmTasks.length !== 1 ? 's' : ''}
              </span>
            </div>

            {tmTasks.length === 0 ? (
              <p className="text-xs ml-9" style={{ color: 'rgba(157,216,247,0.35)' }}>No tasks today.</p>
            ) : (
              <div className="flex flex-col gap-2 ml-9">
                {tmTasks.map(task => (
                  <div key={task.id} className="rounded-lg px-4 py-3 flex items-start justify-between gap-3"
                    style={{
                      background: 'rgba(157,216,247,0.04)',
                      border: '1px solid rgba(157,216,247,0.1)',
                    }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate" style={{ color: task.is_completed ? 'rgba(157,216,247,0.45)' : '#F2FBFF' }}>
                          {task.is_completed ? '✓ ' : ''}{task.name}
                        </span>
                        {task.is_required && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                            required
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(157,216,247,0.4)' }}>
                        {task.points} pts
                        {task.is_repeatable ? ` · ${task.completion_count}/${task.max_completions}×` : ''}
                        {task.category ? ` · ${task.category}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(task)}
                        className="px-2.5 py-1 rounded-lg text-xs"
                        style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                        Edit
                      </button>
                      <button
                        onClick={() => setToDelete(task)}
                        className="px-2.5 py-1 rounded-lg text-xs"
                        style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {toEdit && (
        <IcyModal onClose={() => setToEdit(null)}>
          <div className="px-6 pb-6 flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: '#F2FBFF' }}>Edit Task</p>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'rgba(157,216,247,0.6)' }}>Task name</label>
              <input
                style={inputStyle}
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: 'rgba(157,216,247,0.6)' }}>Points</label>
              <input
                type="number"
                min={1}
                style={inputStyle}
                value={editForm.points}
                onChange={e => setEditForm(f => ({ ...f, points: Number(e.target.value) }))}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setEditForm(f => ({ ...f, is_required: !f.is_required }))}
                className="w-10 h-5 rounded-full flex items-center transition-colors"
                style={{
                  background: editForm.is_required ? '#9DD8F7' : 'rgba(157,216,247,0.15)',
                  padding: '2px',
                }}>
                <div className="w-4 h-4 rounded-full transition-transform"
                  style={{
                    background: editForm.is_required ? '#061826' : 'rgba(157,216,247,0.5)',
                    transform: editForm.is_required ? 'translateX(20px)' : 'translateX(0)',
                  }} />
              </div>
              <span className="text-sm" style={{ color: 'rgba(157,216,247,0.8)' }}>Required task</span>
            </label>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setToEdit(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving || !editForm.name.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: saving ? 'rgba(157,216,247,0.3)' : '#9DD8F7', color: '#061826' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </IcyModal>
      )}

      {/* Delete confirm modal */}
      {toDelete && (
        <IcyModal onClose={() => setToDelete(null)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: '#F2FBFF' }}>Delete task?</p>
            <p className="text-sm" style={{ color: 'rgba(157,216,247,0.6)' }}>
              &ldquo;{toDelete.name}&rdquo; will be permanently removed for today, including any completions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.08)', color: '#9DD8F7', border: '1px solid rgba(157,216,247,0.2)' }}>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: deleting ? 'rgba(220,38,38,0.5)' : '#DC2626', color: '#fff' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </IcyModal>
      )}

      {opError && <IcyErrorModal message={opError} onDismiss={() => setOpError(null)} />}
    </div>
  )
}
