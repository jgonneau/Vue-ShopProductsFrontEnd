import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import AdminDashboardPage from './AdminDashboardPage.vue'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    RouterLink: RouterLinkStub,
    useRoute: () => ({
      query: {},
    }),
    useRouter: () => ({
      replace: vi.fn(),
    }),
  }
})

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
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
  const idleQuery = {
    data: ref(paginated),
    isPending: ref(false),
    isError: ref(false),
  }

  return {
    useAdminUsers: () => idleQuery,
    useAdminStores: () => idleQuery,
    useAdminProducts: () => idleQuery,
    useAdminOrders: () => idleQuery,
    useAdminInvoices: () => idleQuery,
    useAdminLogs: () => idleQuery,
    useAdminLogStats: () => ({
      data: ref({ total: 0, by_severity: [], top_sources: [] }),
      isPending: ref(false),
      isError: ref(false),
    }),
    useCreateAdminUser: () => idleMutation,
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
  it('renders admin operations sections', () => {
    render(AdminDashboardPage)

    expect(screen.getByRole('heading', { name: 'Admin Operations Console' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Users' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Stores' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Products' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Logs' })).toBeVisible()
  })
})
