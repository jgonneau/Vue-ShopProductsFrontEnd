<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'

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

    router.push({ name: 'products' })
  } catch {
    errorMessage.value = 'Invalid credentials. Please verify your email and password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="sp-page login-shell">
    <section class="login-hero" aria-hidden="true">
      <img
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
        alt=""
      />
      <div v-if="false" class="login-hero-overlay">
        <h2></h2>
        <p></p>
      </div>
    </section>

    <section class="login-pane">
      <div class="login-card">
        <RouterLink :to="{ name: 'home' }" class="sp-logo">ShopProducts</RouterLink>
        <h1>Welcome back</h1>
        <p class="login-subtitle">Enter your details to continue.</p>

        <form class="form" @submit.prevent="onSubmit">
          <label>
            Email
            <input
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            <span class="login-label-row">
              <span>Password</span>
              <button v-if="false" type="button" class="login-muted-action">Forgot?</button>
            </span>
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Just a moment…' : 'Sign in' }}
          </button>
        </form>

        <p class="register-switch">
          New here? Join us!
          <RouterLink :to="{ name: 'register' }">Create an account</RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>
