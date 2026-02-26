import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import { ApiException } from '@/types/api.types'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          toast.error(t('common.errors.networkError'), { id: 'network-error' })
        } else {
          toast.error(error.message, {
            description: error.traceId !== '' ? `Trace: ${error.traceId}` : undefined,
          })
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiException && error.isNetworkError) {
          return false
        }
        if ('statusCode' in error && typeof error.statusCode === 'number') {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            return false
          }
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: false,
    },
  },
})
