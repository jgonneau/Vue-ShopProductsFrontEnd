import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useMyInvoices } from './useMyInvoices'

const { useQueryMock, fetchMyInvoicesMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchMyInvoicesMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('../services/customer-api', () => ({
  fetchMyInvoices: fetchMyInvoicesMock,
}))

describe('useMyInvoices', () => {
  it('builds query options with expected key and fn', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(2)
    const options = useMyInvoices(page) as unknown as {
      queryKey: { value: unknown[] }
      queryFn: () => Promise<unknown>
      placeholderData: (previousData: unknown) => unknown
    }

    expect(options.queryKey.value).toEqual(['customer-invoices', 2])
    await options.queryFn()
    expect(fetchMyInvoicesMock).toHaveBeenCalledWith(2)
    expect(options.placeholderData({ previous: true })).toEqual({ previous: true })
  })
})
