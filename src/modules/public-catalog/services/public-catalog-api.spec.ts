import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchPublicProductById,
  fetchPublicProducts,
  fetchPublicStoreById,
  fetchPublicStores,
} from './public-catalog-api'

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}))

vi.mock('../../../shared/api/http', () => ({
  httpClient: {
    get: getMock,
  },
}))

describe('public-catalog-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests paginated products using DRF shape', async () => {
    const payload = {
      count: 24,
      next: '/api/products/?page=2',
      previous: null,
      results: [
        {
          id: 'product-1',
          reference: 'SKU-1',
          title: 'Coffee Beans',
          description: 'Roasted beans',
          price: '12.00',
          in_stock: true,
          store_name: 'Bean Shop',
        },
      ],
    }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchPublicProducts(1)

    expect(getMock).toHaveBeenCalledWith('/api/products/', {
      params: { page: 1 },
    })
    expect(result).toEqual(payload)
  })

  it('requests paginated stores using DRF shape', async () => {
    const payload = {
      count: 8,
      next: null,
      previous: '/api/stores/?page=1',
      results: [
        {
          id: 'store-2',
          name: 'North Market',
          city: 'Paris',
          country: 'France',
        },
      ],
    }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchPublicStores(2)

    expect(getMock).toHaveBeenCalledWith('/api/stores/', {
      params: { page: 2 },
    })
    expect(result).toEqual(payload)
  })

  it('fetches single product by id', async () => {
    const payload = {
      id: 'product-10',
      reference: 'SKU-10',
      title: 'Tea',
      description: 'Green tea',
      price: '6.50',
      in_stock: true,
      store_name: 'Tea House',
    }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchPublicProductById('product-10')

    expect(getMock).toHaveBeenCalledWith('/api/products/product-10/')
    expect(result).toEqual(payload)
  })

  it('fetches single store by id', async () => {
    const payload = {
      id: 'store-10',
      name: 'Tea House',
      description: 'Teas and accessories',
      phone: '+1-000-0000',
      address: '1 Main St',
      city: 'Lisbon',
      state: 'Lisbon',
      zip_code: '1000-001',
      country: 'Portugal',
    }
    getMock.mockResolvedValue({ data: payload })

    const result = await fetchPublicStoreById('store-10')

    expect(getMock).toHaveBeenCalledWith('/api/stores/store-10/')
    expect(result).toEqual(payload)
  })
})
