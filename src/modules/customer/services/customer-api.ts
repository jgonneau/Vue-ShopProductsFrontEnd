import { httpClient } from '../../../shared/api/http'
import { isAxiosError } from 'axios'
import type { DrfPaginatedResponse } from '../../../shared/types/api'
import type { PublicProduct } from '../../public-catalog/types'
import type {
  ChangePasswordPayload,
  CreateOrderPayload,
  CustomerInvoice,
  CustomerOrder,
  DeleteAccountPayload,
} from '../types'

export const fetchMyOrders = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<CustomerOrder>>('/api/orders/', {
    params: { page },
  })
  return data
}

export const fetchMyOrderById = async (orderId: string) => {
  try {
    const { data } = await httpClient.get<CustomerOrder>(`/api/orders/${orderId}/`)
    return data
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined
    if (status && status !== 404 && status !== 405) {
      throw error
    }
  }

  let page = 1
  let safetyCounter = 0

  while (safetyCounter < 50) {
    const paginatedOrders = await fetchMyOrders(page)
    const matchedOrder = paginatedOrders.results.find((order) => order.id === orderId)
    if (matchedOrder) {
      return matchedOrder
    }

    if (!paginatedOrders.next) {
      break
    }

    page += 1
    safetyCounter += 1
  }

  throw new Error('Order not found')
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const { data } = await httpClient.post<CustomerOrder>('/api/orders/', payload)
  return data
}

export const fetchMyInvoices = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<CustomerInvoice>>('/api/invoices/', {
    params: { page },
  })
  return data
}

export const fetchStoreProducts = async (storeId: string, page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<PublicProduct>>(
    `/api/products/store/${storeId}/`,
    {
      params: { page },
    },
  )
  return data
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const { data } = await httpClient.post<{ detail: string }>('/api/user/change-password/', payload)
  return data
}

export const deleteAccount = async (payload: DeleteAccountPayload) => {
  await httpClient.post('/api/user/delete/', payload)
}
