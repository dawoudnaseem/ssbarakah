import type { Teammate } from '@/types/database'

export interface LeaderboardEntry {
  teammate: Teammate
  points: number
  completedRequired: number
  totalRequired: number
  missedRequired: number
}

export interface RecentCompletion {
  id: string
  completed_at: string
  points_awarded: number
  task_name: string
  teammate_name: string
}
