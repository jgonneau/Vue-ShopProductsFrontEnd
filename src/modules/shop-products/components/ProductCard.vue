<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Product } from '../types'
import ShopProductsCartAddButton from './CartAddButton.vue'

const props = defineProps<{
  product: Product
  index?: number
}>()
</script>

<template>
  <article class="sp-product-card" :style="{ animationDelay: `${(props.index ?? 0) * 60}ms` }">
    <RouterLink
      :to="{ name: 'product-detail', params: { id: props.product.id } }"
      class="sp-card-link"
    >
      <div class="sp-product-image">
        <img :src="props.product.image" :alt="props.product.name" loading="lazy" />
        <span v-if="props.product.tag" class="sp-product-tag">{{ props.product.tag }}</span>
      </div>
      <div class="sp-product-meta">
        <div>
          <p>{{ props.product.category }}</p>
          <h3>{{ props.product.name }}</h3>
        </div>
        <p class="sp-product-price">${{ props.product.price }}</p>
      </div>
    </RouterLink>
    <ShopProductsCartAddButton :product="props.product" label="Add to cart" />
  </article>
</template>

<style scoped>
.sp-card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}
</style>
