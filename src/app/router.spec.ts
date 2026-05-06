import { beforeEach, describe, expect, it, vi } from 'vitest'

type AuthStoreLike = {
  initializeSession: () => Promise<void>
  isAuthenticated: boolean
  userRole: 'admin' | 'vendor' | 'customer' | 'guest' | null
}

type GuardFn = (to: { meta: Record<string, unknown>; fullPath: string }) => Promise<unknown>

const { createRouterMock, createWebHistoryMock, useAuthStoreMock, guardRef } = vi.hoisted(() => ({
  createRouterMock: vi.fn(),
  createWebHistoryMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
  guardRef: {
    current: undefined as GuardFn | undefined,
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

const ensureGuard = (guard: GuardFn | undefined): GuardFn => {
  if (!guard) {
    throw new Error('Expected router guard to be registered')
  }

  return guard
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
    const guard = ensureGuard(await loadRouterGuard(authStore))

    const result = await guard({
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
    const guard = ensureGuard(await loadRouterGuard(authStore))

    const result = await guard({
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

  it('redirects unauthenticated users away from vendor page to login', async () => {
    const authStore = createAuthStore({
      isAuthenticated: false,
      userRole: null,
    })
    const guard = ensureGuard(await loadRouterGuard(authStore))

    const result = await guard({
      meta: {
        requiresAuth: true,
        roles: ['vendor', 'admin'],
      },
      fullPath: '/vendor',
    })

    expect(authStore.initializeSession).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      name: 'login',
      query: {
        redirect: '/vendor',
      },
    })
  })

  it('blocks authenticated non-vendor user from vendor page', async () => {
    const authStore = createAuthStore({
      isAuthenticated: true,
      userRole: 'customer',
    })
    const guard = ensureGuard(await loadRouterGuard(authStore))

    const result = await guard({
      meta: {
        requiresAuth: true,
        roles: ['vendor', 'admin'],
      },
      fullPath: '/vendor',
    })

    expect(authStore.initializeSession).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      name: 'home',
    })
  })
})
