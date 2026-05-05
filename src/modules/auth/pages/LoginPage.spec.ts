import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import LoginPage from './LoginPage.vue'

const { useRouteMock, useRouterMock, pushMock, loginMock, useAuthStoreMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  pushMock: vi.fn(),
  loginMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
}))

vi.mock('../stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

vi.mock('../components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ query: {} })
    useRouterMock.mockReturnValue({ push: pushMock })
    useAuthStoreMock.mockReturnValue({ login: loginMock })
  })

  it('submits credentials and redirects to requested path', async () => {
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
    expect(pushMock).toHaveBeenCalledWith('/vendor')
  })

  it('falls back to profile redirect after successful login', async () => {
    render(LoginPage)

    await fireEvent.update(screen.getByLabelText('Email'), 'user@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(pushMock).toHaveBeenCalledWith('/profile')
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
