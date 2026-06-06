import type { DailyTask, TaskCompletion, TeammateDailyStat } from '@/types/database'

export function calculateTeamProgress(dailyTasks: DailyTask[]): number {
  const required = dailyTasks.filter(t => t.is_required)
  if (required.length === 0) return 0
  const completed = required.filter(t => t.is_completed).length
  return Math.round((completed / required.length) * 100)
}

export function calculateDailyPoints(completions: TaskCompletion[]): number {
  return completions.reduce((sum, c) => sum + c.points_awarded, 0)
}

export function calculateChad(stats: TeammateDailyStat[]): string | null {
  if (stats.length === 0) return null
  return [...stats].sort((a, b) => b.points_earned - a.points_earned)[0].teammate_id
}

export function calculateChud(stats: TeammateDailyStat[]): string | null {
  const eligible = stats.filter(s => s.missed_required_tasks > 0)
  if (eligible.length === 0) return null
  return [...eligible].sort((a, b) => {
    if (a.points_earned !== b.points_earned) return a.points_earned - b.points_earned
    if (a.missed_required_tasks !== b.missed_required_tasks) return b.missed_required_tasks - a.missed_required_tasks
    return a.teammate_id.localeCompare(b.teammate_id)
  })[0].teammate_id
}

export type ProgressState = 'critical' | 'damaged' | 'stabilizing' | 'almost_repaired' | 'survived' | 'sunk'

export function getProgressState(percentage: number, isSunk: boolean): ProgressState {
  if (isSunk) return 'sunk'
  if (percentage === 100) return 'survived'
  if (percentage <= 25) return 'critical'
  if (percentage <= 50) return 'damaged'
  if (percentage <= 75) return 'stabilizing'
  return 'almost_repaired'
}

export function calculateHeatmapValues(stats: TeammateDailyStat[]): Record<string, number> {
  return stats.reduce((acc, s) => {
    acc[s.stat_date] = s.points_earned
    return acc
  }, {} as Record<string, number>)
}

export function calculateCurrentStreak(stats: TeammateDailyStat[]): number {
  const sorted = [...stats].sort((a, b) => b.stat_date.localeCompare(a.stat_date))
  let streak = 0
  for (const s of sorted) {
    if (s.completed_all_required) streak++
    else break
  }
  return streak
}

export function calculateDisplayPoints(tasks: DailyTask[]): number {
  return tasks.reduce((sum, t) => sum + (t.is_completed ? t.points * t.completion_count : 0), 0)
}

export function isTaskCompletable(task: DailyTask): boolean {
  if (task.is_repeatable) return task.completion_count < task.max_completions
  return !task.is_completed
}

export function calculateLongestStreak(stats: TeammateDailyStat[]): number {
  const sorted = [...stats].sort((a, b) => a.stat_date.localeCompare(b.stat_date))
  let longest = 0
  let current = 0
  for (const s of sorted) {
    if (s.completed_all_required) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }
  return longest
}
