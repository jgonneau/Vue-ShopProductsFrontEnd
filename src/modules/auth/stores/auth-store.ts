import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginPayload, RegisterPayload, UserProfile } from '../types'
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateCurrentUser,
  verifyAccessToken,
} from '../services/auth-api'
import { clearAuthTokens, getAccessToken, setAccessToken } from '../services/token-storage'
import { useCart } from '@/modules/shop-products/composables/useCart'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isBootstrapped = ref(false)
  const isLoading = ref(false)

  const userRole = computed(() => user.value?.role ?? null)
  const isAuthenticated = computed(() => Boolean(user.value))
  const isAdmin = computed(() => userRole.value === 'admin')
  const isVendor = computed(() => userRole.value === 'vendor')

  const clearSession = () => {
    clearAuthTokens()
    user.value = null
  }

  const logout = async () => {
    try {
      await logoutUser()
      useCart().clearCart()
    } finally {
      clearSession()
    }
  }

  const hydrateUser = async () => {
    user.value = await fetchCurrentUser()
    return user.value
  }

  const initializeSession = async () => {
    if (isBootstrapped.value) {
      return
    }

    isLoading.value = true

    try {
      const access = getAccessToken()

      if (access) {
        await verifyAccessToken(access)
        setAccessToken(access)
        await hydrateUser()
        return
      }

      const { access: refreshedAccess } = await refreshAccessToken()
      setAccessToken(refreshedAccess)
      await hydrateUser()
    } catch {
      clearSession()
    } finally {
      isBootstrapped.value = true
      isLoading.value = false
    }
  }

  const login = async (payload: LoginPayload) => {
    const tokens = await loginUser(payload)
    setAccessToken(tokens.access)
    await hydrateUser()
  }

  const register = async (payload: RegisterPayload) => {
    await registerUser(payload)
    await login({
      email: payload.email,
      password: payload.password,
    })
  }

  const updateProfile = async (payload: Pick<UserProfile, 'username'>) => {
    user.value = await updateCurrentUser(payload)
  }

  return {
    user,
    userRole,
    isAuthenticated,
    isAdmin,
    isVendor,
    isBootstrapped,
    isLoading,
    initializeSession,
    login,
    register,
    logout,
    updateProfile,
  }
})
