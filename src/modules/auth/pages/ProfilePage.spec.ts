import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import ProfilePage from './ProfilePage.vue'

const { updateProfileMock, useAuthStoreMock, useRouterMock, pushMock } = vi.hoisted(() => ({
  updateProfileMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
  useRouterMock: vi.fn(),
  pushMock: vi.fn(),
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

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouterMock.mockReturnValue({ push: pushMock })
  })

  it('renders current user details and pre-fills username', () => {
    useAuthStoreMock.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        username: 'shopper',
        role: 'customer',
      },
      updateProfile: updateProfileMock,
    })

    render(ProfilePage)

    expect(screen.getByText('My Profile')).toBeVisible()
    expect(screen.getByText('user@example.com')).toBeVisible()
    expect(screen.getByText('customer')).toBeVisible()
    expect(screen.getByDisplayValue('shopper')).toBeVisible()
  })

  it('submits username updates and shows success feedback', async () => {
    useAuthStoreMock.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        username: 'old-name',
        role: 'vendor',
      },
      updateProfile: updateProfileMock,
    })

    render(ProfilePage)

    await fireEvent.update(screen.getByLabelText('Username'), 'new-name')
    await fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(updateProfileMock).toHaveBeenCalledWith({ username: 'new-name' })
    expect(screen.getByText('Profile updated successfully.')).toBeVisible()
  })

  it('shows error feedback when profile update fails', async () => {
    updateProfileMock.mockRejectedValue(new Error('cannot update'))
    useAuthStoreMock.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        username: 'old-name',
        role: 'admin',
      },
      updateProfile: updateProfileMock,
    })

    render(ProfilePage)

    await fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(updateProfileMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Unable to update profile right now.')).toBeVisible()
  })

  it('does not submit when no user is loaded', async () => {
    useAuthStoreMock.mockReturnValue({
      user: null,
      updateProfile: updateProfileMock,
    })

    render(ProfilePage)

    await fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(updateProfileMock).not.toHaveBeenCalled()
  })
})
