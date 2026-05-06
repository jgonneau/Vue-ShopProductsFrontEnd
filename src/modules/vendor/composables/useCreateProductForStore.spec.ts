import { describe, expect, it, vi } from 'vitest'
import { useCreateProductForStore } from './useCreateProductForStore'

const { useMutationMock, useQueryClientMock, createProductForStoreMock, invalidateQueriesMock } =
  vi.hoisted(() => ({
    useMutationMock: vi.fn(),
    useQueryClientMock: vi.fn(),
    createProductForStoreMock: vi.fn(),
    invalidateQueriesMock: vi.fn(),
  }))

vi.mock('@tanstack/vue-query', () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}))

vi.mock('../services/vendor-api', () => ({
  createProductForStore: createProductForStoreMock,
}))

describe('useCreateProductForStore', () => {
  it('creates mutation and invalidates owned products queries', async () => {
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    })
    useMutationMock.mockImplementation((options) => options)

    const options = useCreateProductForStore()

    const payload = {
      reference: 'PROD-1',
      title: 'Coffee',
      description: 'Fresh roast',
      price: '10.00',
      stock_quantity: 4,
      activated: true,
    }

    await options.mutationFn({
      storeId: 'store-1',
      payload,
    })

    expect(createProductForStoreMock).toHaveBeenCalledWith('store-1', payload)

    await options.onSuccess(undefined, { storeId: 'store-1', payload })
    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(1, {
      queryKey: ['vendor-owned-products'],
    })
    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(2, {
      queryKey: ['vendor-store-products', 'store-1'],
    })
  })
})
