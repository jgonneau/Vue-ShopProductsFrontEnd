import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import {
  clearAuthTokens,
  getAccessToken,
  setAccessToken,
} from '../../modules/auth/services/token-storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

const tokenRefreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async () => {
  const { data } = await tokenRefreshClient.post<{ access: string }>('/api/user/token/refresh/', {})

  setAccessToken(data.access)
  return data.access
}

const getOrCreateRefreshPromise = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .catch(() => {
        clearAuthTokens()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status as number | undefined
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const isRefreshEndpoint = originalRequest?.url?.includes('/api/user/token/refresh/')

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    const refreshedToken = await getOrCreateRefreshPromise()

    if (!refreshedToken) {
      return Promise.reject(error)
    }

    return httpClient.request(originalRequest)
  },
)
