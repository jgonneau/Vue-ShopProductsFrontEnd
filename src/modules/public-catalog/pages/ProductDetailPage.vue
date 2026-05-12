<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ShopProductsCartAddButton from '../../shop-products/components/ShopProductsCartAddButton.vue'
import ShopProductsHeader from '../../shop-products/components/ShopProductsHeader.vue'
import { mapPublicProductToShopProduct } from '../../shop-products/product-mapper'
import { usePublicProductDetail } from '../composables/usePublicProductDetail'

const route = useRoute()
const productId = computed(() => String(route.params.id ?? ''))
const productQuery = usePublicProductDetail(productId)
const currentProduct = computed(() =>
  productQuery.data.value ? mapPublicProductToShopProduct(productQuery.data.value) : null,
)
const productImage = computed(
  () => `https://picsum.photos/seed/${encodeURIComponent(productId.value || 'product')}/1200/1500`,
)
</script>

<template>
  <main class="sp-page">
    <ShopProductsHeader />

    <section class="container sp-product-detail">
      <RouterLink :to="{ name: 'products' }" class="sp-link sp-product-detail-back">
        Back to products
      </RouterLink>

      <p v-if="productQuery.isPending.value">Loading product details...</p>
      <p v-else-if="productQuery.isError.value" class="error">Unable to load this product.</p>
      <template v-else-if="productQuery.data.value">
        <article class="sp-product-detail-card">
          <div class="sp-product-detail-image">
            <img :src="productImage" :alt="productQuery.data.value.title" loading="lazy" />
            <span class="sp-product-tag">
              {{ productQuery.data.value.in_stock ? 'In stock' : 'Out of stock' }}
            </span>
          </div>

          <div class="sp-product-detail-content">
            <p class="sp-kicker">{{ productQuery.data.value.store_name }}</p>
            <h1>{{ productQuery.data.value.title }}</h1>
            <p class="sp-product-detail-price">${{ productQuery.data.value.price }}</p>
            <p class="sp-product-detail-description">
              {{ productQuery.data.value.description }}
            </p>

            <dl class="sp-product-detail-meta">
              <div>
                <dt>Reference</dt>
                <dd>{{ productQuery.data.value.reference }}</dd>
              </div>

              <div>
                <dt>Availability</dt>
                <dd :class="productQuery.data.value.in_stock ? 'success' : 'error'">
                  {{ productQuery.data.value.in_stock ? 'Ready to ship' : 'Currently unavailable' }}
                </dd>
              </div>

              <div class="sp-product-detail-meta-double">
                <dt>Description item</dt>
                <dd>
                  {{ productQuery.data.value.description }}
                </dd>
              </div>
            </dl>

            <ShopProductsCartAddButton
              v-if="currentProduct"
              :product="currentProduct"
              :style="{ height: '50px', position: 'relative', bottom: '0' }"
              label="Add to cart"
            />
          </div>
        </article>
      </template>
    </section>
  </main>
</template>
