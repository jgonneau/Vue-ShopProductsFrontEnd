import { httpClient } from '../../../shared/api/http'
import type { DrfPaginatedResponse } from '../../../shared/types/api'
import type {
  CreateVendorProductPayload,
  CreateVendorStorePayload,
  VendorProduct,
  VendorStore,
} from '../types'

export const fetchOwnedStores = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<VendorStore>>('/api/stores/mystore/', {
    params: { page },
  })
  return data
}

export const createOwnedStore = async (payload: CreateVendorStorePayload) => {
  const { data } = await httpClient.post<VendorStore>('/api/stores/mystore/', payload)
  return data
}

export const fetchOwnedProducts = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<VendorProduct>>(
    '/api/products/myproducts/',
    {
      params: { page },
    },
  )
  return data
}

export const fetchOwnedStoreProducts = async (storeId: string, page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<VendorProduct>>(
    `/api/products/myproducts/fromstore/${storeId}/`,
    {
      params: { page },
    },
  )
  return data
}

export const createProductForStore = async (
  storeId: string,
  payload: CreateVendorProductPayload,
) => {
  const { data } = await httpClient.post<VendorProduct>(
    `/api/products/myproducts/fromstore/${storeId}/`,
    payload,
  )
  return data
}
