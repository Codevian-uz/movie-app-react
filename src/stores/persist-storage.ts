import { createJSONStorage, type StateStorage } from 'zustand/middleware'

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function resolveStorage(): StateStorage {
  if (typeof window !== 'undefined' && typeof window.localStorage.setItem === 'function') {
    return window.localStorage
  }
  return memoryStorage
}

export const persistStorage = createJSONStorage(resolveStorage)
