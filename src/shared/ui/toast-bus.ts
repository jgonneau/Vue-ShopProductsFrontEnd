import { readonly, ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

const toasts = ref<Toast[]>([])

const dismissToast = (id: string) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

const pushToast = (message: string, variant: ToastVariant = 'info', timeoutMs = 4_000) => {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  toasts.value = [...toasts.value, { id, message, variant }]

  if (timeoutMs > 0) {
    window.setTimeout(() => dismissToast(id), timeoutMs)
  }

  return id
}

export const useToastBus = () => {
  return {
    toasts: readonly(toasts),
    pushToast,
    dismissToast,
  }
}
