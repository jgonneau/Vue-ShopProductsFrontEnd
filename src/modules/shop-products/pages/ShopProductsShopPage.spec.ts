import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import ShopProductsShopPage from './ShopProductsShopPage.vue'

const { usePublicProductsMock } = vi.hoisted(() => ({
  usePublicProductsMock: vi.fn(),
}))

vi.mock('../../public-catalog/composables/usePublicProducts', () => ({
  usePublicProducts: usePublicProductsMock,
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

vi.mock('../components/ProductCard.vue', () => ({
  default: {
    name: 'ProductCard',
    props: ['product', 'index'],
    template: '<article data-testid="product-card">{{ product.name }}::{{ index }}</article>',
  },
}))

describe('ShopProductsShopPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while products are pending', () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(ShopProductsShopPage)

    expect(screen.getByText('Loading products...')).toBeVisible()
  })

  it('filters, sorts, and resets products list', async () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        next: null,
        previous: null,
        results: [
          {
            id: 'p1',
            title: 'Zeta Chair',
            description: 'desc',
            price: '300',
            in_stock: true,
            store: 'store-1',
            store_name: 'Furniture',
          },
          {
            id: 'p2',
            title: 'Alpha Lamp',
            description: 'desc',
            price: '80',
            in_stock: true,
            store: 'store-1',
            store_name: 'Lighting',
          },
        ],
      }),
    })

    render(ShopProductsShopPage)

    expect(screen.getAllByTestId('product-card')).toHaveLength(2)
    expect(screen.getByText('Zeta Chair::0')).toBeVisible()
    expect(screen.getByText('Alpha Lamp::1')).toBeVisible()

    await fireEvent.update(screen.getByLabelText('Sort'), 'low')
    const sortedCards = screen.getAllByTestId('product-card')
    expect(sortedCards[0]).toHaveTextContent('Alpha Lamp')
    expect(sortedCards[1]).toHaveTextContent('Zeta Chair')

    await fireEvent.update(screen.getByPlaceholderText('Linen, brass, suede...'), 'lamp')
    expect(screen.queryByText('Zeta Chair::0')).toBeNull()
    expect(screen.getAllByTestId('product-card')).toHaveLength(1)

    await fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(screen.getAllByTestId('product-card')).toHaveLength(2)
  })
})
