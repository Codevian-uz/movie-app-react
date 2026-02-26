import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemeStore } from './theme.store'

describe('theme store', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system' })
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('has system as default theme', () => {
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('sets theme to dark', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('sets theme to light', () => {
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('respects system preference when set to system', () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    useThemeStore.getState().setTheme('system')
    expect(useThemeStore.getState().theme).toBe('system')
  })
})
