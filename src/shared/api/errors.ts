import type { AxiosError } from 'axios'
import type { ApiError } from '../types/api'
import { getApiErrorMessageByStatus } from './error-map'

export const normalizeApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ detail?: string }>
  const status = axiosError.response?.status
  const detailMessage = axiosError.response?.data?.detail
  const message =
    detailMessage ||
    (status
      ? getApiErrorMessageByStatus(status)
      : axiosError.message || getApiErrorMessageByStatus())

  return {
    status,
    message,
    details: axiosError.response?.data,
  }
}
