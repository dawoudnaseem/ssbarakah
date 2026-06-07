'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import IcyModal from '@/components/IcyModal'
import IcyErrorModal from '@/components/IcyErrorModal'
import type { DailyResult } from '@/types/database'

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function LogsSection() {
  const [logs, setLogs] = useState<DailyResult[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<DailyResult | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_results')
      .select('*')
      .order('result_date', { ascending: false })
    if (error) { setFetchError(error.message); setLoading(false); return }
    setLogs(data ?? [])
    setLoading(false)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)

    // Delete all task completions for that date first (FK deps)
    const { error: e0 } = await supabase
      .from('task_completions')
      .delete()
      .eq('task_date', toDelete.result_date)
    if (e0) { setDeleteError(e0.message); setDeleting(false); setToDelete(null); return }

    // Delete all daily tasks for that date
    const { error: e1a } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('task_date', toDelete.result_date)
    if (e1a) { setDeleteError(e1a.message); setDeleting(false); setToDelete(null); return }

    // Delete teammate daily stats for that date
    const { error: e1 } = await supabase
      .from('teammate_daily_stats')
      .delete()
      .eq('stat_date', toDelete.result_date)
    if (e1) { setDeleteError(e1.message); setDeleting(false); setToDelete(null); return }

    // Delete the result itself
    const { error: e2 } = await supabase
      .from('daily_results')
      .delete()
      .eq('id', toDelete.id)
    if (e2) { setDeleteError(e2.message); setDeleting(false); setToDelete(null); return }

    // Clear dismissed flags so the overlay/banner show fresh after re-finalization
    sessionStorage.removeItem(`ss_barakah_sunk_dismissed_${toDelete.result_date}`)
    sessionStorage.removeItem(`ss_barakah_survived_dismissed_${toDelete.result_date}`)

    // Re-derive badges from the most recent remaining log
    const remaining = logs.filter(l => l.id !== toDelete.id)
    const latest = remaining[0] ?? null  // logs are ordered newest-first
    // Clear all badges first, then set from latest log if one exists
    await supabase.from('teammates').update({ current_chad: false, current_chud: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    if (latest?.chad_teammate_id) {
      await supabase.from('teammates').update({ current_chad: true }).eq('id', latest.chad_teammate_id)
    }
    if (latest?.chud_teammate_id) {
      await supabase.from('teammates').update({ current_chud: true }).eq('id', latest.chud_teammate_id)
    }

    setDeleting(false)
    setToDelete(null)
    setLogs(prev => prev.filter(l => l.id !== toDelete.id))
  }

  if (loading) return <p className="text-sm" style={{ color: 'rgba(157,216,247,0.5)' }}>Loading logs…</p>
  if (fetchError) return <p className="text-sm" style={{ color: '#DC2626' }}>{fetchError}</p>

  return (
    <div>
      <h2 className="text-lg font-bold mb-1" style={{ color: '#F2FBFF' }}>Ship Logs</h2>
      <p className="text-xs mb-5" style={{ color: 'rgba(157,216,247,0.45)' }}>
        All finalized days. Delete a log to allow re-finalization for that date.
      </p>

      {logs.length === 0 && (
        <p className="text-sm" style={{ color: 'rgba(157,216,247,0.45)' }}>No voyages recorded yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {logs.map(log => (
          <div key={log.id} className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            style={{
              background: log.outcome === 'survived'
                ? 'rgba(34,197,94,0.06)'
                : 'rgba(220,38,38,0.06)',
              border: `1px solid ${log.outcome === 'survived' ? 'rgba(34,197,94,0.2)' : 'rgba(220,38,38,0.2)'}`,
            }}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{log.outcome === 'survived' ? '⛵' : '🌊'}</span>
                <span className="font-semibold text-sm" style={{ color: '#F2FBFF' }}>
                  {formatDate(log.result_date)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: log.outcome === 'survived' ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.15)',
                    color: log.outcome === 'survived' ? '#22C55E' : '#DC2626',
                  }}>
                  {log.outcome === 'survived' ? 'SURVIVED' : 'SUNK'}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(157,216,247,0.5)' }}>
                {log.completion_percentage}% complete · {log.completed_required_tasks}/{log.total_required_tasks} required tasks
              </p>
            </div>
            <button
              onClick={() => setToDelete(log)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(220,38,38,0.1)',
                color: '#DC2626',
                border: '1px solid rgba(220,38,38,0.25)',
              }}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {toDelete && (
        <IcyModal onClose={() => setToDelete(null)} accentColor="#DC2626">
          <div className="px-6 pb-6 text-center flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: '#F2FBFF' }}>Delete this log?</p>
            <p className="text-sm" style={{ color: 'rgba(157,216,247,0.6)' }}>
              <span style={{ color: '#F2FBFF' }}>{formatDate(toDelete.result_date)}</span> will be permanently removed —
              including all tasks, completions, and crew stats for that day.
              Auto-finalization will not recreate it.
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

      {deleteError && <IcyErrorModal message={deleteError} onDismiss={() => setDeleteError(null)} />}
    </div>
  )
}
