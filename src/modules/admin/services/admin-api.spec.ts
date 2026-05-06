import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bulkDeleteAdminLogs,
  clearAdminLogsBySeverity,
  createAdminUser,
  deleteAdminStore,
  fetchAdminLogStats,
  fetchAdminLogs,
  fetchAdminOrders,
  fetchAdminUsers,
  updateAdminOrderStatus,
} from './admin-api'

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}))

vi.mock('../../../shared/api/http', () => ({
  httpClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}))

describe('admin-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches admin users with pagination params', async () => {
    const payload = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchAdminUsers(2)

    expect(getMock).toHaveBeenCalledWith('/api/admin/user/', { params: { page: 2 } })
    expect(result).toEqual(payload)
  })

  it('creates admin user', async () => {
    const payload = {
      email: 'admin@example.com',
      username: 'admin-user',
      password: 'secret',
      role: 'admin',
    }
    postMock.mockResolvedValue({ data: { id: 'user-1', ...payload } })

    const result = await createAdminUser(payload)

    expect(postMock).toHaveBeenCalledWith('/api/admin/user/', payload)
    expect(result).toEqual({ id: 'user-1', ...payload })
  })

  it('fetches admin orders with filter params', async () => {
    const payload = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchAdminOrders(3, { status: 'pending', store: 'store-1' })

    expect(getMock).toHaveBeenCalledWith('/api/admin/orders/', {
      params: { page: 3, status: 'pending', store: 'store-1' },
    })
    expect(result).toEqual(payload)
  })

  it('updates admin order status', async () => {
    const payload = { id: 'order-1', status: 'shipped' }
    patchMock.mockResolvedValue({ data: payload })

    const result = await updateAdminOrderStatus('order-1', 'shipped')

    expect(patchMock).toHaveBeenCalledWith('/api/admin/orders/order-1/status/', {
      status: 'shipped',
    })
    expect(result).toEqual(payload)
  })

  it('deletes admin store by id', async () => {
    deleteMock.mockResolvedValue({ data: {} })

    await deleteAdminStore('store-1')

    expect(deleteMock).toHaveBeenCalledWith('/api/admin/stores/store-1/')
  })

  it('fetches logs and log stats', async () => {
    const logsPayload = { count: 1, next: null, previous: null, results: [] }
    const statsPayload = { total: 1, by_severity: [], top_sources: [] }
    getMock
      .mockResolvedValueOnce({ data: logsPayload })
      .mockResolvedValueOnce({ data: statsPayload })

    const logs = await fetchAdminLogs(4, { severity: 'error', source: 'api.admin' })
    const stats = await fetchAdminLogStats()

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/admin/logs/', {
      params: { page: 4, severity: 'error', source: 'api.admin' },
    })
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/admin/logs/stats/')
    expect(logs).toEqual(logsPayload)
    expect(stats).toEqual(statsPayload)
  })

  it('bulk deletes and clears logs by severity', async () => {
    postMock
      .mockResolvedValueOnce({ data: { deleted_count: 2 } })
      .mockResolvedValueOnce({ data: { deleted_count: 3, severity: 'error' } })

    const bulkResult = await bulkDeleteAdminLogs(['log-1', 'log-2'])
    const clearResult = await clearAdminLogsBySeverity('error')

    expect(postMock).toHaveBeenNthCalledWith(1, '/api/admin/logs/bulk-delete/', {
      ids: ['log-1', 'log-2'],
    })
    expect(postMock).toHaveBeenNthCalledWith(2, '/api/admin/logs/clear-by-severity/', {
      severity: 'error',
    })
    expect(bulkResult).toEqual({ deleted_count: 2 })
    expect(clearResult).toEqual({ deleted_count: 3, severity: 'error' })
  })
})
