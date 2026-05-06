import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useStoreProducts } from './useStoreProducts'

const { useQueryMock, fetchStoreProductsMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchStoreProductsMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('../services/customer-api', () => ({
  fetchStoreProducts: fetchStoreProductsMock,
}))

describe('useStoreProducts', () => {
  it('builds query options and enables query when store is set', async () => {
    useQueryMock.mockImplementation((options) => options)

    const storeId = ref('store-1')
    const page = ref(4)
    const options = useStoreProducts(storeId, page)

    expect(options.queryKey.value).toEqual(['store-products', 'store-1', 4])
    expect(options.enabled.value).toBe(true)
    await options.queryFn()
    expect(fetchStoreProductsMock).toHaveBeenCalledWith('store-1', 4)
  })

  it('disables query when store id is empty', () => {
    useQueryMock.mockImplementation((options) => options)

    const storeId = ref('')
    const page = ref(1)
    const options = useStoreProducts(storeId, page)

    expect(options.enabled.value).toBe(false)
  })
})
