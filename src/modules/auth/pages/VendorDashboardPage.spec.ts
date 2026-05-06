import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import VendorDashboardPage from './VendorDashboardPage.vue'

vi.mock('../components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

describe('VendorDashboardPage', () => {
  it('renders vendor-access informational content', () => {
    render(VendorDashboardPage)

    expect(screen.getByText('Vendor Area')).toBeVisible()
    expect(screen.getByText(/restricted to users with/i)).toBeVisible()
    expect(screen.getByTestId('auth-nav')).toBeVisible()
  })
})
