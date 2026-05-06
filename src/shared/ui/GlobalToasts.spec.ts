import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import GlobalToasts from './GlobalToasts.vue'
import { useToastBus } from './toast-bus'

describe('GlobalToasts', () => {
  beforeEach(() => {
    const { toasts, dismissToast } = useToastBus()
    for (const toast of toasts.value) {
      dismissToast(toast.id)
    }
  })

  it('renders pushed toast messages', () => {
    const { pushToast } = useToastBus()
    pushToast('Something happened', 'info', 0)

    render(GlobalToasts)
    expect(screen.getByText('Something happened')).toBeVisible()
  })

  it('dismisses toast from UI action', async () => {
    const { pushToast, toasts } = useToastBus()
    pushToast('Dismiss me', 'error', 0)

    render(GlobalToasts)
    await fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))

    expect(toasts.value).toHaveLength(0)
  })
})
