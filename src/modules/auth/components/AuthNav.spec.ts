import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthNav from './AuthNav.vue'

const { useRouterMock, pushMock, logoutMock, useAuthStoreMock } = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  pushMock: vi.fn(),
  logoutMock: vi.fn(),
  useAuthStoreMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: useRouterMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

vi.mock('../stores/auth-store', () => ({
  useAuthStore: useAuthStoreMock,
}))

describe('AuthNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRouterMock.mockReturnValue({ push: pushMock })
  })

  it('shows guest links for unauthenticated users', () => {
    useAuthStoreMock.mockReturnValue({
      isAuthenticated: false,
      userRole: null,
      logout: logoutMock,
    })

    const wrapper = mount(AuthNav)

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Register')
    expect(wrapper.text()).not.toContain('Profile')
    expect(wrapper.text()).not.toContain('Logout')
  })

  it('shows role-based links and handles logout', async () => {
    useAuthStoreMock.mockReturnValue({
      isAuthenticated: true,
      userRole: 'admin',
      logout: logoutMock,
    })

    const wrapper = mount(AuthNav)

    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Admin')
    expect(wrapper.text()).toContain('Vendor')

    await wrapper.get('button').trigger('click')

    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith({ name: 'home' })
  })
})
