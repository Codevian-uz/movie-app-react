import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string | null): string {
  if (dateString === null) {
    return '-'
  }

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'just now'
  }
  if (diffMin < 60) {
    return `${String(diffMin)}m ago`
  }
  if (diffHour < 24) {
    return `${String(diffHour)}h ago`
  }
  if (diffDay < 30) {
    return `${String(diffDay)}d ago`
  }
  return date.toLocaleDateString()
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

export function toDateTimeLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${String(y)}-${m}-${d}T${h}:${min}`
}

export function parseUserAgent(ua: string): string {
  if (ua.includes('Chrome')) {
    return 'Chrome'
  }
  if (ua.includes('Firefox')) {
    return 'Firefox'
  }
  if (ua.includes('Safari')) {
    return 'Safari'
  }
  if (ua.includes('Edge')) {
    return 'Edge'
  }
  return ua.slice(0, 30)
}
