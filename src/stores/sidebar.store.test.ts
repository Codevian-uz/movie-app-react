import { beforeEach, describe, expect, it } from 'vitest'
import { useSidebarStore } from './sidebar.store'

describe('sidebar store', () => {
  beforeEach(() => {
    useSidebarStore.setState({ open: true })
    localStorage.clear()
  })

  it('defaults to open', () => {
    expect(useSidebarStore.getState().open).toBe(true)
  })

  it('toggles sidebar state', () => {
    useSidebarStore.getState().toggle()
    expect(useSidebarStore.getState().open).toBe(false)

    useSidebarStore.getState().toggle()
    expect(useSidebarStore.getState().open).toBe(true)
  })

  it('sets open state explicitly', () => {
    useSidebarStore.getState().setOpen(false)
    expect(useSidebarStore.getState().open).toBe(false)

    useSidebarStore.getState().setOpen(true)
    expect(useSidebarStore.getState().open).toBe(true)
  })
})
