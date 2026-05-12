import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import ShopProductsAdminPage from './ShopProductsAdminPage.vue'

const { useAdminOrdersMock, useAdminProductsMock, useAdminUsersMock } = vi.hoisted(() => ({
  useAdminOrdersMock: vi.fn(),
  useAdminProductsMock: vi.fn(),
  useAdminUsersMock: vi.fn(),
}))

vi.mock('../../admin/composables/useAdminResources', () => ({
  useAdminOrders: useAdminOrdersMock,
  useAdminProducts: useAdminProductsMock,
  useAdminUsers: useAdminUsersMock,
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

describe('ShopProductsAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state when one analytics query is pending', () => {
    useAdminOrdersMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })
    useAdminProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({ results: [] }),
    })
    useAdminUsersMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({ results: [] }),
    })

    render(ShopProductsAdminPage)

    expect(screen.getByText('Loading admin analytics...')).toBeVisible()
  })

  it('renders KPI cards and top sellers from analytics data', () => {
    useAdminOrdersMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        results: [
          {
            id: 'ord-1',
            reference: 'ORD-1',
            customer_email: 'a@example.com',
            status: 'processing',
            total: '25.5',
          },
          {
            id: 'ord-2',
            reference: 'ORD-2',
            customer_email: 'b@example.com',
            status: 'shipped',
            total: '10',
          },
        ],
      }),
    })
    useAdminProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        results: [
          { id: 'p1', title: 'Coffee Beans', stock_quantity: 9, price: '5' },
          { id: 'p2', title: 'Green Tea', stock_quantity: 3, price: '7' },
        ],
      }),
    })
    useAdminUsersMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        results: [
          { id: 'u1', role: 'customer' },
          { id: 'u2', role: 'customer' },
          { id: 'u3', role: 'vendor' },
        ],
      }),
    })

    render(ShopProductsAdminPage)

    expect(screen.getByText('Dashboard')).toBeVisible()
    expect(screen.getByText('$35.5')).toBeVisible()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('66.7%')).toBeVisible()
    expect(screen.getByText('Top sellers')).toBeVisible()
    expect(screen.getByText('Coffee Beans')).toBeVisible()
    expect(screen.getByText('$45 - 9 units')).toBeVisible()
    expect(screen.getByText('ORD-1')).toBeVisible()
  })
})
