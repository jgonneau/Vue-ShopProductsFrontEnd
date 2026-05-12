import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import RegisterPage from './RegisterPage.vue'

const { useRouterMock, pushMock, registerMock, useAuthStoreMock } = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  pushMock: vi.fn(),
  registerMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    RouterLink: RouterLinkStub,
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouterMock.mockReturnValue({ push: pushMock })
    useAuthStoreMock.mockReturnValue({ register: registerMock })
  })

  it('submits valid registration payload and redirects to profile', async () => {
    render(RegisterPage)

    await fireEvent.update(screen.getByLabelText('Email'), '  new@example.com  ')
    await fireEvent.update(screen.getByLabelText('Username'), ' new-user ')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.update(screen.getByLabelText('Confirm password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(registerMock).toHaveBeenCalledWith({
      email: 'new@example.com',
      username: 'new-user',
      password: 'secret',
      password_confirm: 'secret',
    })
    expect(pushMock).toHaveBeenCalledWith({ name: 'profile' })
  })

  it('does not submit when passwords do not match', async () => {
    render(RegisterPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'new@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.update(screen.getByLabelText('Confirm password'), 'different')
    await fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(registerMock).not.toHaveBeenCalled()
    expect(screen.getByText('Passwords do not match.')).toBeVisible()
  })

  it('shows API failure message when registration fails', async () => {
    registerMock.mockRejectedValue(new Error('registration failed'))

    render(RegisterPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'new@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.update(screen.getByLabelText('Confirm password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(pushMock).not.toHaveBeenCalled()
    expect(
      screen.getByText('Unable to register user. Check your data and try again.'),
    ).toBeVisible()
  })
})
