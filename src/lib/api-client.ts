import axios from 'axios'
import type { AxiosError } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import { ApiException } from '@/types/api.types'
import type { ApiErrorResponse } from '@/types/api.types'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Authorization and Accept-Language headers
apiClient.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = useLocaleStore.getState().locale

  const { accessToken } = useAuthStore.getState()
  if (accessToken !== null && accessToken !== '') {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Mutex for token refresh to prevent concurrent refresh attempts
let refreshPromise: Promise<void> | null = null

// Response interceptor: transform errors and handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config

    // Handle 401 — attempt token refresh
    if (
      error.response?.status === 401 &&
      originalRequest !== undefined &&
      !('_retry' in originalRequest)
    ) {
      Object.assign(originalRequest, { _retry: true })

      const { refreshToken } = useAuthStore.getState()

      if (refreshToken !== null && refreshToken !== '') {
        try {
          // Use mutex to prevent concurrent refresh attempts
          refreshPromise ??= (async () => {
            try {
              const response = await axios.post<{
                access_token: string
                refresh_token: string
                access_token_expires_at: string
                refresh_token_expires_at: string
              }>(`${env.apiBaseUrl}/v1/auth/refresh-token`, {
                refresh_token: refreshToken,
              })
              useAuthStore.getState().setAuth(response.data)
            } finally {
              refreshPromise = null
            }
          })()

          await refreshPromise

          // Retry original request with new token
          const { accessToken } = useAuthStore.getState()
          originalRequest.headers.Authorization = `Bearer ${String(accessToken)}`
          return await apiClient(originalRequest)
        } catch {
          // Refresh failed — clear auth and redirect to login
          useAuthStore.getState().clearAuth()
          window.location.href = '/admin/login'
          return Promise.reject(error)
        }
      } else {
        // No refresh token — clear auth and redirect
        useAuthStore.getState().clearAuth()
        window.location.href = '/admin/login'
        return Promise.reject(error)
      }
    }

    // Transform error responses into ApiException
    const responseData = error.response?.data
    if (responseData?.error !== undefined) {
      const { error: apiError } = responseData
      throw new ApiException({
        message: apiError.message,
        code: apiError.code,
        statusCode: error.response?.status ?? 0,
        traceId: responseData.trace_id,
        cause: apiError.cause,
        fields: apiError.fields,
        details: apiError.details,
      })
    }

    // No structured error body — network error or unexpected response
    throw new ApiException({
      message: error.message,
      code: 'NETWORK_ERROR',
      statusCode: 0,
      traceId: '',
    })
  },
)
