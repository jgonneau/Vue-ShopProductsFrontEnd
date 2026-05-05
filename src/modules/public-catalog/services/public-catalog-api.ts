import { httpClient } from '../../../shared/api/http'
import type { DrfPaginatedResponse } from '../../../shared/types/api'
import type { PublicProduct, PublicStoreDetail, PublicStoreListItem } from '../types'

export const fetchPublicProducts = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<PublicProduct>>('/api/products/', {
    params: { page },
  })
  return data
}

export const fetchPublicProductById = async (id: string) => {
  const { data } = await httpClient.get<PublicProduct>(`/api/products/${id}/`)
  return data
}

export const fetchPublicStores = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<PublicStoreListItem>>('/api/stores/', {
    params: { page },
  })
  return data
}

export const fetchPublicStoreById = async (id: string) => {
  const { data } = await httpClient.get<PublicStoreDetail>(`/api/stores/${id}/`)
  return data
}
