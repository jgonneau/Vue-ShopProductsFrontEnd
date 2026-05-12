<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  username: '',
  password: '',
  passwordConfirm: '',
})

const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

const onSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  if (form.password !== form.passwordConfirm) {
    errorMessage.value = 'Passwords do not match.'
    isSubmitting.value = false
    return
  }

  try {
    await auth.register({
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      password_confirm: form.passwordConfirm,
    })

    router.push({ name: 'profile' })
  } catch {
    errorMessage.value = 'Unable to register user. Check your data and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="sp-page login-shell">
    <section class="login-hero" aria-hidden="true">
      <img
        src="https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&w=1200&q=80"
        alt=""
      />
      <div class="login-hero-overlay">
        <h2></h2>
        <p></p>
      </div>
    </section>

    <section class="login-pane">
      <div class="login-card">
        <RouterLink :to="{ name: 'home' }" class="sp-logo">ShopProducts</RouterLink>
        <h1>Create account</h1>
        <p class="login-subtitle">Join us — it only takes a moment.</p>

        <form class="form" @submit.prevent="onSubmit">
          <label>
            Email
            <input
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@email.com"
            />
          </label>

          <label>
            Username
            <input
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="Your name"
            />
          </label>

          <label>
            Password
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
            />
          </label>

          <label>
            Confirm password
            <input
              v-model="form.passwordConfirm"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
            />
          </label>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="login-switch">
          Already have an account?
          <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>
