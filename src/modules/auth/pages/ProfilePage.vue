<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ShopProductsFooter from '../../shop-products/components/ShopProductsFooter.vue'
import ShopProductsHeader from '../../shop-products/components/ShopProductsHeader.vue'
import { useAuthStore } from '../stores/auth-store'

const auth = useAuthStore()
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const form = reactive({
  username: '',
})

watch(
  () => auth.user?.username,
  (username) => {
    form.username = username ?? ''
  },
  { immediate: true },
)

const user = computed(() => auth.user)

const onSubmit = async () => {
  if (!user.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await auth.updateProfile({ username: form.username })
    successMessage.value = 'Profile updated successfully.'
  } catch {
    errorMessage.value = 'Unable to update profile right now.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="sp-page sp-page--orders">
    <ShopProductsHeader />

    <main class="container sp-orders">
      <section class="sp-orders-header">
        <div>
          <p class="sp-kicker">Your account</p>
          <h1>My Profile</h1>
          <p>Manage your identity and account details.</p>
        </div>
        <div v-if="user" class="sp-stats">
          <div>
            <strong>{{ user.role ?? 'customer' }}</strong>
            <span>Role</span>
          </div>
          <div>
            <strong>{{ user.id }}</strong>
            <span>User ID</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Profile details</h2>
        <div class="sp-order-list">
          <div class="sp-order-row">
            <div>
              <p>Email</p>
              <p>{{ user?.email ?? '-' }}</p>
            </div>
          </div>
          <div class="sp-order-row">
            <div>
              <p>Username</p>
              <p>{{ user?.username ?? '-' }}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Update username</h2>
        <form class="form sp-profile-form" @submit.prevent="onSubmit">
          <label>
            Username
            <input v-model="form.username" type="text" />
          </label>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save profile' }}
          </button>
        </form>
      </section>

      <section>
        <h2>Account area</h2>
        <div class="sp-order-list">
          <RouterLink to="/account/orders" class="sp-order-row">
            <div>
              <p>My Orders</p>
              <p>Track your purchases and deliveries.</p>
            </div>
          </RouterLink>
          <RouterLink to="/account/invoices" class="sp-order-row">
            <div>
              <p>My Invoices</p>
              <p>Review billing history and statuses.</p>
            </div>
          </RouterLink>
          <RouterLink to="/account/security" class="sp-order-row">
            <div>
              <p>Account Security</p>
              <p>Change password and account controls.</p>
            </div>
          </RouterLink>
        </div>
      </section>
    </main>

    <ShopProductsFooter />
  </div>
</template>
