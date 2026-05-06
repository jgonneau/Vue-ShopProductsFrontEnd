import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useCreateOwnedStore, useOwnedStores } from './useOwnedStores'

const {
  useQueryMock,
  useMutationMock,
  useQueryClientMock,
  fetchOwnedStoresMock,
  createOwnedStoreMock,
  invalidateQueriesMock,
} = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  fetchOwnedStoresMock: vi.fn(),
  createOwnedStoreMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}))

vi.mock('../services/vendor-api', () => ({
  fetchOwnedStores: fetchOwnedStoresMock,
  createOwnedStore: createOwnedStoreMock,
}))

describe('useOwnedStores', () => {
  it('builds query options and calls fetchOwnedStores', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(2)
    const options = useOwnedStores(page)

    expect(options.queryKey.value).toEqual(['vendor-owned-stores', 2])
    await options.queryFn()
    expect(fetchOwnedStoresMock).toHaveBeenCalledWith(2)
    expect(options.placeholderData({ previous: true })).toEqual({ previous: true })
  })
})

describe('useCreateOwnedStore', () => {
  it('invalidates owned stores query on success', async () => {
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    })
    useMutationMock.mockImplementation((options) => options)

    const options = useCreateOwnedStore()

    expect(options.mutationFn).toBe(createOwnedStoreMock)
    await options.onSuccess()
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['vendor-owned-stores'] })
  })
})
