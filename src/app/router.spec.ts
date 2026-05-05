import { beforeEach, describe, expect, it, vi } from 'vitest'

type AuthStoreLike = {
  initializeSession: () => Promise<void>
  isAuthenticated: boolean
  userRole: 'admin' | 'vendor' | 'customer' | 'guest' | null
}

const { createRouterMock, createWebHistoryMock, useAuthStoreMock, guardRef } = vi.hoisted(() => ({
  createRouterMock: vi.fn(),
  createWebHistoryMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
  guardRef: {
    current: undefined as
      | ((to: { meta: Record<string, unknown>; fullPath: string }) => Promise<unknown>)
      | undefined,
  },
}))

vi.mock('vue-router', () => ({
  createRouter: createRouterMock,
  createWebHistory: createWebHistoryMock,
}))

vi.mock('../modules/auth/stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

const loadRouterGuard = async (authStore: AuthStoreLike) => {
  vi.resetModules()
  vi.clearAllMocks()

  guardRef.current = undefined
  useAuthStoreMock.mockReturnValue(authStore)
  createRouterMock.mockReturnValue({
    beforeEach: (
      guard: (to: { meta: Record<string, unknown>; fullPath: string }) => Promise<unknown>,
    ) => {
      guardRef.current = guard
    },
  })

  await import('./router')
  return guardRef.current
}

const createAuthStore = (overrides: Partial<AuthStoreLike> = {}): AuthStoreLike => ({
  initializeSession: vi.fn().mockResolvedValue(undefined),
  isAuthenticated: false,
  userRole: null,
  ...overrides,
})

describe('router navigation guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthorized users to login and preserves redirect path', async () => {
    const authStore = createAuthStore({
      isAuthenticated: false,
    })
    const guard = await loadRouterGuard(authStore)

    const result = await guard?.({
      meta: {
        requiresAuth: true,
      },
      fullPath: '/admin',
    })

    expect(authStore.initializeSession).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      name: 'login',
      query: {
        redirect: '/admin',
      },
    })
  })

  it('blocks role-restricted routes when user role is not allowed', async () => {
    const authStore = createAuthStore({
      isAuthenticated: true,
      userRole: 'customer',
    })
    const guard = await loadRouterGuard(authStore)

    const result = await guard?.({
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
      fullPath: '/admin',
    })

    expect(authStore.initializeSession).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      name: 'home',
    })
  })
})
