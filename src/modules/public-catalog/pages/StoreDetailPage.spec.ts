import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import StoreDetailPage from './StoreDetailPage.vue'

const { useRouteMock, usePublicStoreDetailMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  usePublicStoreDetailMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
  },
}))

vi.mock('../composables/usePublicStoreDetail', () => ({
  usePublicStoreDetail: usePublicStoreDetailMock,
}))

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
  },
}))

describe('StoreDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({
      params: { id: 'store-1' },
    })
  })

  it('shows loading state while detail query is pending', () => {
    usePublicStoreDetailMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(StoreDetailPage)

    expect(screen.getByText('Loading store details...')).toBeVisible()
    expect(screen.getByTestId('shop-products-header')).toBeVisible()
  })

  it('shows error state when store detail query fails', () => {
    usePublicStoreDetailMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(true),
      data: ref(undefined),
    })

    render(StoreDetailPage)

    expect(screen.getByText('Unable to load this store.')).toBeVisible()
  })

  it('renders store details and back navigation link', () => {
    usePublicStoreDetailMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        id: 'store-1',
        name: 'Bean Shop',
        description: 'Specialty coffee and pastries.',
        phone: '+1-202-555-0100',
        address: '42 Coffee Lane',
        city: 'Paris',
        state: 'Ile-de-France',
        zip_code: '75001',
        country: 'France',
      }),
    })

    render(StoreDetailPage)

    expect(screen.getByText('Bean Shop')).toBeVisible()
    expect(screen.getByText('Specialty coffee and pastries.')).toBeVisible()
    expect(screen.getByText(/Phone:/)).toBeVisible()
    expect(screen.getByText(/Address:/)).toBeVisible()
    expect(screen.getByText(/Paris, Ile-de-France 75001, France/)).toBeVisible()
    expect(screen.getByText('Back to stores')).toHaveAttribute(
      'data-to',
      JSON.stringify({ name: 'stores' }),
    )
  })

  it('passes route store id into usePublicStoreDetail', () => {
    usePublicStoreDetailMock.mockReturnValue({
      isPending: ref(true),
      isError: ref(false),
      data: ref(undefined),
    })

    render(StoreDetailPage)

    const storeIdRef = usePublicStoreDetailMock.mock.calls[0]?.[0] as { value: string }
    expect(storeIdRef.value).toBe('store-1')
  })
})
