<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ShopProductsHeader from '../../shop-products/components/ShopProductsHeader.vue'
import { usePublicStores } from '../../public-catalog/composables/usePublicStores'
import { normalizeApiError } from '../../../shared/api/errors'
import PaginationControls from '../../../shared/ui/PaginationControls.vue'
import StatusBadge from '../../../shared/ui/StatusBadge.vue'
import { useCreateOrder } from '../composables/useCreateOrder'
import { useMyOrders } from '../composables/useMyOrders'
import { useStoreProducts } from '../composables/useStoreProducts'

const route = useRoute()
const router = useRouter()

const orderPage = computed(() => {
  const rawPage = Number(route.query.ordersPage ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const storesPage = computed(() => {
  const rawPage = Number(route.query.storesPage ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const storeProductsPage = computed(() => {
  const rawPage = Number(route.query.productsPage ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const ordersQuery = useMyOrders(orderPage)
const storesQuery = usePublicStores(storesPage)

const form = reactive({
  reference: '',
  store: '',
  products: [] as string[],
})

const storeProductsQuery = useStoreProducts(
  computed(() => form.store),
  storeProductsPage,
)
const createOrderMutation = useCreateOrder()

const formError = ref<string | null>(null)
const formSuccess = ref<string | null>(null)

watch(
  () => form.store,
  () => {
    form.products = []
  },
)

const onCreateOrder = async () => {
  formError.value = null
  formSuccess.value = null

  if (!form.reference.trim()) {
    formError.value = 'Order reference is required.'
    return
  }

  if (!form.store) {
    formError.value = 'Select a store before creating an order.'
    return
  }

  if (form.products.length === 0) {
    formError.value = 'Select at least one product.'
    return
  }

  try {
    await createOrderMutation.mutateAsync({
      reference: form.reference.trim(),
      store: form.store,
      products: form.products,
    })

    form.reference = ''
    form.products = []
    formSuccess.value = 'Order created successfully.'
  } catch (error) {
    formError.value = normalizeApiError(error).message
  }
}

const setQueryPage = async (key: 'ordersPage' | 'storesPage' | 'productsPage', page: number) => {
  const nextQuery = {
    ...route.query,
    [key]: String(page),
  }
  await router.replace({ name: 'customer-orders', query: nextQuery })
}
</script>

<template>
  <main class="container">
    <ShopProductsHeader />
    <h1>My Orders</h1>
    <p>Review your orders and create a new one from public store products.</p>

    <section class="panel">
      <h2>Create order</h2>
      <form class="form" @submit.prevent="onCreateOrder">
        <label>
          Order reference
          <input v-model="form.reference" type="text" placeholder="ORD-2026-001" />
        </label>

        <label>
          Store
          <select v-model="form.store">
            <option value="">Select a store</option>
            <option
              v-for="store in storesQuery.data.value?.results ?? []"
              :key="store.id"
              :value="store.id"
            >
              {{ store.name }} ({{ store.city }}, {{ store.country }})
            </option>
          </select>
        </label>

        <PaginationControls
          :page="storesPage"
          :has-previous="Boolean(storesQuery.data.value?.previous)"
          :has-next="Boolean(storesQuery.data.value?.next)"
          @previous="setQueryPage('storesPage', Math.max(1, storesPage - 1))"
          @next="setQueryPage('storesPage', storesPage + 1)"
        />

        <label>
          Products (multiple)
          <select v-model="form.products" multiple :disabled="!form.store">
            <option
              v-for="product in storeProductsQuery.data.value?.results ?? []"
              :key="product.id"
              :value="product.id"
            >
              {{ product.title }} - ${{ product.price }}
            </option>
          </select>
        </label>

        <PaginationControls
          :page="storeProductsPage"
          :has-previous="Boolean(storeProductsQuery.data.value?.previous)"
          :has-next="Boolean(storeProductsQuery.data.value?.next)"
          @previous="setQueryPage('productsPage', Math.max(1, storeProductsPage - 1))"
          @next="setQueryPage('productsPage', storeProductsPage + 1)"
        />

        <p v-if="formError" class="error">{{ formError }}</p>
        <p v-if="formSuccess" class="success">{{ formSuccess }}</p>
        <button type="submit" :disabled="createOrderMutation.isPending.value">
          {{ createOrderMutation.isPending.value ? 'Creating...' : 'Create order' }}
        </button>
      </form>
    </section>

    <section class="panel">
      <h2>Order history</h2>
      <p v-if="ordersQuery.isPending.value">Loading orders...</p>
      <p v-else-if="ordersQuery.isError.value" class="error">
        Unable to load your orders right now.
      </p>
      <template v-else>
        <ul v-if="(ordersQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
          <li
            v-for="order in ordersQuery.data.value?.results ?? []"
            :key="order.id"
            class="catalog-card"
          >
            <h3>{{ order.reference }}</h3>
            <p><strong>Store:</strong> {{ order.store_name }}</p>
            <p><strong>Total:</strong> ${{ order.total }}</p>
            <p><strong>Products:</strong> {{ order.product_count }}</p>
            <p>
              <strong>Status:</strong>
              <StatusBadge :status="order.status" />
            </p>
          </li>
        </ul>
        <p v-else>You do not have any orders yet.</p>

        <PaginationControls
          :page="orderPage"
          :has-previous="Boolean(ordersQuery.data.value?.previous)"
          :has-next="Boolean(ordersQuery.data.value?.next)"
          @previous="setQueryPage('ordersPage', Math.max(1, orderPage - 1))"
          @next="setQueryPage('ordersPage', orderPage + 1)"
        />
      </template>
    </section>
  </main>
</template>
