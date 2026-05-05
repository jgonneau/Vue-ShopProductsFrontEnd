import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchApiSchemaHealth } from './schema'

const { httpGetMock, normalizeApiErrorMock } = vi.hoisted(() => ({
  httpGetMock: vi.fn(),
  normalizeApiErrorMock: vi.fn(),
}))

vi.mock('./http', () => ({
  httpClient: {
    get: httpGetMock,
  },
}))

vi.mock('./errors', () => ({
  normalizeApiError: normalizeApiErrorMock,
}))

describe('fetchApiSchemaHealth', () => {
  beforeEach(() => {
    httpGetMock.mockReset()
    normalizeApiErrorMock.mockReset()
  })

  it('returns schema key list and metadata', async () => {
    httpGetMock.mockResolvedValue({
      data: {
        openapi: '3.1.0',
        info: {
          title: 'Public API',
          version: '1.2.3',
        },
        paths: {},
      },
    })

    const result = await fetchApiSchemaHealth()

    expect(httpGetMock).toHaveBeenCalledWith('/api/schema/')
    expect(result).toEqual({
      keys: ['openapi', 'info', 'paths'],
      title: 'Public API',
      version: '1.2.3',
    })
  })

  it('normalizes and rethrows API errors', async () => {
    const apiFailure = new Error('network fail')
    const normalizedError = {
      status: 500,
      message: 'Backend unavailable',
      details: null,
    }

    httpGetMock.mockRejectedValue(apiFailure)
    normalizeApiErrorMock.mockReturnValue(normalizedError)

    await expect(fetchApiSchemaHealth()).rejects.toEqual(normalizedError)
    expect(normalizeApiErrorMock).toHaveBeenCalledWith(apiFailure)
  })
})
