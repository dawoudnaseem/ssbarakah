import {
  calculateTeamProgress,
  calculateDailyPoints,
  calculateChad,
  calculateChud,
  getProgressState,
  calculateHeatmapValues,
  calculateCurrentStreak,
  calculateLongestStreak,
} from '@/lib/calculations'
import type { DailyTask, TaskCompletion, TeammateDailyStat } from '@/types/database'

const baseStat = (override: Partial<TeammateDailyStat>): TeammateDailyStat => ({
  id: '1',
  teammate_id: 'a',
  stat_date: '2026-06-01',
  points_earned: 0,
  total_required_tasks: 2,
  completed_required_tasks: 2,
  missed_required_tasks: 0,
  completed_all_required: true,
  is_chad: false,
  is_chud: false,
  created_at: '',
  ...override,
})

const baseTask = (override: Partial<DailyTask>): DailyTask => ({
  id: '1',
  teammate_id: 'a',
  preset_task_id: null,
  name: 'Task',
  description: null,
  category: 'work',
  points: 10,
  is_required: true,
  is_completed: false,
  is_repeatable: false,
  max_completions: 1,
  completion_count: 0,
  task_date: '2026-06-05',
  created_at: '',
  updated_at: '',
  ...override,
})

describe('calculateTeamProgress', () => {
  it('returns 0 when no tasks', () => {
    expect(calculateTeamProgress([])).toBe(0)
  })
  it('returns 0 when no required tasks are completed', () => {
    expect(calculateTeamProgress([baseTask({ is_completed: false })])).toBe(0)
  })
  it('returns 100 when all required tasks are completed', () => {
    expect(calculateTeamProgress([baseTask({ is_completed: true })])).toBe(100)
  })
  it('returns 50 when half are done', () => {
    const tasks = [
      baseTask({ id: '1', is_completed: true }),
      baseTask({ id: '2', is_completed: false }),
    ]
    expect(calculateTeamProgress(tasks)).toBe(50)
  })
  it('ignores non-required tasks', () => {
    const tasks = [
      baseTask({ id: '1', is_required: false, is_completed: false }),
      baseTask({ id: '2', is_required: true,  is_completed: true }),
    ]
    expect(calculateTeamProgress(tasks)).toBe(100)
  })
})

describe('calculateDailyPoints', () => {
  it('returns 0 for empty completions', () => {
    expect(calculateDailyPoints([])).toBe(0)
  })
  it('sums all points_awarded', () => {
    const completions: TaskCompletion[] = [
      { id: '1', daily_task_id: 'dt1', teammate_id: 'a', points_awarded: 30, completed_at: '', task_date: '2026-06-05' },
      { id: '2', daily_task_id: 'dt2', teammate_id: 'a', points_awarded: 50, completed_at: '', task_date: '2026-06-05' },
    ]
    expect(calculateDailyPoints(completions)).toBe(80)
  })
})

describe('calculateChad', () => {
  it('returns null for empty stats', () => {
    expect(calculateChad([])).toBeNull()
  })
  it('returns the teammate with most points', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 40 }),
      baseStat({ teammate_id: 'b', points_earned: 90 }),
      baseStat({ teammate_id: 'c', points_earned: 60 }),
    ]
    expect(calculateChad(stats)).toBe('b')
  })
})

describe('calculateChud', () => {
  it('returns null if nobody missed a task', () => {
    const stats = [baseStat({ missed_required_tasks: 0 })]
    expect(calculateChud(stats)).toBeNull()
  })
  it('returns lowest-points failing teammate', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 100, missed_required_tasks: 1 }),
      baseStat({ teammate_id: 'b', points_earned: 20,  missed_required_tasks: 1 }),
    ]
    expect(calculateChud(stats)).toBe('b')
  })
  it('does not assign Chud to someone who completed everything', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 5,  missed_required_tasks: 0 }),
      baseStat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 2 }),
    ]
    expect(calculateChud(stats)).toBe('b')
  })
  it('breaks tie by most missed tasks', () => {
    const stats = [
      baseStat({ teammate_id: 'a', points_earned: 10, missed_required_tasks: 1 }),
      baseStat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 3 }),
    ]
    expect(calculateChud(stats)).toBe('b')
  })
})

describe('getProgressState', () => {
  it('returns sunk when isSunk is true', () => {
    expect(getProgressState(80, true)).toBe('sunk')
  })
  it('returns survived at 100%', () => {
    expect(getProgressState(100, false)).toBe('survived')
  })
  it('returns critical at 0–25%', () => {
    expect(getProgressState(0,  false)).toBe('critical')
    expect(getProgressState(25, false)).toBe('critical')
  })
  it('returns damaged at 26–50%', () => {
    expect(getProgressState(26, false)).toBe('damaged')
    expect(getProgressState(50, false)).toBe('damaged')
  })
  it('returns stabilizing at 51–75%', () => {
    expect(getProgressState(51, false)).toBe('stabilizing')
    expect(getProgressState(75, false)).toBe('stabilizing')
  })
  it('returns almost_repaired at 76–99%', () => {
    expect(getProgressState(76, false)).toBe('almost_repaired')
    expect(getProgressState(99, false)).toBe('almost_repaired')
  })
})

describe('calculateHeatmapValues', () => {
  it('returns empty object for no stats', () => {
    expect(calculateHeatmapValues([])).toEqual({})
  })
  it('maps stat_date to points_earned', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', points_earned: 50 }),
      baseStat({ stat_date: '2026-06-02', points_earned: 80 }),
    ]
    expect(calculateHeatmapValues(stats)).toEqual({ '2026-06-01': 50, '2026-06-02': 80 })
  })
})

describe('calculateCurrentStreak', () => {
  it('returns 0 for no stats', () => {
    expect(calculateCurrentStreak([])).toBe(0)
  })
  it('returns consecutive streak from most recent day', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', completed_all_required: false }),
      baseStat({ stat_date: '2026-06-02', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-03', completed_all_required: true }),
    ]
    expect(calculateCurrentStreak(stats)).toBe(2)
  })
  it('resets on a missed day', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-02', completed_all_required: false }),
      baseStat({ stat_date: '2026-06-03', completed_all_required: true }),
    ]
    expect(calculateCurrentStreak(stats)).toBe(1)
  })
})

describe('calculateLongestStreak', () => {
  it('returns 0 for no stats', () => {
    expect(calculateLongestStreak([])).toBe(0)
  })
  it('returns the longest consecutive run', () => {
    const stats = [
      baseStat({ stat_date: '2026-06-01', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-02', completed_all_required: true }),
      baseStat({ stat_date: '2026-06-03', completed_all_required: false }),
      baseStat({ stat_date: '2026-06-04', completed_all_required: true }),
    ]
    expect(calculateLongestStreak(stats)).toBe(2)
  })
})
