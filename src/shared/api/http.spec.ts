import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  createMock,
  getAccessTokenMock,
  setAccessTokenMock,
  clearAuthTokensMock,
  refreshPostMock,
  httpRequestMock,
  requestInterceptorRef,
  responseErrorInterceptorRef,
} = vi.hoisted(() => ({
  createMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
  setAccessTokenMock: vi.fn(),
  clearAuthTokensMock: vi.fn(),
  refreshPostMock: vi.fn(),
  httpRequestMock: vi.fn(),
  requestInterceptorRef: {
    current: undefined as ((config: { headers: Record<string, string> }) => unknown) | undefined,
  },
  responseErrorInterceptorRef: {
    current: undefined as ((error: unknown) => Promise<unknown>) | undefined,
  },
}))

vi.mock('axios', () => ({
  default: {
    create: createMock,
  },
}))

vi.mock('../../modules/auth/services/token-storage', () => ({
  getAccessToken: getAccessTokenMock,
  setAccessToken: setAccessTokenMock,
  clearAuthTokens: clearAuthTokensMock,
}))

const loadHttpModule = async () => {
  vi.resetModules()
  vi.clearAllMocks()

  requestInterceptorRef.current = undefined
  responseErrorInterceptorRef.current = undefined

  createMock
    .mockImplementationOnce(() => ({
      interceptors: {
        request: {
          use: (handler: (config: { headers: Record<string, string> }) => unknown) => {
            requestInterceptorRef.current = handler
          },
        },
        response: {
          use: (_success: unknown, errorHandler: (error: unknown) => Promise<unknown>) => {
            responseErrorInterceptorRef.current = errorHandler
          },
        },
      },
      request: httpRequestMock,
    }))
    .mockImplementationOnce(() => ({
      post: refreshPostMock,
    }))

  await import('./http')
}

describe('http client auth interceptors', () => {
  beforeEach(async () => {
    await loadHttpModule()
  })

  it('adds bearer token to outgoing requests', () => {
    getAccessTokenMock.mockReturnValue('existing-token')

    const requestInterceptor = requestInterceptorRef.current
    expect(requestInterceptor).toBeTypeOf('function')

    const requestConfig: { headers: Record<string, string> } = {
      headers: {},
    }
    requestInterceptor?.(requestConfig)

    expect(requestConfig.headers.Authorization).toBe('Bearer existing-token')
  })

  it('refreshes expired access token and retries transparently', async () => {
    refreshPostMock.mockResolvedValue({
      data: {
        access: 'fresh-access-token',
      },
    })
    httpRequestMock.mockResolvedValue({
      data: {
        ok: true,
      },
    })

    const responseErrorInterceptor = responseErrorInterceptorRef.current
    expect(responseErrorInterceptor).toBeTypeOf('function')

    const originalRequest = {
      url: '/api/user/',
      headers: {},
    }

    const result = await responseErrorInterceptor?.({
      response: {
        status: 401,
      },
      config: originalRequest,
    })

    expect(refreshPostMock).toHaveBeenCalledWith('/api/user/token/refresh/', {})
    expect(setAccessTokenMock).toHaveBeenCalledWith('fresh-access-token')
    expect(httpRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/user/',
        _retry: true,
      }),
    )
    expect(result).toEqual({
      data: {
        ok: true,
      },
    })
  })

  it('clears auth tokens when refresh fails', async () => {
    refreshPostMock.mockRejectedValue(new Error('refresh failed'))

    const responseErrorInterceptor = responseErrorInterceptorRef.current
    expect(responseErrorInterceptor).toBeTypeOf('function')

    await expect(
      responseErrorInterceptor?.({
        response: {
          status: 401,
        },
        config: {
          url: '/api/user/',
          headers: {},
        },
      }),
    ).rejects.toBeDefined()

    expect(clearAuthTokensMock).toHaveBeenCalledTimes(1)
    expect(httpRequestMock).not.toHaveBeenCalled()
  })
})
