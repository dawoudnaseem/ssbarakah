import {
  toDateString,
  todayString,
  yesterdayString,
  tomorrowString,
  dayOfWeek,
  endOfDayHasPassed,
} from '@/lib/dateUtils'

describe('toDateString', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(toDateString(new Date('2026-06-05T15:00:00Z'))).toBe('2026-06-05')
  })
})

describe('todayString', () => {
  it('returns a string matching YYYY-MM-DD format', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('yesterdayString', () => {
  it('returns the day before today', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    expect(yesterdayString()).toBe(toDateString(yesterday))
  })
})

describe('tomorrowString', () => {
  it('returns the day after today', () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    expect(tomorrowString()).toBe(toDateString(tomorrow))
  })
})

describe('dayOfWeek', () => {
  it('returns Thursday for 2026-06-04', () => {
    expect(dayOfWeek('2026-06-04')).toBe('Thursday')
  })
  it('returns Friday for 2026-06-05', () => {
    expect(dayOfWeek('2026-06-05')).toBe('Friday')
  })
  it('returns Sunday for 2026-06-07', () => {
    expect(dayOfWeek('2026-06-07')).toBe('Sunday')
  })
})

describe('endOfDayHasPassed', () => {
  it('returns true for a past date', () => {
    expect(endOfDayHasPassed('2020-01-01')).toBe(true)
  })
  it('returns false for today', () => {
    expect(endOfDayHasPassed(todayString())).toBe(false)
  })
  it('returns false for a future date', () => {
    expect(endOfDayHasPassed('2099-12-31')).toBe(false)
  })
})
