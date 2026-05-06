import { describe, expect, it, vi } from 'vitest'
import { useCreateOrder } from './useCreateOrder'

const { useMutationMock, useQueryClientMock, createOrderMock, invalidateQueriesMock } = vi.hoisted(
  () => ({
    useMutationMock: vi.fn(),
    useQueryClientMock: vi.fn(),
    createOrderMock: vi.fn(),
    invalidateQueriesMock: vi.fn(),
  }),
)

vi.mock('@tanstack/vue-query', () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}))

vi.mock('../services/customer-api', () => ({
  createOrder: createOrderMock,
}))

describe('useCreateOrder', () => {
  it('wires mutation to createOrder and invalidates customer orders on success', async () => {
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    })
    useMutationMock.mockImplementation((options) => options)

    const options = useCreateOrder() as unknown as {
      mutationFn: unknown
      onSuccess: () => Promise<void>
    }

    expect(options.mutationFn).toBe(createOrderMock)
    await options.onSuccess()
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['customer-orders'] })
  })
})
