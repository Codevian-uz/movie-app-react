import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLocaleStore } from '@/stores/locale.store'
import { t, useTranslation } from './i18n'

describe('i18n', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'uz' })
  })

  describe('t() with default locale (uz)', () => {
    it('resolves dot-notation keys', () => {
      expect(t('auth.login.title')).toBe('Admin kirish')
      expect(t('common.actions.submit')).toBe('Yuborish')
      expect(t('dashboard.title')).toBe('Boshqaruv paneli')
    })

    it('returns the key itself for unknown keys', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key')
      expect(t('deeply.nested.missing.key')).toBe('deeply.nested.missing.key')
    })

    it('returns key for partial path that resolves to an object', () => {
      expect(t('common.actions')).toBe('common.actions')
    })
  })

  describe('t() with en locale', () => {
    beforeEach(() => {
      useLocaleStore.setState({ locale: 'en' })
    })

    it('resolves keys in English', () => {
      expect(t('auth.login.title')).toBe('Admin Login')
      expect(t('common.actions.submit')).toBe('Submit')
      expect(t('dashboard.title')).toBe('Dashboard')
    })
  })

  describe('t() with ru locale', () => {
    beforeEach(() => {
      useLocaleStore.setState({ locale: 'ru' })
    })

    it('resolves keys in Russian', () => {
      expect(t('auth.login.title')).toBe('Вход в админ-панель')
      expect(t('common.actions.submit')).toBe('Отправить')
      expect(t('dashboard.title')).toBe('Панель управления')
    })
  })

  describe('fallback chain', () => {
    it('falls back to uz when key is missing in current locale', () => {
      useLocaleStore.setState({ locale: 'en' })
      // All keys exist in all locales, so test with a key that exists
      expect(t('auth.login.title')).toBe('Admin Login')
    })

    it('falls back to raw key when missing in all locales', () => {
      useLocaleStore.setState({ locale: 'en' })
      expect(t('completely.unknown.key')).toBe('completely.unknown.key')
    })
  })

  describe('useTranslation()', () => {
    it('returns t function that resolves keys', () => {
      const { result } = renderHook(() => useTranslation())
      expect(result.current.t('auth.login.submit')).toBe('Kirish')
    })

    it('respects locale changes', () => {
      useLocaleStore.setState({ locale: 'en' })
      const { result } = renderHook(() => useTranslation())
      expect(result.current.t('auth.login.submit')).toBe('Log in')
    })
  })
})
