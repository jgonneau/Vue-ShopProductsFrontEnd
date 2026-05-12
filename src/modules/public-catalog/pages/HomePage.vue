<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
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
  <main class="shop-home">
    <header class="shop-navbar container">
      <RouterLink :to="{ name: 'home' }" class="shop-brand">Shop Products</RouterLink>
      <nav class="shop-links">
        <RouterLink :to="{ name: 'products' }">Products</RouterLink>
        <RouterLink :to="{ name: 'stores' }">Stores</RouterLink>
      </nav>
      <div class="shop-auth-actions">
        <RouterLink :to="{ name: 'login' }" class="shop-btn shop-btn--ghost">Login</RouterLink>
        <RouterLink :to="{ name: 'register' }" class="shop-btn">Register</RouterLink>
      </div>
    </header>

    <section class="shop-hero container">
      <div>
        <p class="shop-eyebrow">Curated for smart shoppers</p>
        <h1>Discover trending products from trusted stores</h1>
        <p class="shop-hero-copy">
          Explore fresh arrivals, compare featured shops, and buy with confidence.
        </p>
        <div class="shop-hero-actions">
          <RouterLink :to="{ name: 'products' }" class="shop-btn">Start shopping</RouterLink>
          <RouterLink :to="{ name: 'stores' }" class="shop-btn shop-btn--ghost">
            Explore stores
          </RouterLink>
        </div>
        <p v-if="auth.isAuthenticated" class="shop-welcome">
          Welcome back, <strong>{{ auth.user?.email }}</strong
          >!
        </p>
      </div>
      <div class="shop-hero-card">
        <p v-if="schemaQuery.isPending.value">Checking backend health...</p>
        <p v-else-if="schemaQuery.isError.value" class="error">Backend status unavailable.</p>
        <template v-else>
          <p class="shop-eyebrow">Platform status</p>
          <h2>{{ schemaTitle }}</h2>
          <p>Schema version {{ schemaVersion }}</p>
          <p>{{ schemaQuery.data.value?.keys.length }} top-level schema keys loaded.</p>
        </template>
      </div>
    </section>

    <section class="container shop-section">
      <div class="panel-header">
        <h2>Featured products</h2>
        <RouterLink :to="{ name: 'products' }">View all products</RouterLink>
      </div>
      <p v-if="featuredProductsQuery.isPending.value">Loading featured products...</p>
      <p v-else-if="featuredProductsQuery.isError.value" class="error">
        Unable to load featured products.
      </p>
      <ul v-else-if="featuredProducts.length > 0" class="catalog-grid shop-featured-grid">
        <li
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          class="catalog-card shop-featured-card"
          :style="{ animationDelay: `${index * 120}ms` }"
        >
          <p class="shop-eyebrow">{{ product.store_name }}</p>
          <h3>{{ product.title }}</h3>
          <p>{{ product.description }}</p>
          <p><strong>Price:</strong> ${{ product.price }}</p>
          <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }">
            View details
          </RouterLink>
        </li>
      </ul>
      <p v-else>No featured products available yet.</p>
    </section>

    <section class="container shop-section">
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

    <footer class="shop-footer">
      <p>Shop Products</p>
    </footer>
  </main>
</template>
