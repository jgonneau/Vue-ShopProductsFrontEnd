<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthNav from '../components/AuthNav.vue'
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
  <main class="container">
    <AuthNav />
    <h1>Register</h1>
    <p>Create your account, then the app signs you in automatically.</p>

    <form class="panel form" @submit.prevent="onSubmit">
      <label>
        Email
        <input v-model="form.email" type="email" required autocomplete="email" />
      </label>

      <label>
        Username
        <input v-model="form.username" type="text" autocomplete="username" />
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" required autocomplete="new-password" />
      </label>

      <label>
        Confirm password
        <input
          v-model="form.passwordConfirm"
          type="password"
          required
          autocomplete="new-password"
        />
      </label>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </button>
    </form>
  </main>
</template>
