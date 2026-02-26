import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime, formatDateTime, parseUserAgent, toDateTimeLocal } from './utils'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "-" for null', () => {
    expect(formatRelativeTime(null)).toBe('-')
  })

  it('returns "just now" for recent timestamps', () => {
    expect(formatRelativeTime('2024-06-15T11:59:30Z')).toBe('just now')
  })

  it('returns minutes ago', () => {
    expect(formatRelativeTime('2024-06-15T11:45:00Z')).toBe('15m ago')
  })

  it('returns hours ago', () => {
    expect(formatRelativeTime('2024-06-15T09:00:00Z')).toBe('3h ago')
  })

  it('returns days ago', () => {
    expect(formatRelativeTime('2024-06-10T12:00:00Z')).toBe('5d ago')
  })

  it('returns locale date for old dates', () => {
    const result = formatRelativeTime('2024-01-01T00:00:00Z')
    expect(result).toBeTruthy()
    expect(result).not.toBe('-')
  })
})

describe('formatDateTime', () => {
  it('formats a date string to locale string', () => {
    const result = formatDateTime('2024-06-15T12:00:00Z')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('toDateTimeLocal', () => {
  it('formats a date as a local datetime-local string', () => {
    const date = new Date(2026, 1, 15, 9, 5) // Feb 15, 2026, 09:05 local
    expect(toDateTimeLocal(date)).toBe('2026-02-15T09:05')
  })

  it('pads single-digit months, days, hours, minutes', () => {
    const date = new Date(2026, 0, 3, 2, 7) // Jan 3, 2026, 02:07 local
    expect(toDateTimeLocal(date)).toBe('2026-01-03T02:07')
  })
})

describe('parseUserAgent', () => {
  it('detects Chrome', () => {
    expect(
      parseUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ),
    ).toBe('Chrome')
  })

  it('detects Firefox', () => {
    expect(
      parseUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      ),
    ).toBe('Firefox')
  })

  it('detects Safari', () => {
    expect(
      parseUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      ),
    ).toBe('Safari')
  })

  it('detects Edge', () => {
    expect(parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0')).toBe('Edge')
  })

  it('truncates unknown user agents', () => {
    const longUa = 'A'.repeat(50)
    expect(parseUserAgent(longUa)).toBe('A'.repeat(30))
  })
})
