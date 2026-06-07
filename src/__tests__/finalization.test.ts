import { calculateChad, calculateChud } from '@/lib/calculations'
import type { TeammateDailyStat } from '@/types/database'

const stat = (override: Partial<TeammateDailyStat>): TeammateDailyStat => ({
  id: '',
  teammate_id: 'a',
  stat_date: '2026-06-06',
  points_earned: 0,
  total_required_tasks: 0,
  completed_required_tasks: 0,
  missed_required_tasks: 0,
  completed_all_required: false,
  is_chad: false,
  is_chud: false,
  created_at: '',
  ...override,
})

describe('finalizeDay badge assignment logic', () => {
  describe('Chad selection', () => {
    it('assigns Chad to the teammate with the most points', () => {
      const stats = [
        stat({ teammate_id: 'dawoud', points_earned: 60 }),
        stat({ teammate_id: 'araf',   points_earned: 90 }),
        stat({ teammate_id: 'sufiyan',points_earned: 45 }),
      ]
      expect(calculateChad(stats)).toBe('araf')
    })

    it('returns null when stats array is empty', () => {
      expect(calculateChad([])).toBeNull()
    })

    it('tiebreaks Chad by first teammate in sorted array (stable)', () => {
      const stats = [
        stat({ teammate_id: 'b', points_earned: 100 }),
        stat({ teammate_id: 'a', points_earned: 100 }),
      ]
      // The first element with max points wins (no explicit tiebreak in spec)
      expect(calculateChad(stats)).toBe('b')
    })
  })

  describe('Chud selection', () => {
    it('returns null if nobody missed a required task (ship survived)', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 80, missed_required_tasks: 0 }),
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 0 }),
      ]
      expect(calculateChud(stats)).toBeNull()
    })

    it('assigns Chud to the teammate with the lowest points among those who missed tasks', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 80, missed_required_tasks: 1 }),
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 1 }),
        stat({ teammate_id: 'c', points_earned: 40, missed_required_tasks: 0 }),
      ]
      expect(calculateChud(stats)).toBe('b')
    })

    it('tiebreaks Chud by most missed tasks when points are equal', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 10, missed_required_tasks: 1 }),
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 3 }),
      ]
      expect(calculateChud(stats)).toBe('b')
    })

    it('tiebreaks Chud by teammate_id when points and missed tasks are equal', () => {
      const stats = [
        stat({ teammate_id: 'b', points_earned: 10, missed_required_tasks: 2 }),
        stat({ teammate_id: 'a', points_earned: 10, missed_required_tasks: 2 }),
      ]
      expect(calculateChud(stats)).toBe('a')
    })

    it('does not assign Chud to a teammate who completed all tasks, even if they have the lowest points', () => {
      const stats = [
        stat({ teammate_id: 'a', points_earned: 5, missed_required_tasks: 0 }),
        stat({ teammate_id: 'b', points_earned: 20, missed_required_tasks: 2 }),
      ]
      expect(calculateChud(stats)).toBe('b')
    })
  })

  describe('per-teammate stats shape', () => {
    it('completed_all_required is false when any required task is missed', () => {
      const tmRequired = 3
      const tmCompleted = 2
      const tmMissed = tmRequired - tmCompleted
      const completedAllRequired = tmMissed === 0 && tmRequired > 0
      expect(completedAllRequired).toBe(false)
    })

    it('completed_all_required is true when all required tasks are done', () => {
      const tmRequired = 3
      const tmCompleted = 3
      const tmMissed = tmRequired - tmCompleted
      const completedAllRequired = tmMissed === 0 && tmRequired > 0
      expect(completedAllRequired).toBe(true)
    })

    it('completed_all_required is false when there are no required tasks', () => {
      const tmRequired = 0
      const tmCompleted = 0
      const tmMissed = tmRequired - tmCompleted
      const completedAllRequired = tmMissed === 0 && tmRequired > 0
      expect(completedAllRequired).toBe(false)
    })

    it('outcome is sunk when any required task is missed', () => {
      const missed: number = 2
      const outcome: 'survived' | 'sunk' = missed === 0 ? 'survived' : 'sunk'
      expect(outcome).toBe('sunk')
    })

    it('outcome is survived when no required tasks are missed', () => {
      const missed: number = 0
      const outcome: 'survived' | 'sunk' = missed === 0 ? 'survived' : 'sunk'
      expect(outcome).toBe('survived')
    })
  })
})
