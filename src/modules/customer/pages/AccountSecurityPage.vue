<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShopProductsFooter from '../../shop-products/components/ShopProductsFooter.vue'
import ShopProductsHeader from '../../shop-products/components/ShopProductsHeader.vue'
import { useAuthStore } from '../../auth/stores/auth-store'
import { normalizeApiError } from '../../../shared/api/errors'
import { changePassword, deleteAccount } from '../services/customer-api'

const auth = useAuthStore()
const router = useRouter()

const isChangingPassword = ref(false)
const isDeleting = ref(false)
const passwordSuccessMessage = ref<string | null>(null)
const passwordErrorMessage = ref<string | null>(null)
const deleteErrorMessage = ref<string | null>(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const deleteForm = reactive({
  password: '',
  confirmationText: '',
})

const onChangePassword = async () => {
  passwordSuccessMessage.value = null
  passwordErrorMessage.value = null

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrorMessage.value = 'New password confirmation does not match.'
    return
  }

  isChangingPassword.value = true

  try {
    await changePassword({
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword,
      new_password_confirm: passwordForm.confirmPassword,
    })
    passwordSuccessMessage.value = 'Password changed successfully.'
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    passwordErrorMessage.value = normalizeApiError(error).message
  } finally {
    isChangingPassword.value = false
  }
}

const onDeleteAccount = async () => {
  deleteErrorMessage.value = null

  if (deleteForm.confirmationText !== 'DELETE') {
    deleteErrorMessage.value = 'Type DELETE to confirm account deletion.'
    return
  }

  isDeleting.value = true

  try {
    await deleteAccount({ password: deleteForm.password })
    await auth.logout()
    await router.replace({ name: 'home' })
  } catch (error) {
    deleteErrorMessage.value = normalizeApiError(error).message
  } finally {
    isDeleting.value = false
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
          <h1>Account Security</h1>
          <p>Manage your password and account lifecycle.</p>
        </div>
        <div class="sp-stats">
          <!-- -->
        </div>
      </section>

      <section>
        <h2>Change password</h2>
        <form class="form sp-profile-form sp-security-form" @submit.prevent="onChangePassword">
          <label>
            Current password
            <input v-model="passwordForm.oldPassword" type="password" required />
          </label>
          <label>
            New password
            <input v-model="passwordForm.newPassword" type="password" required />
          </label>
          <label>
            Confirm new password
            <input v-model="passwordForm.confirmPassword" type="password" required />
          </label>

          <p v-if="passwordErrorMessage" class="error">{{ passwordErrorMessage }}</p>
          <p v-if="passwordSuccessMessage" class="success">{{ passwordSuccessMessage }}</p>

          <button type="submit" :disabled="isChangingPassword">
            {{ isChangingPassword ? 'Saving...' : 'Change password' }}
          </button>
        </form>
      </section>

      <section>
        <h2>Delete account</h2>
        <p>
          This action is permanent. Type <code>DELETE</code> and enter your password to confirm.
        </p>
        <form class="form sp-profile-form sp-security-form" @submit.prevent="onDeleteAccount">
          <label>
            Current password
            <input v-model="deleteForm.password" type="password" required />
          </label>
          <label>
            Confirmation text
            <input
              v-model="deleteForm.confirmationText"
              type="text"
              placeholder="DELETE"
              required
            />
          </label>

          <p v-if="deleteErrorMessage" class="error">{{ deleteErrorMessage }}</p>

          <button type="submit" :disabled="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Delete my account' }}
          </button>
        </form>
      </section>
    </main>

    <ShopProductsFooter />
  </div>
</template>
