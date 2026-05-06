import { describe, expect, it } from 'vitest'
import { normalizeApiError } from './errors'

describe('normalizeApiError', () => {
  it('prefers backend detail when available', () => {
    const result = normalizeApiError({
      response: {
        status: 400,
        data: { detail: 'Email already exists.' },
      },
      message: 'Request failed',
    })

    expect(result).toEqual({
      status: 400,
      message: 'Email already exists.',
      details: { detail: 'Email already exists.' },
    })
  })

  it('falls back to mapped status message when no detail', () => {
    const result = normalizeApiError({
      response: {
        status: 403,
        data: {},
      },
      message: 'Forbidden',
    })

    expect(result.status).toBe(403)
    expect(result.message).toBe('You do not have permission to perform this action.')
  })

  it('falls back to transport error for network errors', () => {
    const result = normalizeApiError({
      message: 'Network Error',
    })

    expect(result.status).toBeUndefined()
    expect(result.message).toBe('Network Error')
  })
})
