<script setup lang="ts">
import { computed, ref } from 'vue'
import ShopProductsFooter from '../components/ShopProductsFooter.vue'
import ShopProductsHeader from '../components/ShopProductsHeader.vue'
import ProductCard from '../components/ProductCard.vue'
import { usePublicProducts } from '../../public-catalog/composables/usePublicProducts'
import { mapPublicProductToShopProduct } from '../product-mapper'

const query = ref('')
const page = ref(1)
const selectedCategory = ref('All')
const selectedPriceRange = ref('all')
const sort = ref<'new' | 'low' | 'high'>('new')

const productsQuery = usePublicProducts(page)

const apiProducts = computed(() =>
  (productsQuery.data.value?.results ?? []).map((product) =>
    mapPublicProductToShopProduct(product),
  ),
)
const shopProductsCategories = computed(() => [
  'All',
  ...Array.from(new Set(apiProducts.value.map((product) => product.category))),
])
const hasNextPage = computed(() => Boolean(productsQuery.data.value?.next))
const hasPreviousPage = computed(() => Boolean(productsQuery.data.value?.previous))
const priceRangeOptions = [
  { label: 'All prices', value: 'all' },
  { label: '0 - 99', value: '0-99' },
  { label: '100 - 199', value: '100-199' },
  { label: '200 - 299', value: '200-299' },
  { label: '300 - 399', value: '300-399' },
  { label: '400+', value: '400-plus' },
]

const parsedPriceRange = computed(() => {
  if (selectedPriceRange.value === 'all') {
    return { min: 0, max: Number.POSITIVE_INFINITY }
  }
  if (selectedPriceRange.value === '400-plus') {
    return { min: 400, max: Number.POSITIVE_INFINITY }
  }

  const [min, max] = selectedPriceRange.value.split('-').map((chunk) => Number.parseInt(chunk, 10))
  return {
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : Number.POSITIVE_INFINITY,
  }
})

const results = computed(() => {
  let list = apiProducts.value.filter(
    (product) =>
      (selectedCategory.value === 'All' || product.category === selectedCategory.value) &&
      product.price >= parsedPriceRange.value.min &&
      product.price <= parsedPriceRange.value.max &&
      (query.value === '' || product.name.toLowerCase().includes(query.value.toLowerCase())),
  )

  if (sort.value === 'low') list = [...list].sort((a, b) => a.price - b.price)
  if (sort.value === 'high') list = [...list].sort((a, b) => b.price - a.price)
  return list
})

const resetFilters = () => {
  query.value = ''
  selectedCategory.value = 'All'
  selectedPriceRange.value = 'all'
  sort.value = 'new'
  page.value = 1
}
</script>

<template>
  <div class="sp-page">
    <ShopProductsHeader />

    <section class="container sp-shop">
      <header class="sp-shop-header">
        <p class="sp-kicker">The catalogue</p>
        <h1>Shop everything</h1>
      </header>

      <div class="sp-shop-layout">
        <aside class="sp-filters">
          <div class="sp-filters-row">
            <label class="sp-filter-item sp-filter-item--search">
              Search
              <input v-model="query" type="text" placeholder="Linen, brass, suede..." />
            </label>

            <div class="sp-filter-item sp-filter-item--category">
              <p>Category</p>
              <div class="sp-filter-list">
                <button
                  v-for="category in shopProductsCategories"
                  :key="category"
                  type="button"
                  :class="{ 'is-active': selectedCategory === category }"
                  @click="selectedCategory = category"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <div class="sp-filter-item sp-filter-item--price">
              <p>Price</p>
              <select v-model="selectedPriceRange">
                <option
                  v-for="option in priceRangeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="sp-filter-item sp-filter-item--reset">
              <button type="button" class="sp-pill" @click="resetFilters">Reset filters</button>
            </div>
          </div>
        </aside>

        <div>
          <div class="sp-results-bar">
            <p>
              <strong>{{ results.length }}</strong> pieces
            </p>
            <label>
              Sort
              <select v-model="sort">
                <option value="new">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>

          <p v-if="productsQuery.isPending.value">Loading products...</p>
          <p v-else-if="productsQuery.isError.value" class="error">
            Unable to load products right now.
          </p>
          <p v-else-if="results.length === 0" class="sp-empty">
            Nothing matches. Try looser filters.
          </p>
          <div v-else class="sp-product-grid">
            <ProductCard
              v-for="(product, index) in results"
              :key="product.id"
              :product="product"
              :index="index"
            />
          </div>
          <div v-if="hasPreviousPage || hasNextPage" class="pagination-controls">
            <button
              type="button"
              :disabled="!hasPreviousPage"
              @click="page = Math.max(1, page - 1)"
            >
              Previous
            </button>
            <span>Page {{ page }}</span>
            <button type="button" :disabled="!hasNextPage" @click="page += 1">Next</button>
          </div>
        </div>
      </div>
    </section>

    <ShopProductsFooter />
  </div>
</template>
