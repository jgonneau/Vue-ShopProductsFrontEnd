import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import ProductDetailPage from './ProductDetailPage.vue'

const { useRouteMock, usePublicProductDetailMock, mapPublicProductToProductMock } = vi.hoisted(
  () => ({
    useRouteMock: vi.fn(),
    usePublicProductDetailMock: vi.fn(),
    mapPublicProductToProductMock: vi.fn(),
  }),
)

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

vi.mock('../composables/usePublicProductDetail', () => ({
  usePublicProductDetail: usePublicProductDetailMock,
}))

vi.mock('../../shop-products/product-mapper', () => ({
  mapPublicProductToProduct: mapPublicProductToProductMock,
}))

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
  },
}))

vi.mock('../../shop-products/components/ShopProductsCartAddButton.vue', () => ({
  default: {
    name: 'ShopProductsCartAddButton',
    props: ['product', 'label'],
    template: '<button data-testid="cart-add">{{ label }}::{{ product?.id }}</button>',
  },
}))

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ params: { id: 'product-1' } })
    mapPublicProductToProductMock.mockReturnValue({
      id: 'product-1',
      name: 'Coffee Beans',
      category: 'Bean Shop',
      price: 12,
      image: 'https://example.com/image.jpg',
      description: 'Fresh roast',
      store: 'store-1',
    })
  })

  it('shows loading state while product detail query is pending', () => {
    usePublicProductDetailMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(ProductDetailPage)

    expect(screen.getByText('Loading product details...')).toBeVisible()
  })

  it('renders product details and wires add-to-cart component with mapped product', () => {
    usePublicProductDetailMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        id: 'product-1',
        reference: 'SKU-1',
        title: 'Coffee Beans',
        description: 'Fresh roast',
        price: '12.00',
        in_stock: true,
        store: 'store-1',
        store_name: 'Bean Shop',
      }),
    })

    render(ProductDetailPage)

    expect(screen.getByText('Coffee Beans')).toBeVisible()
    expect(screen.getByText('SKU-1')).toBeVisible()
    expect(screen.getByTestId('cart-add')).toHaveTextContent('Add to cart::product-1')
    expect(mapPublicProductToProductMock).toHaveBeenCalledTimes(1)
  })
})
