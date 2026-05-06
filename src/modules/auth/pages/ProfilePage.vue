<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AuthNav from '../components/AuthNav.vue'
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
  <main class="container">
    <AuthNav />
    <h1>My Profile</h1>

    <section v-if="user" class="panel">
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <p><strong>User ID:</strong> {{ user.id }}</p>
    </section>

    <form class="panel form" @submit.prevent="onSubmit">
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

    <section class="panel">
      <h2>Account area</h2>
      <p>Manage your customer workflows:</p>
      <p>
        <RouterLink to="/account/orders">My Orders</RouterLink> |
        <RouterLink to="/account/invoices">My Invoices</RouterLink> |
        <RouterLink to="/account/security">Account Security</RouterLink>
      </p>
    </section>
  </main>
</template>
