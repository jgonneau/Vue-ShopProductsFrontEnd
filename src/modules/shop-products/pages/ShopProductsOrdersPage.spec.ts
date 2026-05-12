import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import ShopProductsOrdersPage from './ShopProductsOrdersPage.vue'

const { useMyOrdersMock } = vi.hoisted(() => ({
  useMyOrdersMock: vi.fn(),
}))

vi.mock('../../customer/composables/useMyOrders', () => ({
  useMyOrders: useMyOrdersMock,
}))

vi.mock('../components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header><slot /></header>',
  },
}))

vi.mock('../components/ShopProductsFooter.vue', () => ({
  default: {
    name: 'ShopProductsFooter',
    template: '<footer data-testid="shop-products-footer" />',
  },
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
}))

describe('ShopProductsOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while customer orders are pending', () => {
    useMyOrdersMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(ShopProductsOrdersPage)

    expect(screen.getByText('Loading your orders...')).toBeVisible()
  })

  it('renders in-transit stats and order detail links', () => {
    useMyOrdersMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        results: [
          {
            id: 'ord-1',
            reference: 'ORD-1',
            status: 'shipped',
            total: '12.00',
            product_count: 2,
            created_at: '2026-05-01T00:00:00.000Z',
          },
          {
            id: 'ord-2',
            reference: 'ORD-2',
            status: 'processing',
            total: '19.00',
            product_count: 1,
            created_at: '2026-05-02T00:00:00.000Z',
          },
        ],
      }),
    })

    render(ShopProductsOrdersPage)

    expect(screen.getByText('Hello, Customer!')).toBeVisible()
    expect(screen.getByText('In transit')).toBeVisible()
    expect(screen.getByText('ORD-1')).toBeVisible()

    const orderLink = screen.getByText('ORD-1').closest('a')
    expect(orderLink).toHaveAttribute(
      'data-to',
      JSON.stringify({ name: 'customer-order-detail', params: { orderId: 'ord-1' } }),
    )
  })
})
