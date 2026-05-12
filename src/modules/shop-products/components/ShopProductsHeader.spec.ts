import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import ShopProductsHeader from './ShopProductsHeader.vue'

const { useRouterMock, pushMock, useAuthStoreMock, logoutMock } = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  pushMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
  logoutMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: useRouterMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

vi.mock('../../auth/stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

vi.mock('./CartButton.vue', () => ({
  default: {
    name: 'ShopProductsCartButton',
    template: '<button data-testid="shop-products-cart-button" />',
  },
}))

describe('ShopProductsHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouterMock.mockReturnValue({ push: pushMock })
  })

  it('renders guest actions when unauthenticated', () => {
    useAuthStoreMock.mockReturnValue({
      isAuthenticated: false,
      userRole: null,
      logout: logoutMock,
    })

    render(ShopProductsHeader)

    expect(screen.getByText('Register')).toBeVisible()
    expect(screen.getByText('Login')).toBeVisible()
    expect(screen.getByTestId('shop-products-cart-button')).toBeVisible()
  })

  it('logs out and redirects home for authenticated users', async () => {
    useAuthStoreMock.mockReturnValue({
      isAuthenticated: true,
      userRole: 'admin',
      logout: logoutMock,
    })

    render(ShopProductsHeader)
    await fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith({ name: 'home' })
    expect(screen.getByText('Admin')).toBeVisible()
    expect(screen.getByText('Vendor')).toBeVisible()
  })
})
