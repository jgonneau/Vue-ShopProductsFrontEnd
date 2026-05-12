import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import VendorDashboardPage from './VendorDashboardPage.vue'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    RouterLink: RouterLinkStub,
    useRoute: () => ({
      query: {},
    }),
    useRouter: () => ({
      replace: vi.fn(),
    }),
  }
})

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
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

    expect(screen.getByRole('heading', { name: 'Vendor Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Create store' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Owned stores' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Add product to selected store' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('shop-products-header')).toBeInTheDocument()
  })
})
