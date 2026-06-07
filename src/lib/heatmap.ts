import type { TeammateDailyStat } from '@/types/database'

export function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function heatmapColor(points: number, missedRequired: number): string {
  if (missedRequired > 0) return 'rgba(220,38,38,0.5)'
  if (points === 0)  return 'rgba(255,255,255,0.05)'
  if (points < 10)  return '#7C3200'
  if (points < 20)  return '#B84A00'
  if (points < 35)  return '#F97316'
  return '#FBBF24'
}

export function buildHeatmapCells(
  teammateId: string,
  stats: TeammateDailyStat[]
): { color: string; date: string }[] {
  const byDate: Record<string, TeammateDailyStat> = {}
  for (const s of stats) {
    if (s.teammate_id === teammateId) byDate[s.stat_date] = s
  }

  const cells: { color: string; date: string }[] = []
  for (let i = 59; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = localDateStr(d)
    const stat = byDate[dateStr]
    cells.push({
      date: dateStr,
      color: stat
        ? heatmapColor(stat.points_earned, stat.missed_required_tasks)
        : 'rgba(255,255,255,0.05)',
    })
  }
  return cells
}
