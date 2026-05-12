import { computed, readonly, ref } from 'vue'
import type { Product } from '../types'

type CartItem = {
  product: Product
  qty: number
}

const CART_STORAGE_KEY = 'ShopProducts.cart.items'
const CART_OPEN_STORAGE_KEY = 'ShopProducts.cart.open'

const defaultItems: CartItem[] = []

const getStoredItems = (): CartItem[] | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(CART_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) {
      return null
    }
    return parsed.filter(
      (item) =>
        item &&
        typeof item.qty === 'number' &&
        item.qty > 0 &&
        item.product &&
        typeof item.product.id === 'string' &&
        typeof item.product.name === 'string' &&
        typeof item.product.image === 'string' &&
        typeof item.product.category === 'string' &&
        typeof item.product.price === 'number' &&
        typeof item.product.store === 'string',
    )
  } catch {
    return null
  }
}

const getStoredOpenState = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  return window.localStorage.getItem(CART_OPEN_STORAGE_KEY) === 'true'
}

const persistItems = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
}

const persistOpenState = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(CART_OPEN_STORAGE_KEY, String(isOpen.value))
}

const items = ref<CartItem[]>(getStoredItems() ?? defaultItems)
const isOpen = ref(getStoredOpenState())

const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0))
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + item.qty * item.product.price, 0),
)

const setOpen = (nextValue: boolean) => {
  isOpen.value = nextValue
  persistOpenState()
}

const add = (product: Product) => {
  const existing = items.value.find((item) => item.product.id === product.id)
  if (existing) {
    existing.qty += 1
    persistItems()
    return
  }
  items.value.push({ product, qty: 1 })
  persistItems()
}

const remove = (productId: string) => {
  items.value = items.value.filter((item) => item.product.id !== productId)
  persistItems()
}

const setQty = (productId: string, qty: number) => {
  if (qty <= 0) {
    remove(productId)
    return
  }
  items.value = items.value.map((item) => (item.product.id === productId ? { ...item, qty } : item))
  persistItems()
}

export const clearCart = () => {
  items.value = []
  persistItems()
}

export const useCart = () => ({
  items: readonly(items),
  isOpen: readonly(isOpen),
  count,
  subtotal,
  setOpen,
  add,
  remove,
  setQty,
  clearCart,
})
