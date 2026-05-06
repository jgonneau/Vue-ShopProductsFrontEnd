import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useOwnedProducts, useOwnedStoreProducts } from './useOwnedProducts'

const { useQueryMock, fetchOwnedProductsMock, fetchOwnedStoreProductsMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchOwnedProductsMock: vi.fn(),
  fetchOwnedStoreProductsMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('../services/vendor-api', () => ({
  fetchOwnedProducts: fetchOwnedProductsMock,
  fetchOwnedStoreProducts: fetchOwnedStoreProductsMock,
}))

describe('useOwnedProducts', () => {
  it('builds query options and calls fetchOwnedProducts', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(3)
    const options = useOwnedProducts(page)

    expect(options.queryKey.value).toEqual(['vendor-owned-products', 3])
    await options.queryFn()
    expect(fetchOwnedProductsMock).toHaveBeenCalledWith(3)
  })
})

describe('useOwnedStoreProducts', () => {
  it('builds scoped query options and calls fetchOwnedStoreProducts', async () => {
    useQueryMock.mockImplementation((options) => options)

    const storeId = ref('store-1')
    const page = ref(2)
    const options = useOwnedStoreProducts(storeId, page)

    expect(options.queryKey.value).toEqual(['vendor-store-products', 'store-1', 2])
    expect(options.enabled.value).toBe(true)
    await options.queryFn()
    expect(fetchOwnedStoreProductsMock).toHaveBeenCalledWith('store-1', 2)
  })

  it('disables query when no store id is selected', () => {
    useQueryMock.mockImplementation((options) => options)

    const storeId = ref('')
    const page = ref(1)
    const options = useOwnedStoreProducts(storeId, page)

    expect(options.enabled.value).toBe(false)
  })
})
