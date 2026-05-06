import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createOwnedStore,
  createProductForStore,
  fetchOwnedProducts,
  fetchOwnedStoreProducts,
  fetchOwnedStores,
} from './vendor-api'

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

describe('vendor-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches owned stores with pagination params', async () => {
    const payload = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchOwnedStores(2)

    expect(getMock).toHaveBeenCalledWith('/api/stores/mystore/', { params: { page: 2 } })
    expect(result).toEqual(payload)
  })

  it('creates an owned store', async () => {
    const storePayload = { name: 'Store 1', city: 'Paris', country: 'France' }
    const response = { id: 'store-1', ...storePayload }
    postMock.mockResolvedValue({ data: response })

    const result = await createOwnedStore(storePayload)

    expect(postMock).toHaveBeenCalledWith('/api/stores/mystore/', storePayload)
    expect(result).toEqual(response)
  })

  it('fetches all owned products with pagination params', async () => {
    const payload = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchOwnedProducts(3)

    expect(getMock).toHaveBeenCalledWith('/api/products/myproducts/', { params: { page: 3 } })
    expect(result).toEqual(payload)
  })

  it('fetches owned products scoped to a store', async () => {
    const payload = { count: 1, next: null, previous: null, results: [] }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchOwnedStoreProducts('store-7', 4)

    expect(getMock).toHaveBeenCalledWith('/api/products/myproducts/fromstore/store-7/', {
      params: { page: 4 },
    })
    expect(result).toEqual(payload)
  })

  it('creates product for selected store', async () => {
    const productPayload = {
      reference: 'PROD-1',
      title: 'Coffee',
      description: 'Fresh roast',
      price: '10.00',
      stock_quantity: 4,
      activated: true,
    }
    const response = { id: 'product-1', ...productPayload }
    postMock.mockResolvedValue({ data: response })

    const result = await createProductForStore('store-1', productPayload)

    expect(postMock).toHaveBeenCalledWith(
      '/api/products/myproducts/fromstore/store-1/',
      productPayload,
    )
    expect(result).toEqual(response)
  })
})
