import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistStorage } from './persist-storage'

interface SidebarState {
  open: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      toggle: () => {
        set((state) => ({ open: !state.open }))
      },
      setOpen: (open) => {
        set({ open })
      },
    }),
    {
      name: 'sidebar-storage',
      storage: persistStorage,
    },
  ),
)
