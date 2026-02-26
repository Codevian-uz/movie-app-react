import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

export const router = createRouter({
  routeTree,
  // Context is provided at render time in main.tsx via RouterProvider
  context: undefined as never,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
