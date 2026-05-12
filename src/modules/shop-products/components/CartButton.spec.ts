import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import CartButton from './CartButton.vue'

const { useCartMock, setOpenMock, cartState } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
  setOpenMock: vi.fn(),
  cartState: {
    count: { value: 0 },
    setOpen: vi.fn(),
  },
}))

vi.mock('../composables/useCart', () => ({
  useCart: useCartMock,
}))

describe('CartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cartState.count.value = 0
    cartState.setOpen = setOpenMock
    useCartMock.mockReturnValue(cartState)
  })

  it('opens cart sheet when clicked', async () => {
    render(CartButton)
    await fireEvent.click(screen.getByRole('button', { name: /cart/i }))
    expect(setOpenMock).toHaveBeenCalledWith(true)
  })

  it('only renders count badge when count is positive', () => {
    const first = render(CartButton)
    expect(first.queryByText('0')).toBeNull()
    first.unmount()

    cartState.count.value = 2
    render(CartButton)
    expect(screen.getByText('2')).toBeVisible()
  })
})
