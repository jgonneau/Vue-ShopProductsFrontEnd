import type { AxiosError } from 'axios'

const STATUS_MESSAGE_MAP: Record<number, string> = {
  400: 'The request is invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with the current resource state.',
  422: 'The submitted data is not valid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Gateway error. Please try again later.',
  503: 'Service unavailable. Please try again later.',
  504: 'Request timed out. Please try again later.',
}

export const getApiErrorMessageByStatus = (status?: number) => {
  if (!status) {
    return 'Network issue detected. Please check your connection and retry.'
  }

  return STATUS_MESSAGE_MAP[status] ?? 'Unexpected API error'
}

export const isTransientApiError = (error: unknown) => {
  const axiosError = error as AxiosError
  const status = axiosError.response?.status

  if (!status) {
    return true
  }

  return status >= 500 || status === 429
}
