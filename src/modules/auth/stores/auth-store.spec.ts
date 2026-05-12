import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth-store'
import type { UserProfile } from '../types'

const {
  fetchCurrentUserMock,
  loginUserMock,
  logoutUserMock,
  refreshAccessTokenMock,
  registerUserMock,
  updateCurrentUserMock,
  verifyAccessTokenMock,
  clearAuthTokensMock,
  clearCartMock,
  getAccessTokenMock,
  setAccessTokenMock,
} = vi.hoisted(() => ({
  fetchCurrentUserMock: vi.fn(),
  loginUserMock: vi.fn(),
  logoutUserMock: vi.fn(),
  refreshAccessTokenMock: vi.fn(),
  registerUserMock: vi.fn(),
  updateCurrentUserMock: vi.fn(),
  verifyAccessTokenMock: vi.fn(),
  clearAuthTokensMock: vi.fn(),
  clearCartMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
  setAccessTokenMock: vi.fn(),
}))

vi.mock('../services/auth-api', () => ({
  fetchCurrentUser: fetchCurrentUserMock,
  loginUser: loginUserMock,
  logoutUser: logoutUserMock,
  refreshAccessToken: refreshAccessTokenMock,
  registerUser: registerUserMock,
  updateCurrentUser: updateCurrentUserMock,
  verifyAccessToken: verifyAccessTokenMock,
}))

vi.mock('../services/token-storage', () => ({
  clearAuthTokens: clearAuthTokensMock,
  getAccessToken: getAccessTokenMock,
  setAccessToken: setAccessTokenMock,
}))

vi.mock('@/modules/shop-products/composables/useCart', () => ({
  useCart: () => ({
    clearCart: clearCartMock,
  }),
}))

const buildUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-1',
  email: 'user@example.com',
  username: 'shopper',
  role: 'customer',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('auth-store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getAccessTokenMock.mockReturnValue(null)
  })

  it('initializes using existing access token and hydrates user', async () => {
    const user = buildUserProfile({ role: 'admin' })
    getAccessTokenMock.mockReturnValue('existing-access')
    fetchCurrentUserMock.mockResolvedValue(user)

    const store = useAuthStore()
    await store.initializeSession()

    expect(verifyAccessTokenMock).toHaveBeenCalledWith('existing-access')
    expect(refreshAccessTokenMock).not.toHaveBeenCalled()
    expect(setAccessTokenMock).toHaveBeenCalledWith('existing-access')
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
    expect(store.userRole).toBe('admin')
    expect(store.isBootstrapped).toBe(true)
    expect(store.isLoading).toBe(false)
  })

  it('refreshes token when no access token exists', async () => {
    const user = buildUserProfile({ role: 'vendor' })
    refreshAccessTokenMock.mockResolvedValue({ access: 'refreshed-access' })
    fetchCurrentUserMock.mockResolvedValue(user)

    const store = useAuthStore()
    await store.initializeSession()

    expect(verifyAccessTokenMock).not.toHaveBeenCalled()
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1)
    expect(setAccessTokenMock).toHaveBeenCalledWith('refreshed-access')
    expect(store.user).toEqual(user)
    expect(store.isVendor).toBe(true)
  })

  it('clears session when initialization fails', async () => {
    refreshAccessTokenMock.mockRejectedValue(new Error('refresh failed'))

    const store = useAuthStore()
    await store.initializeSession()

    expect(clearAuthTokensMock).toHaveBeenCalledTimes(1)
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isBootstrapped).toBe(true)
    expect(store.isLoading).toBe(false)
  })

  it('logs in and hydrates current user', async () => {
    const user = buildUserProfile()
    loginUserMock.mockResolvedValue({ access: 'new-access', refresh: 'refresh-token' })
    fetchCurrentUserMock.mockResolvedValue(user)

    const store = useAuthStore()
    await store.login({
      email: 'user@example.com',
      password: 'secret',
    })

    expect(loginUserMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    })
    expect(setAccessTokenMock).toHaveBeenCalledWith('new-access')
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
  })

  it('registers and then logs in with provided credentials', async () => {
    registerUserMock.mockResolvedValue(buildUserProfile())
    loginUserMock.mockResolvedValue({ access: 'access-after-register', refresh: 'refresh-token' })
    fetchCurrentUserMock.mockResolvedValue(buildUserProfile({ email: 'new-user@example.com' }))

    const store = useAuthStore()
    await store.register({
      email: 'new-user@example.com',
      username: 'new-user',
      password: 'secret',
      password_confirm: 'secret',
    })

    expect(registerUserMock).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      username: 'new-user',
      password: 'secret',
      password_confirm: 'secret',
    })
    expect(loginUserMock).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      password: 'secret',
    })
  })

  it('clears session even when logout API fails', async () => {
    const store = useAuthStore()
    loginUserMock.mockResolvedValue({ access: 'access-token', refresh: 'refresh-token' })
    fetchCurrentUserMock.mockResolvedValue(buildUserProfile())
    logoutUserMock.mockRejectedValue(new Error('logout failed'))

    await store.login({
      email: 'user@example.com',
      password: 'secret',
    })
    await expect(store.logout()).rejects.toThrow('logout failed')

    expect(logoutUserMock).toHaveBeenCalledTimes(1)
    expect(clearCartMock).not.toHaveBeenCalled()
    expect(clearAuthTokensMock).toHaveBeenCalledTimes(1)
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('clears cart when logout succeeds', async () => {
    const store = useAuthStore()
    loginUserMock.mockResolvedValue({ access: 'access-token', refresh: 'refresh-token' })
    fetchCurrentUserMock.mockResolvedValue(buildUserProfile())
    logoutUserMock.mockResolvedValue(undefined)

    await store.login({
      email: 'user@example.com',
      password: 'secret',
    })
    await store.logout()

    expect(logoutUserMock).toHaveBeenCalledTimes(1)
    expect(clearCartMock).toHaveBeenCalledTimes(1)
    expect(clearAuthTokensMock).toHaveBeenCalledTimes(1)
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('updates local user after profile update', async () => {
    const updatedUser = buildUserProfile({ username: 'new-name' })
    updateCurrentUserMock.mockResolvedValue(updatedUser)

    const store = useAuthStore()
    await store.updateProfile({ username: 'new-name' })

    expect(updateCurrentUserMock).toHaveBeenCalledWith({ username: 'new-name' })
    expect(store.user).toEqual(updatedUser)
  })
})
