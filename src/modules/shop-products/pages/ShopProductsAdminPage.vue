<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useAdminOrders,
  useAdminProducts,
  useAdminUsers,
} from '../../admin/composables/useAdminResources'
import ShopProductsFooter from '../components/ShopProductsFooter.vue'
import ShopProductsHeader from '../components/ShopProductsHeader.vue'

const ordersPage = ref(1)
const productsPage = ref(1)
const usersPage = ref(1)

const ordersQuery = useAdminOrders(ordersPage, ref({}))
const productsQuery = useAdminProducts(productsPage)
const usersQuery = useAdminUsers(usersPage)

const orders = computed(() => ordersQuery.data.value?.results ?? [])
const products = computed(() => productsQuery.data.value?.results ?? [])
const users = computed(() => usersQuery.data.value?.results ?? [])

const totalRevenue = computed(() =>
  orders.value
    .reduce((sum, order) => sum + Number.parseFloat(order.total || '0'), 0)
    .toLocaleString(undefined, { maximumFractionDigits: 2 }),
)
const conversionRate = computed(() => {
  if (users.value.length === 0) return '0.0'
  const customerCount = users.value.filter((user) => user.role === 'customer').length
  return ((customerCount / users.value.length) * 100).toFixed(1)
})

const cards = computed(() => [
  { label: 'Revenue', value: `$${totalRevenue.value}`, delta: 'live' },
  { label: 'Orders', value: String(orders.value.length), delta: 'live' },
  {
    label: 'Customers',
    value: String(users.value.filter((user) => user.role === 'customer').length),
    delta: 'live',
  },
  { label: 'Conversion', value: `${conversionRate.value}%`, delta: 'live' },
])

const chartPoints = computed(() =>
  orders.value
    .slice(0, 12)
    .map((order) => Number.parseFloat(order.total || '0'))
    .reverse(),
)
const maxWeekly = computed(() => Math.max(...chartPoints.value, 1))

const topSellers = computed(() =>
  [...products.value]
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 4)
    .map((product) => ({
      name: product.title,
      units: product.stock_quantity,
      revenue: Number.parseFloat(product.price || '0') * product.stock_quantity,
    })),
)
</script>

<template>
  <div class="sp-page">
    <ShopProductsHeader />

    <section class="container sp-admin">
      <section class="sp-admin-header">
        <p class="sp-kicker">Studio</p>
        <h1>Dashboard</h1>
      </section>

      <section class="sp-kpi-grid">
        <article v-for="card in cards" :key="card.label">
          <p>{{ card.label }}</p>
          <h2>{{ card.value }}</h2>
          <span>{{ card.delta }} vs last month</span>
        </article>
      </section>

      <p
        v-if="
          ordersQuery.isPending.value || productsQuery.isPending.value || usersQuery.isPending.value
        "
      >
        Loading admin analytics...
      </p>
      <p
        v-else-if="
          ordersQuery.isError.value || productsQuery.isError.value || usersQuery.isError.value
        "
        class="error"
      >
        Unable to load admin analytics.
      </p>

      <section class="sp-admin-grid">
        <article class="sp-chart">
          <h3>Revenue (12 weeks)</h3>
          <div>
            <span
              v-for="(value, index) in chartPoints"
              :key="index"
              :style="{ height: `${(value / maxWeekly) * 100}%` }"
            />
          </div>
        </article>

        <article class="sp-top-products">
          <h3>Top sellers</h3>
          <div v-for="item in topSellers" :key="item.name">
            <p>{{ item.name }}</p>
            <p>${{ item.revenue.toLocaleString() }} - {{ item.units }} units</p>
          </div>
        </article>
      </section>

      <section class="sp-recent-orders">
        <h3>Recent orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.reference }}</td>
              <td>{{ order.customer_email }}</td>
              <td>{{ order.status }}</td>
              <td>${{ order.total }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>

    <ShopProductsFooter />
  </div>
</template>
