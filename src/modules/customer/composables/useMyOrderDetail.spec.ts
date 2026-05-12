import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useMyOrderDetail } from './useMyOrderDetail'

const { useQueryMock, fetchMyOrderByIdMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchMyOrderByIdMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('../services/customer-api', () => ({
  fetchMyOrderById: fetchMyOrderByIdMock,
}))

describe('useMyOrderDetail', () => {
  it('builds query options and calls order detail API', async () => {
    useQueryMock.mockImplementation((options) => options)

    const orderId = ref('order-42')
    const options = useMyOrderDetail(orderId) as unknown as {
      queryKey: { value: unknown[] }
      enabled: { value: boolean }
      queryFn: () => Promise<unknown>
    }

    expect(options.queryKey.value).toEqual(['customer-order-detail', 'order-42'])
    expect(options.enabled.value).toBe(true)
    await options.queryFn()
    expect(fetchMyOrderByIdMock).toHaveBeenCalledWith('order-42')
  })

  it('disables query when order id is empty', () => {
    useQueryMock.mockImplementation((options) => options)

    const orderId = ref('')
    const options = useMyOrderDetail(orderId) as unknown as {
      enabled: { value: boolean }
    }

    expect(options.enabled.value).toBe(false)
  })
})
