import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ProductCard from './ProductCard.vue'

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
}))

vi.mock('./CartAddButton.vue', () => ({
  default: {
    name: 'ShopProductsCartAddButton',
    props: ['product', 'label'],
    template: '<button data-testid="cart-add">{{ label }}::{{ product?.id }}</button>',
  },
}))

describe('ProductCard', () => {
  it('renders product content and detail route link', () => {
    render(ProductCard, {
      props: {
        product: {
          id: 'product-1',
          name: 'Coffee Beans',
          category: 'Bean Shop',
          price: 12,
          image: 'https://example.com/image.jpg',
          tag: 'In stock',
          description: 'Fresh roast',
        },
      },
    })

    expect(screen.getByText('Coffee Beans')).toBeVisible()
    expect(screen.getByText('Bean Shop')).toBeVisible()
    expect(screen.getByText('$12')).toBeVisible()
    expect(screen.getByText('In stock')).toBeVisible()
    expect(screen.getByTestId('cart-add')).toHaveTextContent('Add to cart::product-1')

    const link = screen.getByText('Coffee Beans').closest('a')
    expect(link).not.toBeNull()
    expect(link).toHaveAttribute(
      'data-to',
      JSON.stringify({ name: 'product-detail', params: { id: 'product-1' } }),
    )
  })
})
