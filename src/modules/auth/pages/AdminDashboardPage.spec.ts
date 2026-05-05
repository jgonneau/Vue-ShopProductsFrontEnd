import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import AdminDashboardPage from './AdminDashboardPage.vue'

vi.mock('../components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

describe('AdminDashboardPage', () => {
  it('renders admin-only informational content', () => {
    render(AdminDashboardPage)

    expect(screen.getByText('Admin Area')).toBeVisible()
    expect(screen.getByText(/restricted to users with the/i)).toBeVisible()
    expect(screen.getByTestId('auth-nav')).toBeVisible()
  })
})
