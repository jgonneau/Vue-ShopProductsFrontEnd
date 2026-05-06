import { QueryClient } from '@tanstack/vue-query'
import { isTransientApiError } from '../shared/api/error-map'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (!isTransientApiError(error)) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1_000 * 2 ** attemptIndex, 8_000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => isTransientApiError(error) && failureCount < 2,
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 4_000),
    },
  },
})
