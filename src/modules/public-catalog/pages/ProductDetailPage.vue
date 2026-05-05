<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AuthNav from '../../auth/components/AuthNav.vue'
import { usePublicProductDetail } from '../composables/usePublicProductDetail'

const route = useRoute()
const productId = computed(() => String(route.params.id ?? ''))
const productQuery = usePublicProductDetail(productId)
</script>

<template>
  <main class="container">
    <AuthNav />
    <RouterLink :to="{ name: 'products' }">Back to products</RouterLink>

    <section class="panel">
      <p v-if="productQuery.isPending.value">Loading product details...</p>
      <p v-else-if="productQuery.isError.value" class="error">Unable to load this product.</p>
      <template v-else-if="productQuery.data.value">
        <h1>{{ productQuery.data.value.title }}</h1>
        <p>{{ productQuery.data.value.description }}</p>
        <p><strong>Store:</strong> {{ productQuery.data.value.store_name }}</p>
        <p><strong>Reference:</strong> {{ productQuery.data.value.reference }}</p>
        <p><strong>Price:</strong> ${{ productQuery.data.value.price }}</p>
        <p :class="productQuery.data.value.in_stock ? 'success' : 'error'">
          {{ productQuery.data.value.in_stock ? 'In stock' : 'Out of stock' }}
        </p>
      </template>
    </section>
  </main>
</template>
