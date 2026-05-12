<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePublicProducts } from '../../public-catalog/composables/usePublicProducts'
import ShopProductsFooter from '../components/ShopProductsFooter.vue'
import ShopProductsHeader from '../components/ShopProductsHeader.vue'
import { mapPublicProductToShopProduct } from '../product-mapper'

const featuredProductsQuery = usePublicProducts(1)
const featured = computed(() =>
  (featuredProductsQuery.data.value?.results ?? [])
    .map((product) => mapPublicProductToShopProduct(product))
    .slice(0, 8),
)
const marqueeProducts = computed(() => [...featured.value, ...featured.value])
</script>

<template>
  <div class="sp-page sp-page--home">
    <ShopProductsHeader />

    <section class="sp-marquee">
      <div class="container">
        <div class="panel-header">
          <h2>Featured this week:</h2>
          <RouterLink :to="{ name: 'products' }" style="text-decoration: underline"
            >&gt; See all</RouterLink
          >
        </div>
      </div>
      <p v-if="featuredProductsQuery.isPending.value" class="container">
        Loading featured products...
      </p>
      <p v-else-if="featuredProductsQuery.isError.value" class="container error">
        Unable to load featured products.
      </p>
      <div v-else-if="marqueeProducts.length > 0" class="sp-marquee-rows">
        <div class="sp-marquee-track">
          <RouterLink
            v-for="(product, index) in marqueeProducts"
            :key="`row-1-${product.id}-${index}`"
            :to="{ name: 'product-detail', params: { id: product.id } }"
            class="sp-marquee-item"
          >
            <img :src="product.image" :alt="product.name" loading="lazy" />
            <div>
              <p>{{ product.name }}</p>
              <p class="sp-product-price">${{ product.price }}</p>
            </div>
          </RouterLink>
        </div>
        <div class="sp-marquee-track sp-marquee-track--reverse">
          <RouterLink
            v-for="(product, index) in marqueeProducts"
            :key="`row-2-${product.id}-${index}`"
            :to="{ name: 'product-detail', params: { id: product.id } }"
            class="sp-marquee-item"
          >
            <img :src="product.image" :alt="product.name" loading="lazy" />
            <div>
              <p>{{ product.name }}</p>
              <p class="sp-product-price">${{ product.price }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
      <p v-else class="container">No featured products available right now.</p>
    </section>

    <ShopProductsFooter />
  </div>
</template>
