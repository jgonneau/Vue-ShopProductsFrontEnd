import type { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

const FALLBACK_MESSAGE = 'Unexpected API error'

export const normalizeApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ detail?: string }>
  const message = axiosError.response?.data?.detail ?? axiosError.message ?? FALLBACK_MESSAGE

  return {
    status: axiosError.response?.status,
    message,
    details: axiosError.response?.data,
  }
}
