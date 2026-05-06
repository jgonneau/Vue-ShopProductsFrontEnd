<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AuthNav from '../../auth/components/AuthNav.vue'
import { useAuthStore } from '../../auth/stores/auth-store'
import { useApiSchema } from '../composables/useApiSchema'
import { usePublicProducts } from '../composables/usePublicProducts'
import { usePublicStores } from '../composables/usePublicStores'

const schemaQuery = useApiSchema()
const auth = useAuthStore()
const featuredProductsQuery = usePublicProducts(1)
const featuredStoresQuery = usePublicStores(1)

const schemaTitle = computed(() => schemaQuery.data.value?.title ?? 'Unknown schema')
const schemaVersion = computed(() => schemaQuery.data.value?.version ?? 'n/a')
const featuredProducts = computed(() =>
  (featuredProductsQuery.data.value?.results ?? []).slice(0, 4),
)
const featuredStores = computed(() => (featuredStoresQuery.data.value?.results ?? []).slice(0, 4))
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Shop Products Frontend</h1>
    <p>Discover featured products and stores from the public catalog.</p>

    <section v-if="auth.isAuthenticated" class="panel">
      <p>
        Signed in as <strong>{{ auth.user?.email }}</strong> (role: <code>{{ auth.userRole }}</code
        >)
      </p>
    </section>
    <section v-else class="panel">
      <p>You are currently browsing as a guest.</p>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h2>Featured products</h2>
        <RouterLink :to="{ name: 'products' }">View all products</RouterLink>
      </div>
      <p v-if="featuredProductsQuery.isPending.value">Loading featured products...</p>
      <p v-else-if="featuredProductsQuery.isError.value" class="error">
        Unable to load featured products.
      </p>
      <ul v-else-if="featuredProducts.length > 0" class="catalog-grid">
        <li v-for="product in featuredProducts" :key="product.id" class="catalog-card">
          <h3>{{ product.title }}</h3>
          <p>{{ product.description }}</p>
          <p><strong>Store:</strong> {{ product.store_name }}</p>
          <p><strong>Price:</strong> ${{ product.price }}</p>
          <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }"
            >View details</RouterLink
          >
        </li>
      </ul>
      <p v-else>No featured products available yet.</p>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h2>Featured stores</h2>
        <RouterLink :to="{ name: 'stores' }">View all stores</RouterLink>
      </div>
      <p v-if="featuredStoresQuery.isPending.value">Loading featured stores...</p>
      <p v-else-if="featuredStoresQuery.isError.value" class="error">
        Unable to load featured stores.
      </p>
      <ul v-else-if="featuredStores.length > 0" class="catalog-grid">
        <li v-for="store in featuredStores" :key="store.id" class="catalog-card">
          <h3>{{ store.name }}</h3>
          <p><strong>City:</strong> {{ store.city }}</p>
          <p><strong>Country:</strong> {{ store.country }}</p>
          <RouterLink :to="{ name: 'store-detail', params: { id: store.id } }"
            >View details</RouterLink
          >
        </li>
      </ul>
      <p v-else>No featured stores available yet.</p>
    </section>

    <section class="panel">
      <h2>Backend connectivity check</h2>
      <p v-if="schemaQuery.isPending.value">Checking `/api/schema/`...</p>
      <p v-else-if="schemaQuery.isError.value" class="error">
        Unable to reach backend schema endpoint.
      </p>
      <div v-else class="success">
        <p><strong>Schema title:</strong> {{ schemaTitle }}</p>
        <p><strong>Schema version:</strong> {{ schemaVersion }}</p>
        <p><strong>Top-level keys:</strong> {{ schemaQuery.data.value?.keys.length }}</p>
      </div>
    </section>
  </main>
</template>
