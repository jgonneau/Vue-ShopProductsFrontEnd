import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import { RouterLinkStub } from '@/test-utils/router-link-stub'
import CustomerInvoicesPage from './CustomerInvoicesPage.vue'

const { useRouteMock, useRouterMock, replaceMock, useMyInvoicesMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  useMyInvoicesMock: vi.fn(),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    RouterLink: RouterLinkStub,
    useRoute: useRouteMock,
    useRouter: useRouterMock,
  }
})

vi.mock('../composables/useMyInvoices', () => ({
  useMyInvoices: useMyInvoicesMock,
}))

vi.mock('../../shop-products/components/ShopProductsHeader.vue', () => ({
  default: {
    name: 'ShopProductsHeader',
    template: '<header data-testid="shop-products-header" />',
  },
}))

vi.mock('../../../shared/ui/StatusBadge.vue', () => ({
  default: {
    name: 'StatusBadge',
    props: ['status'],
    template: '<span data-testid="status-badge">{{ status }}</span>',
  },
}))

describe('CustomerInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ query: { page: '2', q: 'recent' } })
    useRouterMock.mockReturnValue({ replace: replaceMock })
  })

  it('renders invoice list from query data', () => {
    useMyInvoicesMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 1,
        next: null,
        previous: '/api/invoices/?page=1',
        results: [
          {
            id: 'inv-1',
            reference: 'INV-1',
            store_name: 'Bean Shop',
            total: '12.00',
            status: 'paid',
          },
        ],
      }),
    })

    render(CustomerInvoicesPage)

    expect(screen.getByText('INV-1')).toBeVisible()
    expect(screen.getByText('Bean Shop')).toBeVisible()
    expect(screen.getByTestId('status-badge')).toHaveTextContent('paid')
  })

  it('navigates to previous page', async () => {
    useMyInvoicesMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 1,
        next: '/api/invoices/?page=3',
        previous: '/api/invoices/?page=1',
        results: [],
      }),
    })

    render(CustomerInvoicesPage)
    await fireEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'customer-invoices',
      query: {
        page: '1',
        q: 'recent',
      },
    })
  })
})
