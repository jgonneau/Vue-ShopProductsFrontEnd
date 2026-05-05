<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthNav from '../../auth/components/AuthNav.vue'
import PaginationControls from '../../../shared/ui/PaginationControls.vue'
import { usePublicStores } from '../composables/usePublicStores'

const route = useRoute()
const router = useRouter()

const searchTerm = ref('')
const sortKey = ref<'name-asc' | 'city-asc' | 'country-asc'>('name-asc')

const currentPage = computed(() => {
  const rawPage = Number(route.query.page ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const storesQuery = usePublicStores(currentPage)

const filteredStores = computed(() => {
  const stores = storesQuery.data.value?.results ?? []
  const normalizedSearch = searchTerm.value.trim().toLowerCase()

  const matchesSearch = normalizedSearch
    ? stores.filter((store) => {
        const haystack = [store.name, store.city, store.country].join(' ').toLowerCase()
        return haystack.includes(normalizedSearch)
      })
    : stores

  return [...matchesSearch].sort((left, right) => {
    if (sortKey.value === 'city-asc') {
      return left.city.localeCompare(right.city)
    }
    if (sortKey.value === 'country-asc') {
      return left.country.localeCompare(right.country)
    }
    return left.name.localeCompare(right.name)
  })
})

const goToPage = async (nextPage: number) => {
  await router.replace({
    name: 'stores',
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
    <h1>Stores</h1>
    <p>Discover stores available in the public catalog.</p>

    <section class="panel">
      <div class="toolbar">
        <label>
          Search
          <input v-model="searchTerm" type="search" placeholder="Store name, city, or country..." />
        </label>

        <label>
          Sort
          <select v-model="sortKey">
            <option value="name-asc">Name (A-Z)</option>
            <option value="city-asc">City (A-Z)</option>
            <option value="country-asc">Country (A-Z)</option>
          </select>
        </label>
      </div>

      <p v-if="storesQuery.isPending.value">Loading stores...</p>
      <p v-else-if="storesQuery.isError.value" class="error">Unable to load stores right now.</p>
      <template v-else>
        <p class="results-meta">
          Showing {{ filteredStores.length }} of
          {{ storesQuery.data.value?.results.length ?? 0 }} items on this page. Total stores:
          {{ storesQuery.data.value?.count ?? 0 }}
        </p>

        <ul v-if="filteredStores.length > 0" class="catalog-grid">
          <li v-for="store in filteredStores" :key="store.id" class="catalog-card">
            <h3>{{ store.name }}</h3>
            <p><strong>City:</strong> {{ store.city }}</p>
            <p><strong>Country:</strong> {{ store.country }}</p>
            <RouterLink :to="{ name: 'store-detail', params: { id: store.id } }"
              >View details</RouterLink
            >
          </li>
        </ul>
        <p v-else>No stores found for this filter.</p>

        <PaginationControls
          :page="currentPage"
          :has-previous="Boolean(storesQuery.data.value?.previous)"
          :has-next="Boolean(storesQuery.data.value?.next)"
          @previous="goToPage(Math.max(1, currentPage - 1))"
          @next="goToPage(currentPage + 1)"
        />
      </template>
    </section>
  </main>
</template>
