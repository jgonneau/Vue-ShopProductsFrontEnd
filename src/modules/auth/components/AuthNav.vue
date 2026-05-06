<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'

const auth = useAuthStore()
const router = useRouter()

const role = computed(() => auth.userRole)

const handleLogout = async () => {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="auth-nav">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/products">Products</RouterLink>
    <RouterLink to="/stores">Stores</RouterLink>

    <template v-if="auth.isAuthenticated">
      <RouterLink to="/profile">Profile</RouterLink>
      <RouterLink to="/account/orders">My Orders</RouterLink>
      <RouterLink to="/account/invoices">My Invoices</RouterLink>
      <RouterLink to="/account/security">Security</RouterLink>
      <RouterLink v-if="role === 'admin'" to="/admin">Admin</RouterLink>
      <RouterLink v-if="role === 'vendor' || role === 'admin'" to="/vendor">Vendor</RouterLink>
      <button type="button" @click="handleLogout">Logout</button>
    </template>
    <template v-else>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register">Register</RouterLink>
    </template>
  </nav>
</template>
