import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import LoginPage from './LoginPage.vue'

const { useRouteMock, useRouterMock, pushMock, loginMock, useAuthStoreMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  pushMock: vi.fn(),
  loginMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    RouterLink: RouterLinkStub,
    useRoute: useRouteMock,
    useRouter: useRouterMock,
  }
})

vi.mock('../stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ query: {} })
    useRouterMock.mockReturnValue({ push: pushMock })
    useAuthStoreMock.mockReturnValue({ login: loginMock })
  })

  it('submits credentials and redirects to catalog', async () => {
    useRouteMock.mockReturnValue({
      query: {
        redirect: '/vendor',
      },
    })

    render(LoginPage)

    await fireEvent.update(screen.getByLabelText('Email'), '  user@example.com  ')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(loginMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    })
    expect(pushMock).toHaveBeenCalledWith({ name: 'products' })
  })

  it('always redirects to catalog even when no redirect query is set', async () => {
    render(LoginPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'user@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(pushMock).toHaveBeenCalledWith({ name: 'products' })
  })

  it('shows an error message when login fails', async () => {
    loginMock.mockRejectedValue(new Error('invalid credentials'))

    render(LoginPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'user@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'wrong-pass')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      screen.getByText('Invalid credentials. Please verify your email and password.'),
    ).toBeVisible()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
