import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import AccountSecurityPage from './AccountSecurityPage.vue'

const {
  useRouterMock,
  replaceMock,
  useAuthStoreMock,
  logoutMock,
  changePasswordMock,
  deleteAccountMock,
  normalizeApiErrorMock,
} = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
  logoutMock: vi.fn(),
  changePasswordMock: vi.fn(),
  deleteAccountMock: vi.fn(),
  normalizeApiErrorMock: vi.fn(),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    RouterLink: RouterLinkStub,
    useRouter: useRouterMock,
  }
})

vi.mock('../../auth/stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

vi.mock('../services/customer-api', () => ({
  changePassword: changePasswordMock,
  deleteAccount: deleteAccountMock,
}))

vi.mock('../../../shared/api/errors', () => ({
  normalizeApiError: normalizeApiErrorMock,
}))

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
  },
}))

describe('AccountSecurityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouterMock.mockReturnValue({ replace: replaceMock })
    useAuthStoreMock.mockReturnValue({ logout: logoutMock })
    normalizeApiErrorMock.mockReturnValue({ message: 'API error' })
  })

  it('blocks password change when confirmation does not match', async () => {
    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')
    await fireEvent.update(passwordFields[0], 'old-pass')
    await fireEvent.update(screen.getByLabelText('New password'), 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirm new password'), 'different-pass')
    await fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

    expect(changePasswordMock).not.toHaveBeenCalled()
    expect(screen.getByText('New password confirmation does not match.')).toBeVisible()
  })

  it('changes password and shows success message', async () => {
    changePasswordMock.mockResolvedValue({ detail: 'ok' })

    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')
    await fireEvent.update(passwordFields[0], 'old-pass')
    await fireEvent.update(screen.getByLabelText('New password'), 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirm new password'), 'new-pass')
    await fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

    expect(changePasswordMock).toHaveBeenCalledWith({
      old_password: 'old-pass',
      new_password: 'new-pass',
      new_password_confirm: 'new-pass',
    })
    expect(screen.getByText('Password changed successfully.')).toBeVisible()
  })

  it('shows API error message when password change fails', async () => {
    changePasswordMock.mockRejectedValue(new Error('cannot change password'))
    normalizeApiErrorMock.mockReturnValue({ message: 'Invalid current password.' })

    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')
    await fireEvent.update(passwordFields[0], 'wrong-old-pass')
    await fireEvent.update(screen.getByLabelText('New password'), 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirm new password'), 'new-pass')
    await fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

    expect(changePasswordMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Invalid current password.')).toBeVisible()
  })

  it('requires DELETE confirmation for account deletion', async () => {
    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')
    await fireEvent.update(passwordFields[1], 'secret')
    await fireEvent.update(screen.getByLabelText('Confirmation text'), 'WRONG')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))

    expect(deleteAccountMock).not.toHaveBeenCalled()
    expect(screen.getByText('Type DELETE to confirm account deletion.')).toBeVisible()
  })

  it('deletes account, logs out and redirects home', async () => {
    deleteAccountMock.mockResolvedValue(undefined)
    logoutMock.mockResolvedValue(undefined)

    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')
    await fireEvent.update(passwordFields[1], 'secret')
    await fireEvent.update(screen.getByLabelText('Confirmation text'), 'DELETE')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))

    expect(deleteAccountMock).toHaveBeenCalledWith({ password: 'secret' })
    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith({ name: 'home' })
  })

  it('shows API error message when account deletion fails', async () => {
    deleteAccountMock.mockRejectedValue(new Error('cannot delete'))
    normalizeApiErrorMock.mockReturnValue({ message: 'Password confirmation failed.' })

    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')
    await fireEvent.update(passwordFields[1], 'wrong-pass')
    await fireEvent.update(screen.getByLabelText('Confirmation text'), 'DELETE')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))

    expect(deleteAccountMock).toHaveBeenCalledWith({ password: 'wrong-pass' })
    expect(screen.getByText('Password confirmation failed.')).toBeVisible()
    expect(logoutMock).not.toHaveBeenCalled()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('completes account security workflow with password change then account deletion', async () => {
    changePasswordMock.mockResolvedValue({ detail: 'ok' })
    deleteAccountMock.mockResolvedValue(undefined)
    logoutMock.mockResolvedValue(undefined)

    render(AccountSecurityPage)

    const passwordFields = screen.getAllByLabelText('Current password')

    await fireEvent.update(passwordFields[0], 'old-pass')
    await fireEvent.update(screen.getByLabelText('New password'), 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirm new password'), 'new-pass')
    await fireEvent.click(screen.getByRole('button', { name: 'Change password' }))
    expect(screen.getByText('Password changed successfully.')).toBeVisible()

    await fireEvent.update(passwordFields[1], 'new-pass')
    await fireEvent.update(screen.getByLabelText('Confirmation text'), 'DELETE')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))

    expect(changePasswordMock).toHaveBeenCalledTimes(1)
    expect(deleteAccountMock).toHaveBeenCalledWith({ password: 'new-pass' })
    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith({ name: 'home' })
  })
})
