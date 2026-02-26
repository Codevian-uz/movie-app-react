import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistStorage } from './persist-storage'

export type Locale = 'en' | 'ru' | 'uz'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'uz',
      setLocale: (locale) => {
        applyLocale(locale)
        set({ locale })
      },
    }),
    {
      name: 'locale-storage',
      storage: persistStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyLocale(state.locale)
        }
      },
    },
  ),
)

// Apply locale immediately on module load to prevent mismatch
applyLocale(useLocaleStore.getState().locale)
