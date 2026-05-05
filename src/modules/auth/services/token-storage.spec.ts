import { describe, expect, it } from 'vitest'
import { clearAuthTokens, getAccessToken, setAccessToken } from './token-storage'

describe('token-storage', () => {
  it('stores and retrieves access token in memory', () => {
    clearAuthTokens()

    setAccessToken('access-token-1')

    expect(getAccessToken()).toBe('access-token-1')
  })

  it('clears in-memory access token', () => {
    setAccessToken('access-token-2')

    clearAuthTokens()

    expect(getAccessToken()).toBeNull()
  })
})
