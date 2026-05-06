import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastBus } from './toast-bus'

describe('toast-bus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const { toasts, dismissToast } = useToastBus()
    for (const toast of toasts.value) {
      dismissToast(toast.id)
    }
  })

  it('pushes and dismisses toast', () => {
    const { toasts, pushToast, dismissToast } = useToastBus()
    const id = pushToast('Saved!', 'success', 0)

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({ id, message: 'Saved!', variant: 'success' })

    dismissToast(id)
    expect(toasts.value).toHaveLength(0)
  })

  it('auto-dismisses when timeout is set', () => {
    const { toasts, pushToast } = useToastBus()
    pushToast('Will disappear', 'info', 1000)

    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(toasts.value).toHaveLength(0)
  })
})
