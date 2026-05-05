import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateCurrentUser,
  verifyAccessToken,
} from './auth-api'
import type { LoginPayload, RegisterPayload, UserProfile } from '../types'

const { postMock, getMock, patchMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  getMock: vi.fn(),
  patchMock: vi.fn(),
}))

vi.mock('../../../shared/api/http', () => ({
  httpClient: {
    post: postMock,
    get: getMock,
    patch: patchMock,
  },
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

describe('auth-api service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs user in with credentials and credentials flag', async () => {
    const payload: LoginPayload = {
      email: 'user@example.com',
      password: 'secret',
    }
    const tokens = {
      access: 'access-token',
      refresh: 'refresh-token',
    }
    postMock.mockResolvedValue({ data: tokens })

    const result = await loginUser(payload)

    expect(postMock).toHaveBeenCalledWith('/api/user/login/', payload, {
      withCredentials: true,
    })
    expect(result).toEqual(tokens)
  })

  it('registers user and returns profile', async () => {
    const payload: RegisterPayload = {
      email: 'new@example.com',
      username: 'new-user',
      password: 'secret',
      password_confirm: 'secret',
    }
    const profile = buildUserProfile({ email: 'new@example.com', username: 'new-user' })
    postMock.mockResolvedValue({ data: profile })

    const result = await registerUser(payload)

    expect(postMock).toHaveBeenCalledWith('/api/user/register/', payload)
    expect(result).toEqual(profile)
  })

  it('refreshes access token with credentials flag', async () => {
    const refreshed = { access: 'fresh-token' }
    postMock.mockResolvedValue({ data: refreshed })

    const result = await refreshAccessToken()

    expect(postMock).toHaveBeenCalledWith('/api/user/token/refresh/', {}, { withCredentials: true })
    expect(result).toEqual(refreshed)
  })

  it('logs user out with credentials flag', async () => {
    postMock.mockResolvedValue({ data: {} })

    await logoutUser()

    expect(postMock).toHaveBeenCalledWith('/api/user/logout/', {}, { withCredentials: true })
  })

  it('verifies provided access token', async () => {
    postMock.mockResolvedValue({ data: {} })

    await verifyAccessToken('token-to-verify')

    expect(postMock).toHaveBeenCalledWith('/api/user/token/verify/', { token: 'token-to-verify' })
  })

  it('fetches current user profile', async () => {
    const profile = buildUserProfile({ role: 'vendor' })
    getMock.mockResolvedValue({ data: profile })

    const result = await fetchCurrentUser()

    expect(getMock).toHaveBeenCalledWith('/api/user/')
    expect(result).toEqual(profile)
  })

  it('updates current user profile username', async () => {
    const updated = buildUserProfile({ username: 'updated-name' })
    patchMock.mockResolvedValue({ data: updated })

    const result = await updateCurrentUser({ username: 'updated-name' })

    expect(patchMock).toHaveBeenCalledWith('/api/user/', { username: 'updated-name' })
    expect(result).toEqual(updated)
  })
})
