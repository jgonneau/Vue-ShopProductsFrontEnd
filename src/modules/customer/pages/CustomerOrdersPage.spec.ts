import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import CustomerOrdersPage from './CustomerOrdersPage.vue'

const {
  useRouteMock,
  useRouterMock,
  replaceMock,
  useMyOrdersMock,
  usePublicStoresMock,
  useStoreProductsMock,
  useCreateOrderMock,
  mutateAsyncMock,
  normalizeApiErrorMock,
} = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  useMyOrdersMock: vi.fn(),
  usePublicStoresMock: vi.fn(),
  useStoreProductsMock: vi.fn(),
  useCreateOrderMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  normalizeApiErrorMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
}))

vi.mock('../composables/useMyOrders', () => ({
  useMyOrders: useMyOrdersMock,
}))

vi.mock('../../public-catalog/composables/usePublicStores', () => ({
  usePublicStores: usePublicStoresMock,
}))

vi.mock('../composables/useStoreProducts', () => ({
  useStoreProducts: useStoreProductsMock,
}))

vi.mock('../composables/useCreateOrder', () => ({
  useCreateOrder: useCreateOrderMock,
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

describe('CustomerOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({
      query: {
        ordersPage: '1',
        storesPage: '1',
        productsPage: '1',
      },
    })
    useRouterMock.mockReturnValue({ replace: replaceMock })
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
    normalizeApiErrorMock.mockReturnValue({ message: 'API error' })
  })

  it('shows validation error when reference is missing', async () => {
    render(CustomerOrdersPage)

    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))

    expect(screen.getByText('Order reference is required.')).toBeVisible()
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('shows validation error when store is not selected', async () => {
    render(CustomerOrdersPage)

    await fireEvent.update(screen.getByLabelText('Order reference'), 'ORD-100')
    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))

    expect(screen.getByText('Select a store before creating an order.')).toBeVisible()
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('shows validation error when no product is selected', async () => {
    render(CustomerOrdersPage)

    await fireEvent.update(screen.getByLabelText('Order reference'), 'ORD-101')
    await fireEvent.update(screen.getByLabelText('Store'), 'store-1')
    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))

    expect(screen.getByText('Select at least one product.')).toBeVisible()
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('creates an order and shows success message', async () => {
    render(CustomerOrdersPage)

    await fireEvent.update(screen.getByLabelText('Order reference'), ' ORD-2026-001 ')
    await fireEvent.update(screen.getByLabelText('Store'), 'store-1')
    await fireEvent.update(screen.getByLabelText('Products (multiple)'), 'product-1')
    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      reference: 'ORD-2026-001',
      store: 'store-1',
      products: ['product-1'],
    })
    expect(screen.getByText('Order created successfully.')).toBeVisible()
  })

  it('supports customer order workflow from form to history visibility', async () => {
    render(CustomerOrdersPage)

    expect(screen.getByText('ORD-1')).toBeVisible()
    expect(screen.getByText('pending')).toBeVisible()

    await fireEvent.update(screen.getByLabelText('Order reference'), 'ORD-2026-777')
    await fireEvent.update(screen.getByLabelText('Store'), 'store-1')
    await fireEvent.update(screen.getByLabelText('Products (multiple)'), 'product-1')
    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      reference: 'ORD-2026-777',
      store: 'store-1',
      products: ['product-1'],
    })
    expect(screen.getByText('Order created successfully.')).toBeVisible()
  })

  it('shows API error message when order creation fails', async () => {
    mutateAsyncMock.mockRejectedValue(new Error('request failed'))

    render(CustomerOrdersPage)

    await fireEvent.update(screen.getByLabelText('Order reference'), 'ORD-2')
    await fireEvent.update(screen.getByLabelText('Store'), 'store-1')
    await fireEvent.update(screen.getByLabelText('Products (multiple)'), 'product-1')
    await fireEvent.click(screen.getByRole('button', { name: 'Create order' }))

    expect(screen.getByText('API error')).toBeVisible()
  })

  it('moves orders pagination to next page', async () => {
    useMyOrdersMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 2,
        next: '/api/orders/?page=2',
        previous: null,
        results: [],
      }),
    })

    render(CustomerOrdersPage)

    const nextButtons = screen.getAllByRole('button', { name: 'Next' })
    await fireEvent.click(nextButtons[2])

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'customer-orders',
      query: {
        ordersPage: '2',
        storesPage: '1',
        productsPage: '1',
      },
    })
  })
})
