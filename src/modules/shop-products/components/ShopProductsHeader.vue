<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/stores/auth-store'
import ShopProductsCartButton from './CartButton.vue'

const router = useRouter()
const auth = useAuthStore()

const handleLogout = async () => {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="sp-header">
    <div class="container sp-header-inner">
      <RouterLink :to="{ name: 'home' }" class="sp-logo">ShopProducts</RouterLink>

      <div v-if="auth.isAuthenticated" class="sp-header-actions">
        <RouterLink :to="{ name: 'products' }" class="baselink sp-header-link">
          <span class="sp-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
            </svg>
          </span>
          Catalog
        </RouterLink>

        <RouterLink :to="{ name: 'customer-orders' }" class="baselink sp-header-link">
          <span class="sp-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z" />
              <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
              <path d="M12 12v9" />
            </svg>
          </span>
          Orders
        </RouterLink>

        <RouterLink :to="{ name: 'customer-invoices' }" class="baselink sp-header-link">
          <span class="sp-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2Z" />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </svg>
          </span>
          Invoices
        </RouterLink>

        <RouterLink :to="{ name: 'account-security' }" class="baselink sp-header-link">
          <span class="sp-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 1 1 8 0v3" />
            </svg>
          </span>
          Account
        </RouterLink>

        <RouterLink
          v-if="auth.userRole === 'admin'"
          :to="{ name: 'admin-dashboard' }"
          class="baselink sp-header-link"
        >
          <span class="sp-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M14 7a4 4 0 1 0-5.2 3.8L4 15.6V20h4.4l4.8-4.8A4 4 0 0 0 14 7Z" />
              <path d="m15.5 8.5 3-3M18.5 5.5l1 1" />
            </svg>
          </span>
          Admin
        </RouterLink>

        <RouterLink
          v-if="auth.userRole === 'vendor' || auth.userRole === 'admin'"
          :to="{ name: 'vendor-dashboard' }"
          class="baselink sp-header-link"
        >
          <span class="sp-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 10h18v10H3z" />
              <path d="M5 10 6.5 4h11L19 10M9 14h6M7 20v-4M17 20v-4" />
            </svg>
          </span>
          Vendor
        </RouterLink>

        <ShopProductsCartButton />

        <button
          type="button"
          class="baselink sp-header-link sp-logout-button"
          style="color: #201b15; font-weight: bolder; text-decoration: underline"
          @click="handleLogout"
        >
          <span class="sp-link-icon" aria-hidden="true">
            <!-- <svg viewBox="0 0 24 24" fill="none">
              <path d="M10 17 5 12l5-5" />
              <path d="M5 12h10" />
              <path d="M14 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
            </svg> -->
          </span>
          Logout
        </button>
      </div>

      <div v-else class="sp-header-actions">
        <ShopProductsCartButton style="margin-right: 30px" />
        <RouterLink :to="{ name: 'register' }" class="baselink sp-header-link">
          Register
        </RouterLink>

        <RouterLink :to="{ name: 'login' }" class="sp-pill sp-header-link"> Login </RouterLink>
      </div>
    </div>
  </header>
</template>
