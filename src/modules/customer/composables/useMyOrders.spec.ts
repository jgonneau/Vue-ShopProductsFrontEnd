import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useMyOrders } from './useMyOrders'

const { useQueryMock, fetchMyOrdersMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchMyOrdersMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('../services/customer-api', () => ({
  fetchMyOrders: fetchMyOrdersMock,
}))

describe('useMyOrders', () => {
  it('builds query options with expected key and fn', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(3)
    const options = useMyOrders(page) as unknown as {
      queryKey: { value: unknown[] }
      queryFn: () => Promise<unknown>
      placeholderData: (previousData: unknown) => unknown
    }

    expect(options.queryKey.value).toEqual(['customer-orders', 3])
    await options.queryFn()
    expect(fetchMyOrdersMock).toHaveBeenCalledWith(3)
    expect(options.placeholderData({ previous: true })).toEqual({ previous: true })
  })
})
