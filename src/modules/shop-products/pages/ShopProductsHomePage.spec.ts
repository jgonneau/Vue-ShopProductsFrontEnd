import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import ShopProductsHomePage from './ShopProductsHomePage.vue'

const { usePublicProductsMock } = vi.hoisted(() => ({
  usePublicProductsMock: vi.fn(),
}))

vi.mock('../../public-catalog/composables/usePublicProducts', () => ({
  usePublicProducts: usePublicProductsMock,
}))

vi.mock('../components/ShopProductsHeader.vue', () => ({
  default: { name: 'ShopProductsHeader', template: '<header data-testid="header" />' },
}))

vi.mock('../components/ShopProductsFooter.vue', () => ({
  default: { name: 'ShopProductsFooter', template: '<footer data-testid="footer" />' },
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
}))

describe('ShopProductsHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while featured query is pending', () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(ShopProductsHomePage)

    expect(screen.getByText('Loading featured products...')).toBeVisible()
  })

  it('renders marquee rows and product detail links', () => {
    usePublicProductsMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        results: [
          {
            id: 'prod-1',
            title: 'Coffee Beans',
            description: 'Fresh roast',
            price: '12.00',
            in_stock: true,
            store: 'store-1',
            store_name: 'Bean Shop',
          },
        ],
      }),
    })

    const { container } = render(ShopProductsHomePage)

    expect(screen.getByText('Featured this week:')).toBeVisible()
    expect(screen.getAllByText('Coffee Beans').length).toBeGreaterThan(1)
    expect(container.querySelector('.sp-marquee-track--reverse')).not.toBeNull()

    const detailsLink = screen.getAllByText('Coffee Beans')[0].closest('a')
    expect(detailsLink).toHaveAttribute(
      'data-to',
      JSON.stringify({ name: 'product-detail', params: { id: 'prod-1' } }),
    )
  })
})
