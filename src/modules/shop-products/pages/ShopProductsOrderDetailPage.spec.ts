import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import ShopProductsOrderDetailPage from './ShopProductsOrderDetailPage.vue'

const { useRouteMock, useMyOrderDetailMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useMyOrderDetailMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
}))

vi.mock('../../customer/composables/useMyOrderDetail', () => ({
  useMyOrderDetail: useMyOrderDetailMock,
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

describe('ShopProductsOrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({
      params: { orderId: 'ord-1' },
    })
  })

  it('shows error state when detail request fails', () => {
    useMyOrderDetailMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(true),
      data: ref(undefined),
    })

    render(ShopProductsOrderDetailPage)

    expect(screen.getByText('Unable to load order details')).toBeVisible()
  })

  it('renders order summary, items, and status stepper', () => {
    useMyOrderDetailMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        id: 'ord-1',
        reference: 'ORD-1',
        status: 'shipped',
        created_at: '2026-05-03T00:00:00.000Z',
        total: '21.00',
        store_name: 'Bean Shop',
        invoice: 'INV-1',
        products: [
          { id: 'prod-1', title: 'Coffee Beans', reference: 'SKU-1', price: '10.00' },
          { id: 'prod-2', title: 'Mug', reference: 'SKU-2', price: '5.00' },
        ],
      }),
    })

    render(ShopProductsOrderDetailPage)

    expect(screen.getByText('ORD-1')).toBeVisible()
    expect(screen.getByText('Items')).toBeVisible()
    expect(screen.getByText('Coffee Beans')).toBeVisible()
    expect(screen.getByText('Store')).toBeVisible()
    expect(screen.getByText('Bean Shop')).toBeVisible()
    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByText('$21.00')).toBeVisible()
    expect(screen.getByText('Shipped')).toBeVisible()
  })
})
