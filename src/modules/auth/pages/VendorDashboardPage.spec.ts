import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import VendorDashboardPage from './VendorDashboardPage.vue'

const {
  useRouteMock,
  useRouterMock,
  replaceMock,
  useOwnedStoresMock,
  useCreateOwnedStoreMock,
  useOwnedProductsMock,
  useOwnedStoreProductsMock,
  useCreateProductForStoreMock,
  createStoreMutateAsyncMock,
  createProductMutateAsyncMock,
  normalizeApiErrorMock,
} = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  useOwnedStoresMock: vi.fn(),
  useCreateOwnedStoreMock: vi.fn(),
  useOwnedProductsMock: vi.fn(),
  useOwnedStoreProductsMock: vi.fn(),
  useCreateProductForStoreMock: vi.fn(),
  createStoreMutateAsyncMock: vi.fn(),
  createProductMutateAsyncMock: vi.fn(),
  normalizeApiErrorMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
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

vi.mock('../../../shared/api/errors', () => ({
  normalizeApiError: normalizeApiErrorMock,
}))

vi.mock('../../vendor/composables/useOwnedStores', () => ({
  useOwnedStores: useOwnedStoresMock,
  useCreateOwnedStore: useCreateOwnedStoreMock,
}))

vi.mock('../../vendor/composables/useOwnedProducts', () => ({
  useOwnedProducts: useOwnedProductsMock,
  useOwnedStoreProducts: useOwnedStoreProductsMock,
}))

vi.mock('../../vendor/composables/useCreateProductForStore', () => ({
  useCreateProductForStore: useCreateProductForStoreMock,
}))

describe('VendorDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({
      query: {},
    })
    useRouterMock.mockReturnValue({
      replace: replaceMock,
    })
    useOwnedStoresMock.mockReturnValue({
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
    })
    useCreateOwnedStoreMock.mockReturnValue({
      mutateAsync: createStoreMutateAsyncMock,
      isPending: ref(false),
    })
    useOwnedProductsMock.mockReturnValue({
      data: ref({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }),
      isPending: ref(false),
      isError: ref(false),
    })
    useOwnedStoreProductsMock.mockReturnValue({
      data: ref({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }),
      isPending: ref(false),
      isError: ref(false),
      isEnabled: computed(() => true),
    })
    useCreateProductForStoreMock.mockReturnValue({
      mutateAsync: createProductMutateAsyncMock,
      isPending: ref(false),
    })
    normalizeApiErrorMock.mockReturnValue({ message: 'API error' })
  })

  it('renders vendor dashboard sections', () => {
    render(VendorDashboardPage)

    expect(screen.getByRole('heading', { name: 'Vendor Dashboard' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Create store' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Owned stores' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Add product to selected store' })).toBeVisible()
    expect(screen.getByTestId('auth-nav')).toBeVisible()
  })

  it('validates store name before creating store', async () => {
    render(VendorDashboardPage)

    await fireEvent.click(screen.getByRole('button', { name: 'Create store' }))

    expect(screen.getByText('Store name is required.')).toBeVisible()
    expect(createStoreMutateAsyncMock).not.toHaveBeenCalled()
  })

  it('creates store with trimmed fields and shows success feedback', async () => {
    render(VendorDashboardPage)

    await fireEvent.update(screen.getByLabelText('Name'), '  New Store  ')
    await fireEvent.update(
      screen.getByPlaceholderText('What your store offers'),
      '  Best products ',
    )
    await fireEvent.update(screen.getByLabelText('City'), '  Lisbon ')
    await fireEvent.update(screen.getByLabelText('Country'), '  Portugal ')
    await fireEvent.click(screen.getByRole('button', { name: 'Create store' }))

    expect(createStoreMutateAsyncMock).toHaveBeenCalledWith({
      name: 'New Store',
      description: 'Best products',
      city: 'Lisbon',
      country: 'Portugal',
    })
    expect(screen.getByText('Store created successfully.')).toBeVisible()
  })

  it('shows normalized API error when creating store fails', async () => {
    createStoreMutateAsyncMock.mockRejectedValue(new Error('failed'))
    normalizeApiErrorMock.mockReturnValue({ message: 'Store creation failed.' })

    render(VendorDashboardPage)

    await fireEvent.update(screen.getByLabelText('Name'), '  New Store  ')
    await fireEvent.click(screen.getByRole('button', { name: 'Create store' }))

    expect(screen.getByText('Store creation failed.')).toBeVisible()
  })

  it('shows normalized API error when creating product fails', async () => {
    createProductMutateAsyncMock.mockRejectedValue(new Error('failed'))
    normalizeApiErrorMock.mockReturnValue({ message: 'Invalid product data.' })

    render(VendorDashboardPage)

    await fireEvent.update(screen.getByLabelText('Reference'), ' PROD-1 ')
    await fireEvent.update(screen.getByLabelText('Title'), ' Coffee ')
    await fireEvent.update(screen.getByLabelText('Price'), '10.00')
    await fireEvent.click(screen.getByRole('button', { name: 'Add product' }))

    expect(createProductMutateAsyncMock).toHaveBeenCalledWith({
      storeId: 'store-1',
      payload: {
        reference: 'PROD-1',
        title: 'Coffee',
        description: '',
        price: '10.00',
        stock_quantity: 0,
        activated: true,
      },
    })
    expect(screen.getByText('Invalid product data.')).toBeVisible()
  })

  it('creates product with trimmed fields and shows success feedback', async () => {
    createProductMutateAsyncMock.mockResolvedValue(undefined)

    render(VendorDashboardPage)

    await fireEvent.update(screen.getByLabelText('Reference'), ' PROD-1 ')
    await fireEvent.update(screen.getByLabelText('Title'), ' Coffee ')
    await fireEvent.update(screen.getByPlaceholderText('Product description'), ' Fresh roast ')
    await fireEvent.update(screen.getByLabelText('Price'), '10.00')
    await fireEvent.update(screen.getByLabelText('Stock quantity'), '5')
    await fireEvent.click(screen.getByRole('button', { name: 'Add product' }))

    expect(createProductMutateAsyncMock).toHaveBeenCalledWith({
      storeId: 'store-1',
      payload: {
        reference: 'PROD-1',
        title: 'Coffee',
        description: 'Fresh roast',
        price: '10.00',
        stock_quantity: 5,
        activated: true,
      },
    })
    expect(screen.getByText('Product created successfully.')).toBeVisible()
  })
})
