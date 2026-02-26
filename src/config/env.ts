export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
