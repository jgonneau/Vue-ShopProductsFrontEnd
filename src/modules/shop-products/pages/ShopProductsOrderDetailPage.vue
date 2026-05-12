<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useMyOrderDetail } from '../../customer/composables/useMyOrderDetail'
import ShopProductsFooter from '../components/ShopProductsFooter.vue'
import ShopProductsHeader from '../components/ShopProductsHeader.vue'

const route = useRoute()
const orderId = computed(() => String(route.params.orderId ?? ''))
const orderQuery = useMyOrderDetail(orderId)
const order = computed(() => orderQuery.data.value)

const steps = ['Processing', 'Shipped', 'Delivered']
const currentStep = computed(() => {
  const normalized =
    order.value?.status === 'processing'
      ? 'Processing'
      : order.value?.status === 'shipped'
        ? 'Shipped'
        : order.value?.status === 'delivered'
          ? 'Delivered'
          : ''
  return steps.findIndex((step) => step === normalized)
})
const subtotal = computed(() =>
  (order.value?.products ?? []).reduce(
    (sum, item) => sum + Number.parseFloat(item.price || '0'),
    0,
  ),
)
const tax = computed(() => Math.round(subtotal.value * 0.08))
</script>

<template>
  <div class="sp-page">
    <ShopProductsHeader />

    <section class="container sp-order-detail">
      <RouterLink :to="{ name: 'customer-orders' }" class="sp-link">&larr; All orders</RouterLink>

      <div v-if="orderQuery.isPending.value" class="sp-empty">
        <h1>Loading order...</h1>
      </div>
      <div v-else-if="orderQuery.isError.value" class="sp-empty error">
        <h1>Unable to load order details</h1>
      </div>
      <div v-else-if="!order" class="sp-empty">
        <h1>Order not found</h1>
      </div>

      <template v-else>
        <section class="sp-order-detail-header">
          <div>
            <p class="sp-kicker">Order</p>
            <h1>{{ order.reference }}</h1>
            <p>Placed {{ new Date(order.created_at).toLocaleDateString() }}</p>
          </div>
          <span class="status-badge">{{ order.status }}</span>
        </section>

        <section v-if="order.status !== 'cancelled'" class="sp-stepper">
          <div
            v-for="(step, index) in steps"
            :key="step"
            :class="['sp-step', { done: index <= currentStep }]"
          >
            <span>{{ index + 1 }}</span>
            <p>{{ step }}</p>
          </div>
        </section>

        <div class="sp-order-grid">
          <section>
            <h2>Items</h2>
            <article v-for="item in order.products" :key="item.id" class="sp-order-item">
              <img
                :src="`https://picsum.photos/seed/${encodeURIComponent(item.id)}/400/500`"
                :alt="item.title"
              />
              <div>
                <p>{{ item.title }}</p>
                <p>Ref {{ item.reference }}</p>
              </div>
              <p>${{ Number.parseFloat(item.price || '0').toFixed(2) }}</p>
            </article>
          </section>

          <aside class="sp-summary">
            <h2>Summary</h2>
            <p>
              <span>Subtotal</span><span>${{ subtotal }}</span>
            </p>
            <p><span>Shipping</span><span>Free</span></p>
            <p>
              <span>Tax</span><span>${{ tax }}</span>
            </p>
            <p>
              <span>Total</span
              ><strong>${{ Number.parseFloat(order.total || '0').toFixed(2) }}</strong>
            </p>

            <h3>Store</h3>
            <p>{{ order.store_name }}</p>
            <p>Status: {{ order.status }}</p>
            <p>Invoice: {{ order.invoice ?? 'Not issued' }}</p>
          </aside>
        </div>
      </template>
    </section>

    <ShopProductsFooter />
  </div>
</template>
