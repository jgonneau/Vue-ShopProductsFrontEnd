import { httpClient } from '../../../shared/api/http'
import type { DrfPaginatedResponse } from '../../../shared/types/api'
import type {
  AdminInvoice,
  AdminLog,
  AdminLogStats,
  AdminOrder,
  AdminProduct,
  AdminStore,
  AdminUser,
} from '../types'

export const fetchAdminUsers = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<AdminUser>>('/api/admin/user/', {
    params: { page },
  })
  return data
}

export const createAdminUser = async (payload: {
  email: string
  username?: string
  password: string
  role?: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}) => {
  const { data } = await httpClient.post<AdminUser>('/api/admin/user/', payload)
  return data
}

export const updateAdminUser = async (id: string, payload: Partial<AdminUser>) => {
  const { data } = await httpClient.patch<AdminUser>(`/api/admin/user/${id}/`, payload)
  return data
}

export const changeAdminUserPassword = async (payload: {
  user_id: string
  new_password: string
  new_password_confirm: string
}) => {
  const { data } = await httpClient.post<{ detail: string }>(
    '/api/admin/user/change-password/',
    payload,
  )
  return data
}

export const deleteAdminUser = async (payload: { user_id: string }) => {
  await httpClient.post('/api/admin/user/delete/', payload)
}

export const fetchAdminStores = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<AdminStore>>('/api/admin/stores/', {
    params: { page },
  })
  return data
}

export const createAdminStore = async (payload: {
  name: string
  owner: string
  description?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
}) => {
  const { data } = await httpClient.post<AdminStore>('/api/admin/stores/', payload)
  return data
}

export const deleteAdminStore = async (id: string) => {
  await httpClient.delete(`/api/admin/stores/${id}/`)
}

export const fetchAdminProducts = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<AdminProduct>>(
    '/api/admin/products/',
    {
      params: { page },
    },
  )
  return data
}

export const createAdminProduct = async (payload: {
  reference: string
  title: string
  price: string
  stock_quantity: number
  store: string
  description?: string
  activated?: boolean
}) => {
  const { data } = await httpClient.post<AdminProduct>('/api/admin/products/', payload)
  return data
}

export const deleteAdminProduct = async (id: string) => {
  await httpClient.delete(`/api/admin/products/${id}/`)
}

export const updateAdminProductStock = async (id: string, stock_quantity: number) => {
  const { data } = await httpClient.patch<AdminProduct>(`/api/admin/products/${id}/stock/`, {
    stock_quantity,
  })
  return data
}

export const activateAdminProduct = async (id: string) => {
  const { data } = await httpClient.post<AdminProduct>(`/api/admin/products/${id}/activate/`, {})
  return data
}

export const deactivateAdminProduct = async (id: string) => {
  const { data } = await httpClient.post<AdminProduct>(`/api/admin/products/${id}/deactivate/`, {})
  return data
}

export const fetchAdminOrders = async (
  page = 1,
  filters?: { status?: string; customer?: string; store?: string },
) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<AdminOrder>>('/api/admin/orders/', {
    params: { page, ...filters },
  })
  return data
}

export const createAdminOrder = async (payload: {
  reference: string
  total: string
  status: string
  customer: string
  store: string
  products?: string[]
  content?: Record<string, unknown> | null
  invoice?: string | null
  delivery_date?: string | null
}) => {
  const { data } = await httpClient.post<AdminOrder>('/api/admin/orders/', payload)
  return data
}

export const updateAdminOrderStatus = async (id: string, status: string) => {
  const { data } = await httpClient.patch<AdminOrder>(`/api/admin/orders/${id}/status/`, { status })
  return data
}

export const deleteAdminOrder = async (id: string) => {
  await httpClient.delete(`/api/admin/orders/${id}/`)
}

export const fetchAdminInvoices = async (page = 1) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<AdminInvoice>>(
    '/api/admin/invoices/',
    {
      params: { page },
    },
  )
  return data
}

export const createAdminInvoice = async (payload: {
  reference: string
  total: string
  status: string
  customer: string
  store: string
  content?: Record<string, unknown> | null
}) => {
  const { data } = await httpClient.post<AdminInvoice>('/api/admin/invoices/', payload)
  return data
}

export const updateAdminInvoiceStatus = async (id: string, status: string) => {
  const { data } = await httpClient.patch<AdminInvoice>(`/api/admin/invoices/${id}/status/`, {
    status,
  })
  return data
}

export const deleteAdminInvoice = async (id: string) => {
  await httpClient.delete(`/api/admin/invoices/${id}/`)
}

export const fetchAdminLogs = async (
  page = 1,
  filters?: { severity?: string; source?: string; start_date?: string; end_date?: string },
) => {
  const { data } = await httpClient.get<DrfPaginatedResponse<AdminLog>>('/api/admin/logs/', {
    params: { page, ...filters },
  })
  return data
}

export const fetchAdminLogStats = async () => {
  const { data } = await httpClient.get<AdminLogStats>('/api/admin/logs/stats/')
  return data
}

export const bulkDeleteAdminLogs = async (ids: string[]) => {
  const { data } = await httpClient.post<{ deleted_count: number }>(
    '/api/admin/logs/bulk-delete/',
    {
      ids,
    },
  )
  return data
}

export const clearAdminLogsBySeverity = async (severity: string) => {
  const { data } = await httpClient.post<{ deleted_count: number; severity: string }>(
    '/api/admin/logs/clear-by-severity/',
    { severity },
  )
  return data
}
