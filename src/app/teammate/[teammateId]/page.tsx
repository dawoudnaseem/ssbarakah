'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentTeammate, logoutTeammate } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { todayString } from '@/lib/dateUtils'
import { calculateDisplayPoints, isTaskCompletable } from '@/lib/calculations'
import { buildHeatmapCells } from '@/lib/heatmap'
import type { Teammate, DailyTask, PresetTask, RecurringTask, TeammateDailyStat } from '@/types/database'
import { PresetTaskSelector, Field, Toggle, inputStyle } from '@/components/tasks/PresetTaskSelector'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddTaskForm {
  name: string
  description: string
  category: string
  points: number
  is_required: boolean
  is_repeatable: boolean
  max_completions: number
  is_recurring: boolean
}

const DEFAULT_FORM: AddTaskForm = {
  name: '',
  description: '',
  category: 'general',
  points: 10,
  is_required: true,
  is_repeatable: false,
  max_completions: 1,
  is_recurring: false,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeammatePage({ params }: { params: Promise<{ teammateId: string }> }) {
  const { teammateId } = use(params)
  const router = useRouter()

  const [teammate, setTeammate] = useState<Teammate | null>(null)
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [presets, setPresets] = useState<PresetTask[]>([])
  const [streak, setStreak] = useState(0)
  const [heatmapStats, setHeatmapStats] = useState<TeammateDailyStat[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [taskToDelete, setTaskToDelete] = useState<DailyTask | null>(null)
  const [form, setForm] = useState<AddTaskForm>(DEFAULT_FORM)
  const [formBusy, setFormBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const today = todayString()

  // ── Auth guard + fresh badge fetch ─────────────────────────────────────────
  useEffect(() => {
    const current = getCurrentTeammate()
    if (!current) {
      router.replace('/login')
      return
    }
    // Set from localStorage immediately so the page renders, then fetch fresh
    // data from DB so current_chad/current_chud reflect the latest finalization.
    setTeammate(current)
    supabase
      .from('teammates')
      .select('*')
      .eq('id', current.id)
      .single()
      .then(({ data }) => { if (data) setTeammate(data as Teammate) })
  }, [router])

  // ── Fetch tasks + streak ────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!teammateId) return
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('teammate_id', teammateId)
      .eq('task_date', today)
      .order('created_at', { ascending: true })
    setTasks((data as DailyTask[]) ?? [])
  }, [teammateId, today])

  const fetchStreak = useCallback(async () => {
    if (!teammateId) return
    const { data } = await supabase
      .from('teammate_daily_stats')
      .select('*')
      .eq('teammate_id', teammateId)
      .order('stat_date', { ascending: false })
      .limit(365)
    if (!data) return
    setHeatmapStats(data as TeammateDailyStat[])
    let s = 0
    for (const row of data) {
      if (row.completed_all_required) s++
      else break
    }
    setStreak(s)
  }, [teammateId])

  const fetchPresets = useCallback(async () => {
    const { data } = await supabase.from('preset_tasks').select('*').order('name')
    setPresets((data as PresetTask[]) ?? [])
  }, [])

  const fetchRecurringTasks = useCallback(async () => {
    if (!teammateId) return
    const { data } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('teammate_id', teammateId)
      .eq('is_active', true)
    setRecurringTasks((data as RecurringTask[]) ?? [])
  }, [teammateId])

  useEffect(() => {
    if (!teammate) return
    Promise.all([fetchTasks(), fetchStreak(), fetchPresets()]).then(() => setLoading(false))
  }, [teammate, fetchTasks, fetchStreak, fetchPresets])

  // ── Watch for day finalization → redirect to ship page for the animation ────
  useEffect(() => {
    if (!teammate) return
    async function checkFinalized() {
      const { data } = await supabase
        .from('daily_results')
        .select('id')
        .eq('result_date', today)
        .maybeSingle()
      if (data) router.replace('/')
    }
    const id = setInterval(checkFinalized, 10_000)
    return () => clearInterval(id)
  }, [teammate, today, router])

  // ── Ensure recurring tasks exist for today ──────────────────────────────────
  useEffect(() => {
    if (!teammateId) return
    async function seedRecurring() {
      const { data: recurring } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('teammate_id', teammateId)
        .eq('is_active', true)
      setRecurringTasks((recurring as RecurringTask[]) ?? [])
      if (!recurring || recurring.length === 0) return

      const today2 = todayString()
      const todayDow = new Date(today2 + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })

      for (const rt of recurring as RecurringTask[]) {
        const applies =
          rt.recurrence_type === 'daily' ||
          (rt.recurrence_type === 'weekly' && rt.recurrence_days?.includes(todayDow)) ||
          (rt.recurrence_type === 'custom_days' && rt.recurrence_days?.includes(todayDow))
        if (!applies) continue

        const { count } = await supabase
          .from('daily_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('teammate_id', teammateId)
          .eq('task_date', today2)
          .eq('preset_task_id', rt.preset_task_id ?? '')
        if ((count ?? 0) > 0) continue

        await supabase.from('daily_tasks').insert({
          teammate_id: teammateId,
          preset_task_id: rt.preset_task_id,
          name: rt.name,
          description: rt.description,
          category: rt.category,
          points: rt.points,
          is_required: rt.is_required,
          is_completed: false,
          is_repeatable: rt.is_repeatable,
          max_completions: rt.max_completions,
          completion_count: 0,
          task_date: today2,
        })
      }
      await fetchTasks()
    }
    seedRecurring()
  }, [teammateId, fetchTasks])

  // ── Task completion ─────────────────────────────────────────────────────────
  async function completeTask(task: DailyTask) {
    if (!isTaskCompletable(task)) return

    const newCount = task.completion_count + 1
    const nowCompleted = true

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, is_completed: nowCompleted, completion_count: newCount } : t
      )
    )

    const [{ error: updateErr }] = await Promise.all([
      supabase
        .from('daily_tasks')
        .update({ is_completed: nowCompleted, completion_count: newCount, updated_at: new Date().toISOString() })
        .eq('id', task.id),
      supabase.from('task_completions').insert({
        daily_task_id: task.id,
        teammate_id: teammateId,
        points_awarded: task.points,
        completed_at: new Date().toISOString(),
        task_date: today,
      }),
    ])

    if (updateErr) await fetchTasks()
  }

  // ── Add custom task ─────────────────────────────────────────────────────────
  async function submitAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setFormBusy(true)
    setFormError('')

    const { data: inserted, error } = await supabase
      .from('daily_tasks')
      .insert({
        teammate_id: teammateId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        points: form.points,
        is_required: form.is_required,
        is_completed: false,
        is_repeatable: form.is_repeatable,
        max_completions: form.is_repeatable ? form.max_completions : 1,
        completion_count: 0,
        task_date: today,
      })
      .select()
      .single()

    if (error || !inserted) {
      setFormError('Failed to add task. Try again.')
      setFormBusy(false)
      return
    }

    if (form.is_recurring) {
      await supabase.from('recurring_tasks').insert({
        teammate_id: teammateId,
        preset_task_id: null,
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        points: form.points,
        is_required: form.is_required,
        is_repeatable: form.is_repeatable,
        max_completions: form.is_repeatable ? form.max_completions : 1,
        recurrence_type: 'daily',
        recurrence_days: null,
        is_active: true,
      })
      await fetchRecurringTasks()
    }

    setForm(DEFAULT_FORM)
    setShowAddForm(false)
    setFormBusy(false)
    await fetchTasks()
  }

  // ── Add preset task ─────────────────────────────────────────────────────────
  async function addPresetTask(preset: PresetTask, recurring: boolean) {
    const { data: inserted, error } = await supabase
      .from('daily_tasks')
      .insert({
        teammate_id: teammateId,
        preset_task_id: preset.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        points: preset.default_points,
        is_required: true,
        is_completed: false,
        is_repeatable: preset.is_repeatable,
        max_completions: preset.default_max_completions,
        completion_count: 0,
        task_date: today,
      })
      .select()
      .single()

    if (error || !inserted) return

    if (recurring) {
      await supabase.from('recurring_tasks').insert({
        teammate_id: teammateId,
        preset_task_id: preset.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        points: preset.default_points,
        is_required: true,
        is_repeatable: preset.is_repeatable,
        max_completions: preset.default_max_completions,
        recurrence_type: 'daily',
        recurrence_days: null,
        is_active: true,
      })
      await fetchRecurringTasks()
    }

    setShowPresetModal(false)
    await fetchTasks()
  }

  // ── Delete task ─────────────────────────────────────────────────────────────
  async function deleteTask(task: DailyTask, scope: 'today' | 'forever') {
    setTaskToDelete(null)
    setTasks(prev => prev.filter(t => t.id !== task.id))

    await supabase.from('task_completions').delete().eq('daily_task_id', task.id)

    const { error } = await supabase.from('daily_tasks').delete().eq('id', task.id)

    if (scope === 'forever') {
      if (task.preset_task_id) {
        await supabase
          .from('recurring_tasks')
          .delete()
          .eq('teammate_id', task.teammate_id)
          .eq('preset_task_id', task.preset_task_id)
        setRecurringTasks(prev => prev.filter(rt => rt.preset_task_id !== task.preset_task_id))
      } else {
        await supabase
          .from('recurring_tasks')
          .delete()
          .eq('teammate_id', task.teammate_id)
          .eq('name', task.name)
        setRecurringTasks(prev => prev.filter(rt => !(rt.preset_task_id === null && rt.name === task.name)))
      }
    }

    if (error) await fetchTasks()
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  function handleLogout() {
    logoutTeammate()
    router.replace('/')
  }

  // ── Derived state ───────────────────────────────────────────────────────────
  const required = tasks.filter(t => t.is_required)
  const optional = tasks.filter(t => !t.is_required)
  const completedRequired = required.filter(t => t.is_completed).length
  const totalRequired = required.length
  const points = calculateDisplayPoints(tasks)
  const isChadBadge = teammate?.current_chad
  const isChadChud = teammate?.current_chud

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#061826' }}>
        <p style={{ color: '#9DD8F7' }}>Loading…</p>
      </main>
    )
  }

  return (
    <div style={{ background: '#020810', color: '#F2FBFF' }}>

      {/* ── Surface section: arctic gradient ── */}
      <div className="px-4 pt-20 pb-6" style={{ background: 'linear-gradient(180deg, #061826 0%, #0B3558 100%)' }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-wide" style={{ color: '#F2FBFF' }}>
                {teammate?.name ?? ''}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {isChadBadge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#F59E0B', color: '#061826' }}>
                    ⚓ Chad of the Day
                  </span>
                )}
                {isChadChud && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#DC2626', color: '#F2FBFF' }}>
                    💀 Chud of the Day
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-3 rounded-lg transition-opacity hover:opacity-70"
              style={{ background: 'rgba(157,216,247,0.1)', border: '1px solid rgba(157,216,247,0.2)', color: '#9DD8F7', minHeight: '44px' }}
            >
              Log out
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Points Today', value: points },
              { label: 'Tasks Done', value: `${completedRequired} / ${totalRequired}` },
              { label: 'Streak', value: `${streak}d` },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(11,53,88,0.6)', border: '1px solid rgba(157,216,247,0.15)' }}
              >
                <p className="text-2xl font-bold" style={{ color: '#9DD8F7' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(242,251,255,0.55)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Activity Heatmap ── */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(11,53,88,0.4)', border: '1px solid rgba(157,216,247,0.1)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>Activity Heatmap</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: '3px', width: '100%' }}>
              {buildHeatmapCells(teammate?.id ?? '', heatmapStats).map(cell => (
                <div key={cell.date} style={{ position: 'relative', borderRadius: '3px', overflow: 'hidden', background: cell.color }}>
                  <div style={{ paddingBottom: '100%' }} />
                </div>
              ))}
            </div>
            <p className="mt-2" style={{ fontSize: '10px', color: 'rgba(157,216,247,0.3)' }}>
              Last 60 days — darker = low pts · gold = high pts · red = missed required
            </p>
          </div>

          <PomodoroTimer />

        </div>
      </div>

      {/* ── Abyss transition ── */}
      <div style={{ height: '100px', background: 'linear-gradient(180deg, #0B3558 0%, #020810 100%)' }} />

      {/* ── Deep waters section ── */}
      <div className="px-4 pb-6" style={{ background: '#020810' }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: '1px', background: 'rgba(157,216,247,0.07)' }} />
            <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(157,216,247,0.22)' }}>— deep waters —</p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(157,216,247,0.07)' }} />
          </div>

        {/* ── Required tasks ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>
            Required Repairs ({completedRequired}/{totalRequired})
          </p>
          {required.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(242,251,255,0.4)' }}>No required tasks yet — add some below.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {required.map(task => (
                <TaskRow key={task.id} task={task} onComplete={completeTask} onDelete={setTaskToDelete} />
              ))}
            </ul>
          )}
        </section>

        {/* ── Optional tasks ── */}
        {optional.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9DD8F7' }}>Optional Tasks</p>
            <ul className="flex flex-col gap-2">
              {optional.map(task => (
                <TaskRow key={task.id} task={task} onComplete={completeTask} onDelete={setTaskToDelete} />
              ))}
            </ul>
          </section>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={() => { setShowAddForm(v => !v); setShowPresetModal(false) }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: '#9DD8F7', color: '#061826' }}
          >
            + Custom Task
          </button>
          <button
            onClick={() => { setShowPresetModal(v => !v); setShowAddForm(false) }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(157,216,247,0.15)', border: '1px solid rgba(157,216,247,0.3)', color: '#9DD8F7' }}
          >
            From Presets
          </button>
        </div>

        {/* ── Add custom task form ── */}
        {showAddForm && (
          <form
            onSubmit={submitAddTask}
            className="rounded-xl p-5 flex flex-col gap-4"
            style={{ background: 'rgba(11,53,88,0.7)', border: '1px solid rgba(157,216,247,0.2)' }}
          >
            <p className="text-sm font-bold" style={{ color: '#9DD8F7' }}>New Custom Task</p>

            <Field label="Task Name">
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Review notes"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </Field>

            <Field label="Description (optional)">
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="general">General</option>
                  <option value="islamic">Islamic</option>
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="work">Work</option>
                </select>
              </Field>
              <Field label="Task Size">
                <div className="flex gap-2">
                  {([['Small', 5], ['Medium', 10], ['Large', 15]] as [string, number][]).map(([label, val]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, points: val }))}
                      className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                      style={form.points === val
                        ? { background: '#9DD8F7', color: '#061826', border: '1.5px solid #9DD8F7' }
                        : { ...inputStyle, border: '1.5px solid rgba(157,216,247,0.25)' }
                      }
                    >
                      {label}<br />
                      <span className="text-xs opacity-75">{val} pts</span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <Toggle
                label="Required task"
                checked={form.is_required}
                onChange={v => setForm(f => ({ ...f, is_required: v }))}
              />
              <Toggle
                label="Repeatable (in a single day)"
                checked={form.is_repeatable}
                onChange={v => setForm(f => ({ ...f, is_repeatable: v }))}
              />
              {form.is_repeatable && (
                <Field label="How many times in a single day?">
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={form.max_completions}
                    onChange={e => setForm(f => ({ ...f, max_completions: Number(e.target.value) }))}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                </Field>
              )}
              <Toggle
                label="Repeat every day (recurring)"
                checked={form.is_recurring}
                onChange={v => setForm(f => ({ ...f, is_recurring: v }))}
              />
            </div>

            {formError && (
              <p className="text-xs rounded-lg py-2 px-3 text-center" style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5' }}>
                {formError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formBusy}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ background: '#9DD8F7', color: '#061826' }}
              >
                {formBusy ? 'Adding…' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setForm(DEFAULT_FORM) }}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: 'rgba(157,216,247,0.1)', color: '#9DD8F7' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Preset task modal ── */}
        {showPresetModal && (
          <PresetTaskSelector
            presets={presets}
            onAdd={addPresetTask}
            onClose={() => setShowPresetModal(false)}
          />
        )}

          {/* Bottom padding clears any fixed bars */}
          <div style={{ height: '20px' }} />

        </div>
      </div>

      {taskToDelete && (
        <DeleteConfirmModal
          task={taskToDelete}
          isRecurring={recurringTasks.some(rt =>
            taskToDelete.preset_task_id !== null
              ? rt.preset_task_id === taskToDelete.preset_task_id
              : rt.preset_task_id === null && rt.name === taskToDelete.name
          )}
          onCancel={() => setTaskToDelete(null)}
          onDeleteToday={() => deleteTask(taskToDelete, 'today')}
          onDeleteForever={() => deleteTask(taskToDelete, 'forever')}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TaskRow({
  task,
  onComplete,
  onDelete,
}: {
  task: DailyTask
  onComplete: (t: DailyTask) => void
  onDelete: (t: DailyTask) => void
}) {
  const done = task.is_completed
  const disabled = !isTaskCompletable(task)

  return (
    <li
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{
        background: done ? 'rgba(34,197,94,0.08)' : 'rgba(11,53,88,0.5)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'rgba(157,216,247,0.1)'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: done ? 'rgba(242,251,255,0.5)' : '#F2FBFF', textDecoration: done && !task.is_repeatable ? 'line-through' : 'none' }}
        >
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs" style={{ color: '#9DD8F7' }}>{task.points} pts</span>
          {task.is_repeatable && (
            <span className="text-xs" style={{ color: 'rgba(242,251,255,0.4)' }}>
              {task.completion_count}/{task.max_completions}
            </span>
          )}
          {task.category === 'islamic' && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              ☾ Islamic
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task)}
        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-opacity hover:opacity-80"
        style={{
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.25)',
          color: 'rgba(220,38,38,0.7)',
          minHeight: '44px',
          minWidth: '44px',
        }}
        aria-label="Remove task"
      >
        ✕
      </button>

      {/* Complete button */}
      <button
        disabled={disabled}
        onClick={() => onComplete(task)}
        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-opacity disabled:opacity-30"
        style={{
          background: done && !task.is_repeatable ? 'rgba(34,197,94,0.2)' : '#9DD8F7',
          color: '#061826',
          minHeight: '44px',
          minWidth: '44px',
        }}
        aria-label={done ? 'Completed' : 'Mark complete'}
      >
        {done && !task.is_repeatable ? '✓' : '+'}
      </button>
    </li>
  )
}

