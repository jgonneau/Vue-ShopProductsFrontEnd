<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthNav from '../../auth/components/AuthNav.vue'
import PaginationControls from '../../../shared/ui/PaginationControls.vue'
import StatusBadge from '../../../shared/ui/StatusBadge.vue'
import { useMyInvoices } from '../composables/useMyInvoices'

const route = useRoute()
const router = useRouter()

const currentPage = computed(() => {
  const rawPage = Number(route.query.page ?? 1)
  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
})

const invoicesQuery = useMyInvoices(currentPage)

const goToPage = async (nextPage: number) => {
  await router.replace({
    name: 'customer-invoices',
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
    <h1>My Invoices</h1>
    <p>View your invoice records and payment statuses.</p>

    <section class="panel">
      <p v-if="invoicesQuery.isPending.value">Loading invoices...</p>
      <p v-else-if="invoicesQuery.isError.value" class="error">
        Unable to load invoices right now.
      </p>
      <template v-else>
        <ul v-if="(invoicesQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
          <li
            v-for="invoice in invoicesQuery.data.value?.results ?? []"
            :key="invoice.id"
            class="catalog-card"
          >
            <h3>{{ invoice.reference }}</h3>
            <p><strong>Store:</strong> {{ invoice.store_name }}</p>
            <p><strong>Total:</strong> ${{ invoice.total }}</p>
            <p>
              <strong>Status:</strong>
              <StatusBadge :status="invoice.status" />
            </p>
          </li>
        </ul>
        <p v-else>No invoices found.</p>

        <PaginationControls
          :page="currentPage"
          :has-previous="Boolean(invoicesQuery.data.value?.previous)"
          :has-next="Boolean(invoicesQuery.data.value?.next)"
          @previous="goToPage(Math.max(1, currentPage - 1))"
          @next="goToPage(currentPage + 1)"
        />
      </template>
    </section>
  </main>
</template>
