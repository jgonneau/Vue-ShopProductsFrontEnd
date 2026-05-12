import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ref } from 'vue'
import ProductListPage from './ProductListPage.vue'

const { useRouteMock, useRouterMock, replaceMock, pushMock, usePublicProductsMock } = vi.hoisted(
  () => ({
    useRouteMock: vi.fn(),
    useRouterMock: vi.fn(),
    replaceMock: vi.fn(),
    pushMock: vi.fn(),
    usePublicProductsMock: vi.fn(),
  }),
)

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
}))

vi.mock('../composables/usePublicProducts', () => ({
  usePublicProducts: usePublicProductsMock,
}))

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
  },
}))

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ query: {} })
    useRouterMock.mockReturnValue({ replace: replaceMock, push: pushMock })
  })

  it('shows loading state immediately while products are pending', () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(ProductListPage)

    expect(screen.getByText('Loading products...')).toBeVisible()
  })

  it('renders paginated products and navigates to next page', async () => {
    useRouteMock.mockReturnValue({ query: { page: '1', search: 'coffee' } })
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 3,
        next: '/api/products/?page=2',
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-1',
            title: 'Coffee Beans',
            description: 'Fresh roast',
            price: '12.00',
            in_stock: true,
            store_name: 'Bean Shop',
          },
        ],
      }),
    })

    const { container } = render(ProductListPage)

    expect(screen.getByText(/Total products: 3/)).toBeVisible()
    expect(screen.getByText('Coffee Beans')).toBeVisible()
    expect(container.querySelector('.toolbar')).not.toBeNull()
    expect(container.querySelector('.catalog-grid')).not.toBeNull()

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'products',
      query: {
        page: '2',
        search: 'coffee',
      },
    })
  })

  it('renders product detail link for each catalog item', async () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-1',
            title: 'Coffee Beans',
            description: 'Fresh roast',
            price: '12.00',
            in_stock: true,
            store_name: 'Bean Shop',
          },
        ],
      }),
    })

    render(ProductListPage)

    const detailsLink = screen.getByText('View details')
    expect(detailsLink).toHaveAttribute(
      'data-to',
      JSON.stringify({ name: 'product-detail', params: { id: 'product-1' } }),
    )
  })

  it('filters products by search term across title, reference, and store', async () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-COFFEE',
            title: 'Coffee Beans',
            description: 'Fresh roast',
            price: '12.00',
            in_stock: true,
            store_name: 'Bean Shop',
          },
          {
            id: 'product-2',
            reference: 'SKU-TEA',
            title: 'Green Tea',
            description: 'Loose leaf',
            price: '9.50',
            in_stock: true,
            store_name: 'Tea House',
          },
        ],
      }),
    })

    render(ProductListPage)
    await fireEvent.update(screen.getByLabelText('Search'), 'tea house')

    expect(screen.getByText('Green Tea')).toBeVisible()
    expect(screen.queryByText('Coffee Beans')).toBeNull()
    expect(screen.getByText(/Showing 1 of 2 items on this page/)).toBeVisible()
  })

  it('sorts products by price in ascending order', async () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 3,
        next: null,
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-3',
            title: 'Item C',
            description: 'c',
            price: '30.00',
            in_stock: true,
            store_name: 'Shop',
          },
          {
            id: 'product-2',
            reference: 'SKU-1',
            title: 'Item A',
            description: 'a',
            price: '10.00',
            in_stock: true,
            store_name: 'Shop',
          },
          {
            id: 'product-3',
            reference: 'SKU-2',
            title: 'Item B',
            description: 'b',
            price: '20.00',
            in_stock: true,
            store_name: 'Shop',
          },
        ],
      }),
    })

    render(ProductListPage)
    await fireEvent.update(screen.getByLabelText('Sort'), 'price-asc')

    const orderedTitles = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent)
    expect(orderedTitles).toEqual(['Item A', 'Item B', 'Item C'])
  })

  it('shows an empty-state message when no products match filters', async () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'product-1',
            reference: 'SKU-1',
            title: 'Coffee Beans',
            description: 'Fresh roast',
            price: '12.00',
            in_stock: true,
            store_name: 'Bean Shop',
          },
        ],
      }),
    })

    render(ProductListPage)
    await fireEvent.update(screen.getByLabelText('Search'), 'does-not-match')

    expect(screen.getByText('No products found for this filter.')).toBeVisible()
  })
})
