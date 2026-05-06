import { describe, expect, it } from 'vitest'
import { getApiErrorMessageByStatus, isTransientApiError } from './error-map'

describe('error-map', () => {
  it('returns mapped status messages', () => {
    expect(getApiErrorMessageByStatus(401)).toBe('Your session has expired. Please sign in again.')
    expect(getApiErrorMessageByStatus(404)).toBe('The requested resource was not found.')
  })

  it('returns fallback message for unknown status', () => {
    expect(getApiErrorMessageByStatus(418)).toBe('Unexpected API error')
  })

  it('returns network fallback when status is missing', () => {
    expect(getApiErrorMessageByStatus()).toBe(
      'Network issue detected. Please check your connection and retry.',
    )
  })

  it('treats network and 5xx and 429 as transient', () => {
    expect(isTransientApiError({})).toBe(true)
    expect(isTransientApiError({ response: { status: 500 } })).toBe(true)
    expect(isTransientApiError({ response: { status: 429 } })).toBe(true)
    expect(isTransientApiError({ response: { status: 400 } })).toBe(false)
  })
})
