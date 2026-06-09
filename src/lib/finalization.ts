import { supabase } from './supabaseClient'
import { calculateChad, calculateChud } from './calculations'
import { dayOfWeek } from './dateUtils'
import type { TeammateDailyStat, DailyTask, RecurringTask } from '@/types/database'

export async function finalizeDay(date: string): Promise<void> {
  // Idempotent — bail out if already finalized
  const { data: existing } = await supabase
    .from('daily_results')
    .select('id')
    .eq('result_date', date)
    .single()
  if (existing) return

  const { data: teammates } = await supabase
    .from('teammates')
    .select('id')
    .eq('is_active', true)
  if (!teammates || teammates.length === 0) return

  const { data: tasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('task_date', date)
  const allTasks: DailyTask[] = (tasks as DailyTask[]) ?? []
  const required = allTasks.filter(t => t.is_required)
  const completedRequired = required.filter(t => t.is_completed)
  const total = required.length
  const completedCount = completedRequired.length
  const missed = total - completedCount
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100)
  const outcome: 'survived' | 'sunk' = missed === 0 ? 'survived' : 'sunk'

  // Build per-teammate stats rows
  const statsRows: Omit<TeammateDailyStat, 'id' | 'created_at'>[] = []
  for (const tm of teammates) {
    const { data: completions } = await supabase
      .from('task_completions')
      .select('points_awarded')
      .eq('teammate_id', tm.id)
      .eq('task_date', date)
    const earned = ((completions ?? []) as { points_awarded: number }[])
      .reduce((s, c) => s + c.points_awarded, 0)
    const tmRequired = required.filter(t => t.teammate_id === tm.id)
    const tmCompleted = tmRequired.filter(t => t.is_completed).length
    const tmMissed = tmRequired.length - tmCompleted
    const missedPoints = tmRequired.filter(t => !t.is_completed).reduce((s, t) => s + t.points, 0)

    statsRows.push({
      teammate_id: tm.id,
      stat_date: date,
      points_earned: earned - missedPoints,
      total_required_tasks: tmRequired.length,
      completed_required_tasks: tmCompleted,
      missed_required_tasks: tmMissed,
      completed_all_required: tmMissed === 0 && tmRequired.length > 0,
      is_chad: false,
      is_chud: false,
    })
  }

  // Cast to TeammateDailyStat to satisfy calculateChad/calculateChud signatures
  const statsForCalc = statsRows.map(s => ({ ...s, id: '', created_at: '' } as TeammateDailyStat))
  const chadId = calculateChad(statsForCalc)
  const chudId = calculateChud(statsForCalc)

  const finalRows = statsRows.map(s => ({
    ...s,
    is_chad: s.teammate_id === chadId,
    is_chud: s.teammate_id === chudId,
  }))

  await supabase.from('daily_results').insert({
    result_date: date,
    outcome,
    completion_percentage: pct,
    total_required_tasks: total,
    completed_required_tasks: completedCount,
    missed_required_tasks: missed,
    chad_teammate_id: chadId,
    chud_teammate_id: chudId ?? null,
  })

  await supabase.from('teammate_daily_stats').insert(finalRows)

  // Update current badge flags on teammates table
  await supabase
    .from('teammates')
    .update({ current_chad: false, current_chud: false })
    .in('id', teammates.map((t: { id: string }) => t.id))
  if (chadId) {
    await supabase.from('teammates').update({ current_chad: true }).eq('id', chadId)
  }
  if (chudId) {
    await supabase.from('teammates').update({ current_chud: true }).eq('id', chudId)
  }

  await createNextDayRecurringTasks(date)
}

export async function createNextDayRecurringTasks(fromDate: string): Promise<void> {
  const nextDate = new Date(fromDate + 'T12:00:00')
  nextDate.setDate(nextDate.getDate() + 1)
  const nextDateStr = nextDate.toISOString().split('T')[0]
  const nextDow = dayOfWeek(nextDateStr)

  const { data: recurring } = await supabase
    .from('recurring_tasks')
    .select('*')
    .eq('is_active', true)
  if (!recurring) return

  for (const rt of recurring as RecurringTask[]) {
    const applies =
      rt.recurrence_type === 'daily' ||
      (rt.recurrence_type === 'weekly' && rt.recurrence_days?.includes(nextDow)) ||
      (rt.recurrence_type === 'custom_days' && rt.recurrence_days?.includes(nextDow))
    if (!applies) continue

    // Duplicate prevention: skip if a task with the same name already exists for this teammate + date
    const { data: dupe } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('teammate_id', rt.teammate_id)
      .eq('task_date', nextDateStr)
      .eq('name', rt.name)
      .maybeSingle()
    if (dupe) continue

    await supabase.from('daily_tasks').insert({
      teammate_id: rt.teammate_id,
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
      task_date: nextDateStr,
    })
  }
}
