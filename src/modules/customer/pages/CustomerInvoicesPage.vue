<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ShopProductsFooter from '../../shop-products/components/ShopProductsFooter.vue'
import ShopProductsHeader from '../../shop-products/components/ShopProductsHeader.vue'
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
  <div class="sp-page sp-page--orders">
    <ShopProductsHeader />

    <main class="container sp-orders">
      <section class="sp-orders-header">
        <div>
          <p class="sp-kicker">Your account</p>
          <h1>My Invoices</h1>
          <p>View your invoice records and payment statuses.</p>
        </div>
        <div class="sp-stats">
          <!-- <div>
            <strong>{{ invoicesQuery.data.value?.count ?? 0 }}</strong>
            <span>Total invoices</span>
          </div> -->
        </div>
      </section>

      <section>
        <h2>Invoice history</h2>
        <p v-if="invoicesQuery.isPending.value">Loading invoices...</p>
        <p v-else-if="invoicesQuery.isError.value" class="error">
          Unable to load invoices right now.
        </p>
        <template v-else>
          <div v-if="(invoicesQuery.data.value?.results.length ?? 0) > 0" class="sp-order-list">
            <div
              v-for="invoice in invoicesQuery.data.value?.results ?? []"
              :key="invoice.id"
              class="sp-order-row"
            >
              <div>
                <p>{{ invoice.reference }}</p>
                <p>{{ invoice.store_name }}</p>
              </div>
              <div>
                <StatusBadge :status="invoice.status" />
                <p>${{ Number.parseFloat(invoice.total || '0').toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="sp-empty">
            <p>No invoices found.</p>
          </div>

          <PaginationControls
            v-if="
              Boolean(invoicesQuery.data.value?.previous) || Boolean(invoicesQuery.data.value?.next)
            "
            :page="currentPage"
            :has-previous="Boolean(invoicesQuery.data.value?.previous)"
            :has-next="Boolean(invoicesQuery.data.value?.next)"
            @previous="goToPage(Math.max(1, currentPage - 1))"
            @next="goToPage(currentPage + 1)"
          />
        </template>
      </section>
    </main>

    <ShopProductsFooter />
  </div>
</template>
