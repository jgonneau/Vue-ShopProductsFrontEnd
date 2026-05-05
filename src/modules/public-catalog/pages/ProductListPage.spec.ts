import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ref } from 'vue'
import ProductListPage from './ProductListPage.vue'

const { useRouteMock, useRouterMock, replaceMock, usePublicProductsMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  usePublicProductsMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

vi.mock('../composables/usePublicProducts', () => ({
  usePublicProducts: usePublicProductsMock,
}))

vi.mock('../../auth/components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ query: {} })
    useRouterMock.mockReturnValue({ replace: replaceMock })
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
})
