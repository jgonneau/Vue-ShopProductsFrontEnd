import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useAdminLogs,
  useAdminOrders,
  useAdminUsers,
  useBulkDeleteAdminLogs,
  useCreateAdminUser,
} from './useAdminResources'

const {
  useQueryMock,
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  fetchAdminUsersMock,
  fetchAdminOrdersMock,
  fetchAdminLogsMock,
  createAdminUserMock,
  bulkDeleteAdminLogsMock,
} = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  fetchAdminUsersMock: vi.fn(),
  fetchAdminOrdersMock: vi.fn(),
  fetchAdminLogsMock: vi.fn(),
  createAdminUserMock: vi.fn(),
  bulkDeleteAdminLogsMock: vi.fn(),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}))

vi.mock('../services/admin-api', async () => {
  const actual = await vi.importActual('../services/admin-api')
  return {
    ...actual,
    fetchAdminUsers: fetchAdminUsersMock,
    fetchAdminOrders: fetchAdminOrdersMock,
    fetchAdminLogs: fetchAdminLogsMock,
    createAdminUser: createAdminUserMock,
    bulkDeleteAdminLogs: bulkDeleteAdminLogsMock,
  }
})

describe('useAdminResources queries', () => {
  it('builds users query key and query function', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(2)
    const options = useAdminUsers(page)

    expect(options.queryKey.value).toEqual(['admin-users', 2])
    await options.queryFn()
    expect(fetchAdminUsersMock).toHaveBeenCalledWith(2)
  })

  it('builds orders query key with filters', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(3)
    const filters = computed(() => ({ status: 'pending', customer: 'user-1' }))
    const options = useAdminOrders(page, filters)

    expect(options.queryKey.value).toEqual([
      'admin-orders',
      3,
      { status: 'pending', customer: 'user-1' },
    ])
    await options.queryFn()
    expect(fetchAdminOrdersMock).toHaveBeenCalledWith(3, { status: 'pending', customer: 'user-1' })
  })

  it('builds logs query key with filters', async () => {
    useQueryMock.mockImplementation((options) => options)

    const page = ref(4)
    const filters = computed(() => ({ severity: 'error', source: 'api.admin' }))
    const options = useAdminLogs(page, filters)

    expect(options.queryKey.value).toEqual([
      'admin-logs',
      4,
      { severity: 'error', source: 'api.admin' },
    ])
    await options.queryFn()
    expect(fetchAdminLogsMock).toHaveBeenCalledWith(4, { severity: 'error', source: 'api.admin' })
  })
})

describe('useAdminResources mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates admin-users after creating admin user', async () => {
    useQueryClientMock.mockReturnValue({ invalidateQueries: invalidateQueriesMock })
    useMutationMock.mockImplementation((options) => options)

    const options = useCreateAdminUser()

    expect(options.mutationFn).toBe(createAdminUserMock)
    await options.onSuccess()
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['admin-users'] })
  })

  it('invalidates logs and stats after bulk log delete', async () => {
    useQueryClientMock.mockReturnValue({ invalidateQueries: invalidateQueriesMock })
    useMutationMock.mockImplementation((options) => options)

    const options = useBulkDeleteAdminLogs()

    expect(options.mutationFn).toBe(bulkDeleteAdminLogsMock)
    await options.onSuccess()
    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(1, { queryKey: ['admin-logs'] })
    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(2, { queryKey: ['admin-log-stats'] })
  })
})
