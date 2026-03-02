import en from '@/locales/en.json'
import ru from '@/locales/ru.json'
import uz from '@/locales/uz.json'
import { useLocaleStore } from '@/stores/locale.store'
import type { Locale } from '@/stores/locale.store'

interface NestedRecord {
  [key: string]: string | NestedRecord
}

const messages: Record<Locale, NestedRecord> = { en, ru, uz }

function getNestedValue(obj: NestedRecord, path: string): string | undefined {
  const keys = path.split('.')
  let current: NestedRecord | string = obj

  for (const key of keys) {
    if (typeof current !== 'object') {
      return undefined
    }
    const value: string | NestedRecord | undefined = current[key]
    if (value === undefined) {
      return undefined
    }
    current = value
  }

  return typeof current === 'string' ? current : undefined
}

function resolve(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let message = getNestedValue(messages[locale], key) ?? getNestedValue(messages.uz, key) ?? key

  if (params !== undefined) {
    Object.entries(params).forEach(([k, v]) => {
      message = message.replace(`{${k}}`, String(v))
    })
  }

  return message
}

export function t(key: string, params?: Record<string, string | number>): string {
  return resolve(useLocaleStore.getState().locale, key, params)
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  return { t: (key: string, params?: Record<string, string | number>) => resolve(locale, key, params) } as const
}
