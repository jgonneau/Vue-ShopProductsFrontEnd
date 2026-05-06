// CustomerJourney customer journey spec that walks
// through orders, invoices, and account security pages

/*
What it validates: 

End-to-end flow across customer pages:

CustomerOrdersPage:
  - user fills order form
  - order is created with expected payload
CustomerInvoicesPage:
  - invoice list is visible in the same journey
AccountSecurityPage:
  - password change succeeds
  - account deletion with DELETE succeeds
  - logout and redirect to home occur
*/

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import CustomerOrdersPage from './CustomerOrdersPage.vue'
import CustomerInvoicesPage from './CustomerInvoicesPage.vue'
import AccountSecurityPage from './AccountSecurityPage.vue'

const {
  useRouteMock,
  useRouterMock,
  replaceMock,
  useMyOrdersMock,
  usePublicStoresMock,
  useStoreProductsMock,
  useCreateOrderMock,
  useMyInvoicesMock,
  useAuthStoreMock,
  mutateAsyncMock,
  changePasswordMock,
  deleteAccountMock,
  logoutMock,
  normalizeApiErrorMock,
  routeQueryState,
} = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  useMyOrdersMock: vi.fn(),
  usePublicStoresMock: vi.fn(),
  useStoreProductsMock: vi.fn(),
  useCreateOrderMock: vi.fn(),
  useMyInvoicesMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  changePasswordMock: vi.fn(),
  deleteAccountMock: vi.fn(),
  logoutMock: vi.fn(),
  normalizeApiErrorMock: vi.fn(),
  routeQueryState: { current: {} as Record<string, string> },
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
}))

vi.mock('../../public-catalog/composables/usePublicStores', () => ({
  usePublicStores: usePublicStoresMock,
}))

vi.mock('../composables/useMyOrders', () => ({
  useMyOrders: useMyOrdersMock,
}))

vi.mock('../composables/useStoreProducts', () => ({
  useStoreProducts: useStoreProductsMock,
}))

vi.mock('../composables/useCreateOrder', () => ({
  useCreateOrder: useCreateOrderMock,
}))

vi.mock('../composables/useMyInvoices', () => ({
  useMyInvoices: useMyInvoicesMock,
}))

vi.mock('../../auth/stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

vi.mock('../services/customer-api', () => ({
  changePassword: changePasswordMock,
  deleteAccount: deleteAccountMock,
}))

vi.mock('../../../shared/api/errors', () => ({
  normalizeApiError: normalizeApiErrorMock,
}))

vi.mock('../../auth/components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

vi.mock('../../../shared/ui/StatusBadge.vue', () => ({
  default: {
    name: 'StatusBadge',
    props: ['status'],
    template: '<span data-testid="status-badge">{{ status }}</span>',
  },
}))

describe('Customer journey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeQueryState.current = {}

    useRouteMock.mockImplementation(() => ({
      query: routeQueryState.current,
    }))

    useRouterMock.mockReturnValue({
      replace: replaceMock,
    })

    useMyOrdersMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'order-1',
            reference: 'ORD-1',
            store_name: 'Bean Shop',
            total: '12.00',
            product_count: 1,
            status: 'pending',
          },
        ],
      }),
    })

    usePublicStoresMock.mockReturnValue({
      data: ref({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 'store-1', name: 'Bean Shop', city: 'Paris', country: 'France' }],
      }),
    })

    useStoreProductsMock.mockReturnValue({
      data: ref({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 'product-1', title: 'Coffee', price: '12.00' }],
      }),
    })

    useCreateOrderMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: ref(false),
    })

    useMyInvoicesMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'inv-1',
            reference: 'INV-1',
            store_name: 'Bean Shop',
            total: '12.00',
            status: 'paid',
          },
        ],
      }),
    })

    useAuthStoreMock.mockReturnValue({
      logout: logoutMock,
    })

    normalizeApiErrorMock.mockReturnValue({
      message: 'API error',
    })
  })

  it('supports orders, invoices, and account security flow', async () => {
    routeQueryState.current = { ordersPage: '1', storesPage: '1', productsPage: '1' }
    render(CustomerOrdersPage)

    expect(screen.getByText('My Orders')).toBeVisible()
    await fireEvent.update(screen.getByLabelText('Order reference'), 'ORD-2026-900')
    await fireEvent.update(screen.getByLabelText('Store'), 'store-1')
    await fireEvent.update(screen.getByLabelText('Products (multiple)'), ['product-1'])
    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      reference: 'ORD-2026-900',
      store: 'store-1',
      products: ['product-1'],
    })

    routeQueryState.current = { page: '1' }
    render(CustomerInvoicesPage)
    expect(screen.getByText('My Invoices')).toBeVisible()
    expect(screen.getByText('INV-1')).toBeVisible()

    changePasswordMock.mockResolvedValue({ detail: 'ok' })
    deleteAccountMock.mockResolvedValue(undefined)
    logoutMock.mockResolvedValue(undefined)

    render(AccountSecurityPage)
    expect(screen.getByText('Account Security')).toBeVisible()

    const passwordFields = screen.getAllByLabelText('Current password')

    await fireEvent.update(passwordFields[0], 'old-pass')
    await fireEvent.update(screen.getByLabelText('New password'), 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirm new password'), 'new-pass')
    await fireEvent.click(screen.getByRole('button', { name: 'Change password' }))
    expect(changePasswordMock).toHaveBeenCalledTimes(1)

    await fireEvent.update(passwordFields[1], 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirmation text'), 'DELETE')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))
    expect(deleteAccountMock).toHaveBeenCalledWith({ password: 'new-pass' })
    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith({ name: 'home' })
  })
})
