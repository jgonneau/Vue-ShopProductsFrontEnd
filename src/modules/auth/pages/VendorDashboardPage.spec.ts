import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import VendorDashboardPage from './VendorDashboardPage.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}))

vi.mock('../components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

vi.mock('../../../shared/ui/PaginationControls.vue', () => ({
  default: {
    name: 'PaginationControls',
    template: '<div data-testid="pagination-controls" />',
  },
}))

vi.mock('../../vendor/composables/useOwnedStores', () => ({
  useOwnedStores: () => ({
    data: ref({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 'store-1',
          name: 'Store One',
          description: '',
          city: 'City',
          country: 'Country',
        },
      ],
    }),
    isPending: ref(false),
    isError: ref(false),
  }),
  useCreateOwnedStore: () => ({
    mutateAsync: vi.fn(),
    isPending: ref(false),
  }),
}))

vi.mock('../../vendor/composables/useOwnedProducts', () => ({
  useOwnedProducts: () => ({
    data: ref({
      count: 0,
      next: null,
      previous: null,
      results: [],
    }),
    isPending: ref(false),
    isError: ref(false),
  }),
  useOwnedStoreProducts: () => ({
    data: ref({
      count: 0,
      next: null,
      previous: null,
      results: [],
    }),
    isPending: ref(false),
    isError: ref(false),
    isEnabled: computed(() => true),
  }),
}))

vi.mock('../../vendor/composables/useCreateProductForStore', () => ({
  useCreateProductForStore: () => ({
    mutateAsync: vi.fn(),
    isPending: ref(false),
  }),
}))

describe('VendorDashboardPage', () => {
  it('renders vendor dashboard sections', () => {
    render(VendorDashboardPage)

    expect(screen.getByRole('heading', { name: 'Vendor Dashboard' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Create store' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Owned stores' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Add product to selected store' })).toBeVisible()
    expect(screen.getByTestId('auth-nav')).toBeVisible()
  })
})
