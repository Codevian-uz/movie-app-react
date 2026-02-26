import { beforeEach, describe, expect, it } from 'vitest'
import { useLocaleStore } from './locale.store'

describe('locale store', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'uz' })
    document.documentElement.lang = ''
    localStorage.clear()
  })

  it('has uz as default locale', () => {
    expect(useLocaleStore.getState().locale).toBe('uz')
  })

  it('sets locale to en', () => {
    useLocaleStore.getState().setLocale('en')
    expect(useLocaleStore.getState().locale).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('sets locale to ru', () => {
    useLocaleStore.getState().setLocale('ru')
    expect(useLocaleStore.getState().locale).toBe('ru')
    expect(document.documentElement.lang).toBe('ru')
  })

  it('sets locale to uz', () => {
    useLocaleStore.getState().setLocale('uz')
    expect(useLocaleStore.getState().locale).toBe('uz')
    expect(document.documentElement.lang).toBe('uz')
  })
})
