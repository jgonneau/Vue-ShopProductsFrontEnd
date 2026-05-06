import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

vi.mock('./shared/ui/GlobalToasts.vue', () => ({
  default: {
    name: 'GlobalToasts',
    template: '<div data-testid="global-toasts" />',
  },
}))

describe('App container', () => {
  it('renders router view and global toasts', () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['RouterView'],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-testid="global-toasts"]').exists()).toBe(true)
  })
})
