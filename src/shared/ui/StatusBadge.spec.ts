import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('normalizes underscores in status label', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'partially_refunded',
      },
    })

    expect(wrapper.text()).toBe('partially refunded')
    expect(wrapper.classes()).toContain('status-badge--partially_refunded')
  })

  it('falls back to unknown status when missing', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: null,
      },
    })

    expect(wrapper.text()).toBe('unknown')
    expect(wrapper.classes()).toContain('status-badge--unknown')
  })
})
