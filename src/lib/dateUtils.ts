export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function todayString(): string {
  return toDateString(new Date())
}

export function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}

export function tomorrowString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateString(d)
}

// Uses noon local time to avoid DST edge cases on date parsing
export function dayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(dateStr + 'T12:00:00').getDay()]
}

export function endOfDayHasPassed(dateStr: string): boolean {
  return dateStr < todayString()
}
