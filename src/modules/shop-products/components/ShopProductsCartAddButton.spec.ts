import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ShopProductsCartAddButton from './ShopProductsCartAddButton.vue'

vi.mock('./CartAddButton.vue', () => ({
  default: {
    name: 'CartAddButton',
    props: ['product', 'label'],
    template: '<button data-testid="cart-add-stub">{{ label }}::{{ product?.id }}</button>',
  },
}))

describe('ShopProductsCartAddButton wrapper', () => {
  const product = {
    id: 'product-1',
    name: 'Coffee Beans',
    category: 'Bean Shop',
    price: 12,
    image: 'https://example.com/image.jpg',
    description: 'Fresh roast',
  }

  it('uses default label when no label prop is provided', () => {
    render(ShopProductsCartAddButton, { props: { product } })
    expect(screen.getByTestId('cart-add-stub')).toHaveTextContent('Add to cart::product-1')
  })

  it('passes custom label through to CartAddButton', () => {
    render(ShopProductsCartAddButton, { props: { product, label: 'Buy now' } })
    expect(screen.getByTestId('cart-add-stub')).toHaveTextContent('Buy now::product-1')
  })
})
