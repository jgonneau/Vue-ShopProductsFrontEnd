<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useMyOrders } from '../../customer/composables/useMyOrders'
import ShopProductsFooter from '../components/ShopProductsFooter.vue'
import ShopProductsHeader from '../components/ShopProductsHeader.vue'

const ordersQuery = useMyOrders(1)
const orders = computed(() => ordersQuery.data.value?.results ?? [])
const firstName = 'Customer'
const inTransit = computed(() => orders.value.filter((order) => order.status === 'shipped').length)
</script>

<template>
  <div class="sp-page sp-page--orders">
    <ShopProductsHeader />

    <section class="container sp-orders">
      <section class="sp-orders-header">
        <div>
          <p class="sp-kicker">Your account</p>
          <h1>Hello, {{ firstName }}!</h1>
          <p>Your latest orders and delivery updates.</p>
        </div>
        <div class="sp-stats">
          <div v-if="inTransit > 0">
            <strong>{{ inTransit }}</strong
            ><span>In transit</span>
          </div>
          <div>
            <strong class="sp-stats-item">{{ orders.length }}</strong
            ><span>Orders</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Order history</h2>
        <p v-if="ordersQuery.isPending.value">Loading your orders...</p>
        <p v-else-if="ordersQuery.isError.value" class="error">Unable to load your orders.</p>
        <div v-if="orders.length > 0" class="sp-order-list">
          <RouterLink
            v-for="order in orders"
            :key="order.id"
            :to="{ name: 'customer-order-detail', params: { orderId: order.id } }"
            class="sp-order-row"
          >
            <div>
              <p style="text-decoration: underline; font-weight: 600">{{ order.reference }}</p>
              <p>
                {{ new Date(order.created_at).toLocaleDateString() }} -
                {{ order.product_count }} item{{ order.product_count > 1 ? 's' : '' }}
              </p>
            </div>
            <div>
              <span class="status-badge" :class="`status-badge--${order.status}`">{{
                order.status
              }}</span>
              <p>${{ Number.parseFloat(order.total || '0').toFixed(2) }}</p>
            </div>
          </RouterLink>
        </div>
        <div v-else class="sp-empty">
          <p>You have no orders yet.</p>
          <RouterLink :to="{ name: 'products' }" class="white-button">Shop now</RouterLink>
        </div>
      </section>
    </section>

    <ShopProductsFooter />
  </div>
</template>
