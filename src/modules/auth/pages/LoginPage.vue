<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthNav from '../components/AuthNav.vue'
import { useAuthStore } from '../stores/auth-store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

const onSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    await auth.login({
      email: form.email.trim(),
      password: form.password,
    })

    const redirectTarget =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/profile'
    router.push(redirectTarget)
  } catch {
    errorMessage.value = 'Invalid credentials. Please verify your email and password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Login</h1>
    <p>Use your API credentials to get a valid JWT session.</p>

    <form class="panel form" @submit.prevent="onSubmit">
      <label>
        Email
        <input v-model="form.email" type="email" required autocomplete="email" />
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" required autocomplete="current-password" />
      </label>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </main>
</template>
