import '@testing-library/jest-dom/vitest'

// If localStorage is broken (like in some CLI environments), polyfill it
if (typeof localStorage === 'undefined' || typeof localStorage.clear === 'undefined') {
  const mockStorage: Record<string, string> = {}
  const storagePolyfill = {
    getItem: (key: string): string | null => {
      const val = mockStorage[key]
      return typeof val === 'string' ? val : null
    },
    setItem: (key: string, value: string): void => {
      mockStorage[key] = value
    },
    removeItem: (key: string): void => {
      // Use cast to any to bypass no-dynamic-delete if necessary,
      // but here we can just use the key directly as it is a string.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete mockStorage[key]
    },
    clear: (): void => {
      Object.keys(mockStorage).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete mockStorage[key]
      })
    },
    key: (index: number): string | null => {
      const keys = Object.keys(mockStorage)
      const key = keys[index]
      return typeof key === 'string' ? key : null
    },
    get length(): number {
      return Object.keys(mockStorage).length
    },
  }

  Object.defineProperty(window, 'localStorage', {
    value: storagePolyfill,
    writable: true,
  })
  // Also define it on global for Node.js environment if needed
  Object.defineProperty(global, 'localStorage', {
    value: storagePolyfill,
    writable: true,
  })
}

// Mock matchMedia for components that depend on it (theme store, sidebar)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})
