export interface Teammate {
  id: string
  name: string
  password_hash: string | null
  plain_password: string | null
  is_active: boolean
  current_chad: boolean
  current_chud: boolean
  created_at: string
  updated_at: string
}

export interface PresetTask {
  id: string
  name: string
  description: string | null
  category: string
  default_points: number
  is_islamic: boolean
  is_repeatable: boolean
  default_max_completions: number
  can_be_recurring: boolean
  created_at: string
  updated_at: string
}

export interface DailyTask {
  id: string
  teammate_id: string
  preset_task_id: string | null
  name: string
  description: string | null
  category: string
  points: number
  is_required: boolean
  is_completed: boolean
  is_repeatable: boolean
  max_completions: number
  completion_count: number
  task_date: string
  created_at: string
  updated_at: string
}

export interface RecurringTask {
  id: string
  teammate_id: string
  preset_task_id: string | null
  name: string
  description: string | null
  category: string
  points: number
  is_required: boolean
  is_repeatable: boolean
  max_completions: number
  recurrence_type: 'daily' | 'weekly' | 'custom_days'
  recurrence_days: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: string
  daily_task_id: string
  teammate_id: string
  points_awarded: number
  completed_at: string
  task_date: string
}

export interface DailyResult {
  id: string
  result_date: string
  outcome: 'survived' | 'sunk'
  completion_percentage: number
  total_required_tasks: number
  completed_required_tasks: number
  missed_required_tasks: number
  chad_teammate_id: string | null
  chud_teammate_id: string | null
  created_at: string
}

export interface TeammateDailyStat {
  id: string
  teammate_id: string
  stat_date: string
  points_earned: number
  total_required_tasks: number
  completed_required_tasks: number
  missed_required_tasks: number
  completed_all_required: boolean
  is_chad: boolean
  is_chud: boolean
  created_at: string
}
