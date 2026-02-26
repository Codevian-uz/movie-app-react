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

function resolve(locale: Locale, key: string): string {
  return getNestedValue(messages[locale], key) ?? getNestedValue(messages.uz, key) ?? key
}

export function t(key: string): string {
  return resolve(useLocaleStore.getState().locale, key)
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  return { t: (key: string) => resolve(locale, key) } as const
}
