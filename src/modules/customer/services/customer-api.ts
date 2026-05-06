import { httpClient } from '../../../shared/api/http'
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
