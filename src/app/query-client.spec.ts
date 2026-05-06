import { describe, expect, it } from 'vitest'
import { queryClient } from './query-client'

describe('query-client defaults', () => {
  it('retries transient query errors and stops after limit', () => {
    const retry = queryClient.getDefaultOptions().queries?.retry as (
      failureCount: number,
      error: unknown,
    ) => boolean

    expect(retry(0, { response: { status: 500 } })).toBe(true)
    expect(retry(2, { response: { status: 500 } })).toBe(true)
    expect(retry(3, { response: { status: 500 } })).toBe(false)
    expect(retry(0, { response: { status: 400 } })).toBe(false)
  })

  it('retries transient mutation errors and stops after limit', () => {
    const retry = queryClient.getDefaultOptions().mutations?.retry as (
      failureCount: number,
      error: unknown,
    ) => boolean

    expect(retry(0, { response: { status: 429 } })).toBe(true)
    expect(retry(1, { response: { status: 500 } })).toBe(true)
    expect(retry(2, { response: { status: 500 } })).toBe(false)
    expect(retry(0, { response: { status: 403 } })).toBe(false)
  })
})
