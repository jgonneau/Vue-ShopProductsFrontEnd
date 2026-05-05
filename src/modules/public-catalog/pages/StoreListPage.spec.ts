import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ref } from 'vue'
import StoreListPage from './StoreListPage.vue'

const { useRouteMock, useRouterMock, replaceMock, usePublicStoresMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  replaceMock: vi.fn(),
  usePublicStoresMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

vi.mock('../composables/usePublicStores', () => ({
  usePublicStores: usePublicStoresMock,
}))

vi.mock('../../auth/components/AuthNav.vue', () => ({
  default: {
    name: 'AuthNav',
    template: '<nav data-testid="auth-nav" />',
  },
}))

describe('StoreListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouteMock.mockReturnValue({ query: {} })
    useRouterMock.mockReturnValue({ replace: replaceMock })
  })

  it('uses DRF pagination shape to render stores and go to previous page', async () => {
    useRouteMock.mockReturnValue({ query: { page: '2', locale: 'en' } })
    usePublicStoresMock.mockReturnValue({
      isPending: ref(false),
      isError: ref(false),
      data: ref({
        count: 6,
        next: '/api/stores/?page=3',
        previous: '/api/stores/?page=1',
        results: [
          {
            id: 'store-1',
            name: 'Central Shop',
            city: 'Berlin',
            country: 'Germany',
          },
        ],
      }),
    })

    const { container } = render(StoreListPage)

    expect(screen.getByText(/Total stores: 6/)).toBeVisible()
    expect(screen.getByText('Central Shop')).toBeVisible()
    expect(container.querySelector('.toolbar')).not.toBeNull()
    expect(container.querySelector('.catalog-grid')).not.toBeNull()

    await fireEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'stores',
      query: {
        page: '1',
        locale: 'en',
      },
    })
  })
})
