<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCreateAdminOrder } from '../../admin/composables/useAdminResources'
import { useAuthStore } from '../../auth/stores/auth-store'
import { useCreateOrder } from '../../customer/composables/useCreateOrder'
import { normalizeApiError } from '../../../shared/api/errors'
import { useCart } from '../composables/useCart'
import type { Product } from '../types'

type CartLine = { product: Product; qty: number }

const cart = useCart()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const createOrderMutation = useCreateOrder()
const createAdminOrderMutation = useCreateAdminOrder()

const checkoutError = ref<string | null>(null)
const isCheckingOut = ref(false)

const resolveProductUnitPrice = (product: Product): number => {
  const record = product as unknown as Record<string, unknown>
  const rawPrice = record.price
  if (typeof rawPrice === 'number' && Number.isFinite(rawPrice)) {
    return rawPrice
  }
  if (typeof rawPrice === 'string') {
    const parsed = Number(rawPrice)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return 0
}

const subtotalForLines = (lines: CartLine[]) =>
  lines.reduce((sum, line) => sum + line.qty * resolveProductUnitPrice(line.product), 0)

const rawShippingFee = Number(import.meta.env.VITE_SHIPPING_FEE)
const shippingFee = Number.isFinite(rawShippingFee) ? rawShippingFee : 10

const rawFreeShippingMinSubtotal = Number(import.meta.env.VITE_FREE_SHIPPING_MIN_SUBTOTAL)
const freeShippingMinSubtotal =
  Number.isFinite(rawFreeShippingMinSubtotal) && rawFreeShippingMinSubtotal >= 0
    ? rawFreeShippingMinSubtotal
    : 200

const checkoutSubtotal = computed(() => subtotalForLines([...cart.items.value]))

const shipping = computed(() =>
  checkoutSubtotal.value > freeShippingMinSubtotal || checkoutSubtotal.value === 0
    ? 0
    : shippingFee,
)
const total = computed(() => checkoutSubtotal.value + shipping.value)
const currencySymbol = import.meta.env.VITE_CURRENCY_SYMBOL?.trim() || '$'
const formatPrice = (value: number) => value.toFixed(2)
const formatCurrency = (value: number) => `${currencySymbol}${formatPrice(value)}`

const defaultStoreId = import.meta.env.VITE_CHECKOUT_STORE_ID?.trim() || ''

/** Lines sharing one store id → one POST /api/admin/orders/ (or customer /api/orders/) each. */
const groupLinesByStore = (lines: CartLine[]): Map<string, CartLine[]> | null => {
  const explicitStores = new Set(
    lines
      .map((line) => line.product.store?.trim() || line.product.storeId?.trim() || '')
      .filter(Boolean),
  )
  const inferredStoreId = explicitStores.size === 1 ? [...explicitStores][0] : ''
  const fallbackStoreId = defaultStoreId || inferredStoreId

  const byStore = new Map<string, CartLine[]>()
  for (const line of lines) {
    const explicitStoreId = line.product.store?.trim() || line.product.storeId?.trim() || ''
    const storeId = explicitStoreId || fallbackStoreId
    if (!storeId) {
      return null
    }
    const bucket = byStore.get(storeId)
    if (bucket) {
      bucket.push(line)
    } else {
      byStore.set(storeId, [line])
    }
  }
  return byStore
}

const buildProductIdsForLines = (lines: CartLine[]) =>
  lines.flatMap((line) => Array.from({ length: line.qty }, () => line.product.id))

const wholeCartShipping = () =>
  checkoutSubtotal.value > freeShippingMinSubtotal || checkoutSubtotal.value === 0 ? 0 : shippingFee

/** Split flat shipping across stores by subtotal share; last group absorbs rounding remainder. */
const shippingSharesByStore = (entries: [string, CartLine[]][]) => {
  const whole = wholeCartShipping()
  const sub = checkoutSubtotal.value
  if (entries.length === 0 || sub <= 0 || whole === 0) {
    return new Map(entries.map(([id]) => [id, 0]))
  }
  const shares = new Map<string, number>()
  let allocated = 0
  for (let i = 0; i < entries.length; i++) {
    const [storeId, lines] = entries[i]
    if (i === entries.length - 1) {
      shares.set(storeId, Math.max(0, whole - allocated))
    } else {
      const raw = whole * (subtotalForLines(lines) / sub)
      const rounded = Math.round(raw * 100) / 100
      shares.set(storeId, rounded)
      allocated += rounded
    }
  }
  return shares
}

const onCheckout = async () => {
  checkoutError.value = null

  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (cart.items.value.length === 0) {
    return
  }

  const byStore = groupLinesByStore([...cart.items.value])
  if (!byStore) {
    checkoutError.value =
      'Cannot place order: cart items are missing store ids. Add products again from catalog, or set VITE_CHECKOUT_STORE_ID in your environment.'
    return
  }

  const storeGroups = [...byStore.entries()]
  const shippingByStore = shippingSharesByStore(storeGroups)
  const checkoutStartedAt = Date.now()

  isCheckingOut.value = true

  try {
    let firstCreatedId: string | undefined

    for (let i = 0; i < storeGroups.length; i++) {
      const [storeId, lines] = storeGroups[i]
      const productIds = buildProductIdsForLines(lines)
      const storeSubtotal = subtotalForLines(lines)
      const ship = shippingByStore.get(storeId) ?? 0
      const totalStr = formatPrice(storeSubtotal + ship)
      const reference = `CHK-${checkoutStartedAt}-${i + 1}`

      const created =
        auth.isAdmin && auth.user
          ? await createAdminOrderMutation.mutateAsync({
              reference,
              total: totalStr,
              status: 'pending',
              customer: auth.user.id,
              store: storeId,
              products: productIds,
              content: { source: 'sp-cart', storeIndex: i + 1, storeCount: storeGroups.length },
            })
          : await createOrderMutation.mutateAsync({
              reference,
              store: storeId,
              products: productIds,
              content: { source: 'sp-cart', storeIndex: i + 1, storeCount: storeGroups.length },
            })

      if (
        created &&
        typeof created === 'object' &&
        'id' in created &&
        typeof created.id === 'string' &&
        !firstCreatedId
      ) {
        firstCreatedId = created.id
      }
    }

    cart.clearCart()
    cart.setOpen(false)

    if (firstCreatedId) {
      await router.push({ name: 'customer-order-detail', params: { orderId: firstCreatedId } })
    } else {
      await router.push({ name: 'customer-orders' })
    }
  } catch (error) {
    checkoutError.value = normalizeApiError(error).message
  } finally {
    isCheckingOut.value = false
  }
}

watch(
  () => cart.items.value.length,
  (length) => {
    if (length === 0 && cart.isOpen.value) {
      cart.setOpen(false)
    }
  },
)

watch(
  () => route.fullPath,
  () => {
    if (cart.isOpen.value) {
      cart.setOpen(false)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="cart.isOpen.value" class="sp-sheet-backdrop" @click.self="cart.setOpen(false)">
      <aside class="sp-sheet">
        <header class="sp-sheet-header">
          <div>
            <h2>Your cart</h2>
            <p>
              {{ cart.items.value.length }} {{ cart.items.value.length === 1 ? 'item' : 'items' }}
            </p>
          </div>
          <button type="button" class="sp-sheet-close" @click="cart.setOpen(false)">×</button>
        </header>

        <div v-if="cart.items.value.length === 0" class="sp-sheet-empty">
          <p>Your cart is empty.</p>
          <RouterLink :to="{ name: 'products' }" class="sp-pill" @click="cart.setOpen(false)">
            Browse the catalog
          </RouterLink>
        </div>

        <template v-else>
          <ul class="sp-sheet-list">
            <li v-for="item in cart.items.value" :key="item.product.id" class="sp-sheet-item">
              <img :src="item.product.image" :alt="item.product.name" loading="lazy" />
              <div>
                <p>{{ item.product.name }}</p>
                <p>{{ item.product.category }}</p>
                <div class="sp-sheet-qty">
                  <button type="button" @click="cart.setQty(item.product.id, item.qty - 1)">
                    −
                  </button>
                  <span>{{ item.qty }}</span>
                  <button type="button" @click="cart.setQty(item.product.id, item.qty + 1)">
                    +
                  </button>
                </div>
              </div>
              <div>
                <p>{{ formatCurrency(resolveProductUnitPrice(item.product) * item.qty) }}</p>
                <button type="button" @click="cart.remove(item.product.id)">Remove</button>
              </div>
            </li>
          </ul>

          <footer class="sp-sheet-footer">
            <p v-if="checkoutError" class="error">{{ checkoutError }}</p>
            <p>
              <span>Subtotal</span><strong>{{ formatCurrency(checkoutSubtotal) }}</strong>
            </p>
            <p>
              <span>Shipping</span
              ><strong>{{ shipping === 0 ? 'Free' : formatCurrency(shipping) }}</strong>
            </p>
            <p>
              <span>Total</span><strong>{{ formatCurrency(total) }}</strong>
            </p>
            <button type="button" class="sp-pill" :disabled="isCheckingOut" @click="onCheckout">
              {{ isCheckingOut ? 'Placing order…' : 'Checkout' }}
            </button>
          </footer>
        </template>
      </aside>
    </div>
  </Teleport>
</template>
