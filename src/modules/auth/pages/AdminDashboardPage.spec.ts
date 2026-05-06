import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import AdminDashboardPage from './AdminDashboardPage.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}))

vi.mock('../components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

vi.mock('../../../shared/ui/PaginationControls.vue', () => ({
  default: {
    name: 'PaginationControls',
    template: '<div data-testid="pagination-controls" />',
  },
}))

vi.mock('../../../shared/ui/StatusBadge.vue', () => ({
  default: {
    name: 'StatusBadge',
    props: ['status'],
    template: '<span data-testid="status-badge">{{ status }}</span>',
  },
}))

const { createUserMutateAsyncMock, normalizeApiErrorMock } = vi.hoisted(() => ({
  createUserMutateAsyncMock: vi.fn(),
  normalizeApiErrorMock: vi.fn(),
}))

vi.mock('../../../shared/api/errors', () => ({
  normalizeApiError: normalizeApiErrorMock,
}))

vi.mock('../../admin/composables/useAdminResources', () => {
  const paginated = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  }
  const idleMutation = {
    mutateAsync: vi.fn(),
    isPending: ref(false),
  }

  return {
    useAdminUsers: () => ({ data: ref(paginated) }),
    useAdminStores: () => ({ data: ref(paginated) }),
    useAdminProducts: () => ({ data: ref(paginated) }),
    useAdminOrders: () => ({ data: ref(paginated) }),
    useAdminInvoices: () => ({ data: ref(paginated) }),
    useAdminLogs: () => ({ data: ref(paginated) }),
    useAdminLogStats: () => ({ data: ref({ total: 0, by_severity: [], top_sources: [] }) }),
    useCreateAdminUser: () => ({
      mutateAsync: createUserMutateAsyncMock,
      isPending: ref(false),
    }),
    useChangeAdminUserPassword: () => idleMutation,
    useDeleteAdminUser: () => idleMutation,
    useCreateAdminStore: () => idleMutation,
    useDeleteAdminStore: () => idleMutation,
    useCreateAdminProduct: () => idleMutation,
    useDeleteAdminProduct: () => idleMutation,
    useUpdateAdminProductStock: () => idleMutation,
    useActivateAdminProduct: () => idleMutation,
    useDeactivateAdminProduct: () => idleMutation,
    useCreateAdminOrder: () => idleMutation,
    useUpdateAdminOrderStatus: () => idleMutation,
    useDeleteAdminOrder: () => idleMutation,
    useCreateAdminInvoice: () => idleMutation,
    useUpdateAdminInvoiceStatus: () => idleMutation,
    useDeleteAdminInvoice: () => idleMutation,
    useBulkDeleteAdminLogs: () => idleMutation,
    useClearAdminLogsBySeverity: () => idleMutation,
  }
})

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    normalizeApiErrorMock.mockReturnValue({ message: 'Admin API error' })
  })

  it('renders admin operations sections', () => {
    render(AdminDashboardPage)

    expect(screen.getByRole('heading', { name: 'Admin Operations Console' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Users' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Stores' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Products' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Logs' })).toBeVisible()
    expect(screen.getByTestId('auth-nav')).toBeVisible()
  })

  it('creates admin user and shows success feedback', async () => {
    createUserMutateAsyncMock.mockResolvedValue({ id: 'user-1' })

    render(AdminDashboardPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'admin@example.com')
    await fireEvent.update(screen.getByLabelText('Username'), ' admin-user ')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    const createUserButton = screen.getByRole('button', { name: 'Create user' })
    await fireEvent.submit(createUserButton.closest('form') as HTMLFormElement)

    expect(createUserMutateAsyncMock).toHaveBeenCalledWith({
      email: 'admin@example.com',
      username: 'admin-user',
      password: 'secret',
      role: 'customer',
      is_staff: false,
      is_superuser: false,
      is_active: true,
    })
    expect(await screen.findByText('Admin user created.')).toBeVisible()
  })

  it('shows API error feedback when creating admin user fails', async () => {
    createUserMutateAsyncMock.mockRejectedValue(new Error('create failed'))
    normalizeApiErrorMock.mockReturnValue({ message: 'Email already exists.' })

    render(AdminDashboardPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'admin@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    const createUserButton = screen.getByRole('button', { name: 'Create user' })
    await fireEvent.submit(createUserButton.closest('form') as HTMLFormElement)

    expect(await screen.findByText('Email already exists.')).toBeVisible()
  })
})
