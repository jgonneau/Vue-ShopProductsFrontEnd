<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthNav from '../../auth/components/AuthNav.vue'
import PaginationControls from '../../../shared/ui/PaginationControls.vue'
import { usePublicProducts } from '../composables/usePublicProducts'

const route = useRoute()
const router = useRouter()

const searchTerm = ref('')
const sortKey = ref<'title-asc' | 'price-asc' | 'price-desc'>('title-asc')

const currentPage = computed(() => {
  const rawPage = Number(route.query.page ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const productsQuery = usePublicProducts(currentPage)

const filteredProducts = computed(() => {
  const products = productsQuery.data.value?.results ?? []
  const normalizedSearch = searchTerm.value.trim().toLowerCase()

  const matchesSearch = normalizedSearch
    ? products.filter((product) => {
        const haystack = [product.title, product.reference, product.store_name]
          .join(' ')
          .toLowerCase()
        return haystack.includes(normalizedSearch)
      })
    : products

  return [...matchesSearch].sort((left, right) => {
    if (sortKey.value === 'price-asc') {
      return Number(left.price) - Number(right.price)
    }
    if (sortKey.value === 'price-desc') {
      return Number(right.price) - Number(left.price)
    }
    return left.title.localeCompare(right.title)
  })
})

const goToPage = async (nextPage: number) => {
  await router.replace({
    name: 'products',
    query: {
      ...route.query,
      page: String(nextPage),
    },
  })
}
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Products</h1>
    <p>Browse active products from all stores.</p>

    <section class="panel">
      <div class="toolbar">
        <label>
          Search
          <input v-model="searchTerm" type="search" placeholder="Title, reference, or store..." />
        </label>

        <label>
          Sort
          <select v-model="sortKey">
            <option value="title-asc">Title (A-Z)</option>
            <option value="price-asc">Price (low to high)</option>
            <option value="price-desc">Price (high to low)</option>
          </select>
        </label>
      </div>

      <p v-if="productsQuery.isPending.value">Loading products...</p>
      <p v-else-if="productsQuery.isError.value" class="error">
        Unable to load products right now.
      </p>
      <template v-else>
        <p class="results-meta">
          Showing {{ filteredProducts.length }} of
          {{ productsQuery.data.value?.results.length ?? 0 }} items on this page. Total products:
          {{ productsQuery.data.value?.count ?? 0 }}
        </p>

        <ul v-if="filteredProducts.length > 0" class="catalog-grid">
          <li v-for="product in filteredProducts" :key="product.id" class="catalog-card">
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <p><strong>Store:</strong> {{ product.store_name }}</p>
            <p><strong>Reference:</strong> {{ product.reference }}</p>
            <p><strong>Price:</strong> ${{ product.price }}</p>
            <p :class="product.in_stock ? 'success' : 'error'">
              {{ product.in_stock ? 'In stock' : 'Out of stock' }}
            </p>
            <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }"
              >View details</RouterLink
            >
          </li>
        </ul>
        <p v-else>No products found for this filter.</p>

        <PaginationControls
          :page="currentPage"
          :has-previous="Boolean(productsQuery.data.value?.previous)"
          :has-next="Boolean(productsQuery.data.value?.next)"
          @previous="goToPage(Math.max(1, currentPage - 1))"
          @next="goToPage(currentPage + 1)"
        />
      </template>
    </section>
  </main>
</template>
