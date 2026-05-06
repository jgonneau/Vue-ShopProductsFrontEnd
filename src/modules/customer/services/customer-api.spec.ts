import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  changePassword,
  createOrder,
  deleteAccount,
  fetchMyInvoices,
  fetchMyOrders,
  fetchStoreProducts,
} from './customer-api'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('../../../shared/api/http', () => ({
  httpClient: {
    get: getMock,
    post: postMock,
  },
}))

describe('customer-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches paginated customer orders', async () => {
    const response = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: response })

    const result = await fetchMyOrders(2)

    expect(getMock).toHaveBeenCalledWith('/api/orders/', { params: { page: 2 } })
    expect(result).toEqual(response)
  })

  it('creates an order', async () => {
    const payload = { reference: 'ORD-1', store: 'store-1', products: ['product-1'] }
    const response = { id: 'order-1', ...payload }
    postMock.mockResolvedValue({ data: response })

    const result = await createOrder(payload)

    expect(postMock).toHaveBeenCalledWith('/api/orders/', payload)
    expect(result).toEqual(response)
  })

  it('fetches paginated customer invoices', async () => {
    const response = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: response })

    const result = await fetchMyInvoices(3)

    expect(getMock).toHaveBeenCalledWith('/api/invoices/', { params: { page: 3 } })
    expect(result).toEqual(response)
  })

  it('fetches paginated store products', async () => {
    const response = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: response })

    const result = await fetchStoreProducts('store-7', 4)

    expect(getMock).toHaveBeenCalledWith('/api/products/store/store-7/', { params: { page: 4 } })
    expect(result).toEqual(response)
  })

  it('changes password', async () => {
    const payload = {
      old_password: 'old-secret',
      new_password: 'new-secret',
      new_password_confirm: 'new-secret',
    }
    const response = { detail: 'Password changed' }
    postMock.mockResolvedValue({ data: response })

    const result = await changePassword(payload)

    expect(postMock).toHaveBeenCalledWith('/api/user/change-password/', payload)
    expect(result).toEqual(response)
  })

  it('deletes account', async () => {
    const payload = { password: 'secret' }
    postMock.mockResolvedValue({ data: {} })

    await deleteAccount(payload)

    expect(postMock).toHaveBeenCalledWith('/api/user/delete/', payload)
  })
})
