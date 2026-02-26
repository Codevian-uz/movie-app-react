import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 4 : 9,
  reporter: process.env['CI'] ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'parallel',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      fullyParallel: true,
      testMatch: [
        'auth.spec.ts',
        'permissions.spec.ts',
        'sessions.spec.ts',
        'audit.spec.ts',
        'platform.spec.ts',
        'app-shell.spec.ts',
      ],
    },
    {
      name: 'mutating',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      workers: 1,
      testMatch: ['users.spec.ts', 'roles.spec.ts'],
    },
  ],

  webServer: {
    command: 'pnpm build && pnpm preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
})
