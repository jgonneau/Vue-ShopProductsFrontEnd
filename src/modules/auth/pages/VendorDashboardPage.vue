<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '../../../shared/api/errors'
import PaginationControls from '../../../shared/ui/PaginationControls.vue'
import AuthNav from '../components/AuthNav.vue'
import { useCreateProductForStore } from '../../vendor/composables/useCreateProductForStore'
import { useOwnedProducts, useOwnedStoreProducts } from '../../vendor/composables/useOwnedProducts'
import { useCreateOwnedStore, useOwnedStores } from '../../vendor/composables/useOwnedStores'

const route = useRoute()
const router = useRouter()

const storesPage = computed(() => {
  const rawPage = Number(route.query.storesPage ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const storeProductsPage = computed(() => {
  const rawPage = Number(route.query.storeProductsPage ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const ownedProductsPage = computed(() => {
  const rawPage = Number(route.query.ownedProductsPage ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const storesQuery = useOwnedStores(storesPage)
const ownedProductsQuery = useOwnedProducts(ownedProductsPage)

const selectedStoreId = ref('')
watch(
  () => storesQuery.data.value?.results,
  (stores) => {
    if (!stores || stores.length === 0) {
      selectedStoreId.value = ''
      return
    }

    const hasSelectedStore = stores.some((store) => store.id === selectedStoreId.value)
    if (!hasSelectedStore) {
      selectedStoreId.value = stores[0]?.id ?? ''
    }
  },
  { immediate: true },
)

const storeProductsQuery = useOwnedStoreProducts(selectedStoreId, storeProductsPage)
const createStoreMutation = useCreateOwnedStore()
const createProductMutation = useCreateProductForStore()

const storeForm = reactive({
  name: '',
  description: '',
  city: '',
  country: '',
})
const productForm = reactive({
  reference: '',
  title: '',
  description: '',
  price: '',
  stock_quantity: 0,
  activated: true,
})

const storeError = ref<string | null>(null)
const productError = ref<string | null>(null)
const storeSuccess = ref<string | null>(null)
const productSuccess = ref<string | null>(null)

const setQueryPage = async (
  key: 'storesPage' | 'storeProductsPage' | 'ownedProductsPage',
  page: number,
) => {
  await router.replace({
    name: 'vendor-dashboard',
    query: {
      ...route.query,
      [key]: String(page),
    },
  })
}

const onCreateStore = async () => {
  storeError.value = null
  storeSuccess.value = null

  if (!storeForm.name.trim()) {
    storeError.value = 'Store name is required.'
    return
  }

  try {
    await createStoreMutation.mutateAsync({
      name: storeForm.name.trim(),
      description: storeForm.description.trim(),
      city: storeForm.city.trim(),
      country: storeForm.country.trim(),
    })
    storeForm.name = ''
    storeForm.description = ''
    storeForm.city = ''
    storeForm.country = ''
    storeSuccess.value = 'Store created successfully.'
  } catch (error) {
    storeError.value = normalizeApiError(error).message
  }
}

const onCreateProduct = async () => {
  productError.value = null
  productSuccess.value = null

  if (!selectedStoreId.value) {
    productError.value = 'Select a store first.'
    return
  }

  if (!productForm.reference.trim() || !productForm.title.trim() || !productForm.price.trim()) {
    productError.value = 'Reference, title, and price are required.'
    return
  }

  try {
    await createProductMutation.mutateAsync({
      storeId: selectedStoreId.value,
      payload: {
        reference: productForm.reference.trim(),
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        price: productForm.price,
        stock_quantity: Number(productForm.stock_quantity),
        activated: productForm.activated,
      },
    })
    productForm.reference = ''
    productForm.title = ''
    productForm.description = ''
    productForm.price = ''
    productForm.stock_quantity = 0
    productForm.activated = true
    productSuccess.value = 'Product created successfully.'
  } catch (error) {
    productError.value = normalizeApiError(error).message
  }
}
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Vendor Dashboard</h1>
    <p>Manage your stores and products from one place.</p>

    <section class="panel">
      <h2>Create store</h2>
      <form class="form" @submit.prevent="onCreateStore">
        <label>
          Name
          <input v-model="storeForm.name" type="text" placeholder="My Awesome Store" />
        </label>
        <label>
          Description
          <input v-model="storeForm.description" type="text" placeholder="What your store offers" />
        </label>
        <label>
          City
          <input v-model="storeForm.city" type="text" placeholder="City" />
        </label>
        <label>
          Country
          <input v-model="storeForm.country" type="text" placeholder="Country" />
        </label>

        <p v-if="storeError" class="error">{{ storeError }}</p>
        <p v-if="storeSuccess" class="success">{{ storeSuccess }}</p>

        <button type="submit" :disabled="createStoreMutation.isPending.value">
          {{ createStoreMutation.isPending.value ? 'Creating...' : 'Create store' }}
        </button>
      </form>
    </section>

    <section class="panel">
      <h2>Owned stores</h2>
      <p v-if="storesQuery.isPending.value">Loading stores...</p>
      <p v-else-if="storesQuery.isError.value" class="error">Unable to load your stores.</p>
      <template v-else>
        <ul v-if="(storesQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
          <li
            v-for="store in storesQuery.data.value?.results ?? []"
            :key="store.id"
            class="catalog-card"
          >
            <h3>{{ store.name }}</h3>
            <p v-if="store.description">{{ store.description }}</p>
            <p><strong>City:</strong> {{ store.city || '-' }}</p>
            <p><strong>Country:</strong> {{ store.country || '-' }}</p>
            <button type="button" @click="selectedStoreId = store.id">
              {{ selectedStoreId === store.id ? 'Selected' : 'Select for products' }}
            </button>
          </li>
        </ul>
        <p v-else>No stores yet. Create your first store above.</p>

        <PaginationControls
          :page="storesPage"
          :has-previous="Boolean(storesQuery.data.value?.previous)"
          :has-next="Boolean(storesQuery.data.value?.next)"
          @previous="setQueryPage('storesPage', Math.max(1, storesPage - 1))"
          @next="setQueryPage('storesPage', storesPage + 1)"
        />
      </template>
    </section>

    <section class="panel">
      <h2>Add product to selected store</h2>
      <p v-if="!selectedStoreId" class="error">Select a store above before creating products.</p>

      <form class="form" @submit.prevent="onCreateProduct">
        <label>
          Reference
          <input v-model="productForm.reference" type="text" placeholder="PROD-2026-001" />
        </label>
        <label>
          Title
          <input v-model="productForm.title" type="text" placeholder="Product title" />
        </label>
        <label>
          Description
          <input v-model="productForm.description" type="text" placeholder="Product description" />
        </label>
        <label>
          Price
          <input v-model="productForm.price" type="text" placeholder="99.99" />
        </label>
        <label>
          Stock quantity
          <input v-model.number="productForm.stock_quantity" type="number" min="0" />
        </label>
        <label>
          <input v-model="productForm.activated" type="checkbox" />
          Activated
        </label>

        <p v-if="productError" class="error">{{ productError }}</p>
        <p v-if="productSuccess" class="success">{{ productSuccess }}</p>

        <button type="submit" :disabled="createProductMutation.isPending.value || !selectedStoreId">
          {{ createProductMutation.isPending.value ? 'Creating...' : 'Add product' }}
        </button>
      </form>
    </section>

    <section class="panel">
      <h2>Products in selected store</h2>
      <p v-if="!selectedStoreId">Select a store to see scoped products.</p>
      <p v-else-if="storeProductsQuery.isPending.value">Loading store products...</p>
      <p v-else-if="storeProductsQuery.isError.value" class="error">
        Unable to load selected store products.
      </p>
      <template v-else>
        <ul v-if="(storeProductsQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
          <li
            v-for="product in storeProductsQuery.data.value?.results ?? []"
            :key="product.id"
            class="catalog-card"
          >
            <h3>{{ product.title }}</h3>
            <p><strong>Reference:</strong> {{ product.reference }}</p>
            <p><strong>Price:</strong> ${{ product.price }}</p>
            <p><strong>Stock:</strong> {{ product.stock_quantity }}</p>
            <p><strong>Active:</strong> {{ product.activated ? 'Yes' : 'No' }}</p>
          </li>
        </ul>
        <p v-else>No products in this store yet.</p>

        <PaginationControls
          :page="storeProductsPage"
          :has-previous="Boolean(storeProductsQuery.data.value?.previous)"
          :has-next="Boolean(storeProductsQuery.data.value?.next)"
          @previous="setQueryPage('storeProductsPage', Math.max(1, storeProductsPage - 1))"
          @next="setQueryPage('storeProductsPage', storeProductsPage + 1)"
        />
      </template>
    </section>

    <section class="panel">
      <h2>All owned products</h2>
      <p v-if="ownedProductsQuery.isPending.value">Loading products...</p>
      <p v-else-if="ownedProductsQuery.isError.value" class="error">
        Unable to load owned products.
      </p>
      <template v-else>
        <ul v-if="(ownedProductsQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
          <li
            v-for="product in ownedProductsQuery.data.value?.results ?? []"
            :key="product.id"
            class="catalog-card"
          >
            <h3>{{ product.title }}</h3>
            <p><strong>Store:</strong> {{ product.store_name }}</p>
            <p><strong>Reference:</strong> {{ product.reference }}</p>
            <p><strong>Price:</strong> ${{ product.price }}</p>
            <p><strong>Stock:</strong> {{ product.stock_quantity }}</p>
          </li>
        </ul>
        <p v-else>No owned products found yet.</p>

        <PaginationControls
          :page="ownedProductsPage"
          :has-previous="Boolean(ownedProductsQuery.data.value?.previous)"
          :has-next="Boolean(ownedProductsQuery.data.value?.next)"
          @previous="setQueryPage('ownedProductsPage', Math.max(1, ownedProductsPage - 1))"
          @next="setQueryPage('ownedProductsPage', ownedProductsPage + 1)"
        />
      </template>
    </section>
  </main>
</template>
