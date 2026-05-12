<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ShopProductsHeader from '../../shop-products/components/ShopProductsHeader.vue'
import { usePublicStoreDetail } from '../composables/usePublicStoreDetail'

const route = useRoute()
const storeId = computed(() => String(route.params.id ?? ''))
const storeQuery = usePublicStoreDetail(storeId)
</script>

<template>
  <main class="container">
    <ShopProductsHeader />
    <RouterLink :to="{ name: 'stores' }">&larr; Back to stores</RouterLink>

    <section class="panel">
      <p v-if="storeQuery.isPending.value">Loading store details...</p>
      <p v-else-if="storeQuery.isError.value" class="error">Unable to load this store.</p>
      <template v-else-if="storeQuery.data.value">
        <h1>{{ storeQuery.data.value.name }}</h1>
        <p>{{ storeQuery.data.value.description }}</p>
        <p><strong>Phone:</strong> {{ storeQuery.data.value.phone }}</p>
        <p><strong>Address:</strong> {{ storeQuery.data.value.address }}</p>
        <p>
          <strong>Location:</strong>
          {{ storeQuery.data.value.city }}, {{ storeQuery.data.value.state }}
          {{ storeQuery.data.value.zip_code }}, {{ storeQuery.data.value.country }}
        </p>
      </template>
    </section>
  </main>
</template>
