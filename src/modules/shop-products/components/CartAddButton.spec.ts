import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import CartAddButton from './CartAddButton.ts'

const { useCartMock, addMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
  addMock: vi.fn(),
}))

vi.mock('@/modules/shop-products/composables/useCart', () => ({
  useCart: useCartMock,
}))

describe('CartAddButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCartMock.mockReturnValue({ add: addMock })
  })

  it('adds provided product when clicked', async () => {
    const product = {
      id: 'product-1',
      name: 'Coffee Beans',
      category: 'Bean Shop',
      price: 12,
      image: 'https://example.com/image.jpg',
      description: 'Fresh roast',
    }

    render(CartAddButton, {
      props: { product, label: 'Add to cart' },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(addMock).toHaveBeenCalledWith(product)
  })
})
