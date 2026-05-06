import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  activateAdminProduct,
  bulkDeleteAdminLogs,
  changeAdminUserPassword,
  clearAdminLogsBySeverity,
  createAdminInvoice,
  createAdminOrder,
  createAdminProduct,
  createAdminStore,
  createAdminUser,
  deactivateAdminProduct,
  deleteAdminInvoice,
  deleteAdminOrder,
  deleteAdminProduct,
  deleteAdminStore,
  deleteAdminUser,
  fetchAdminInvoices,
  fetchAdminLogs,
  fetchAdminLogStats,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminStores,
  fetchAdminUsers,
  updateAdminInvoiceStatus,
  updateAdminOrderStatus,
  updateAdminProductStock,
  updateAdminUser,
} from '../services/admin-api'

export const useAdminUsers = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['admin-users', toValue(page)]),
    queryFn: () => fetchAdminUsers(toValue(page)),
    placeholderData: (previousData) => previousData,
  })

export const useAdminStores = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['admin-stores', toValue(page)]),
    queryFn: () => fetchAdminStores(toValue(page)),
    placeholderData: (previousData) => previousData,
  })

export const useAdminProducts = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['admin-products', toValue(page)]),
    queryFn: () => fetchAdminProducts(toValue(page)),
    placeholderData: (previousData) => previousData,
  })

export const useAdminOrders = (
  page: MaybeRefOrGetter<number>,
  filters: MaybeRefOrGetter<{ status?: string; customer?: string; store?: string }>,
) =>
  useQuery({
    queryKey: computed(() => ['admin-orders', toValue(page), toValue(filters)]),
    queryFn: () => fetchAdminOrders(toValue(page), toValue(filters)),
    placeholderData: (previousData) => previousData,
  })

export const useAdminInvoices = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['admin-invoices', toValue(page)]),
    queryFn: () => fetchAdminInvoices(toValue(page)),
    placeholderData: (previousData) => previousData,
  })

export const useAdminLogs = (
  page: MaybeRefOrGetter<number>,
  filters: MaybeRefOrGetter<{
    severity?: string
    source?: string
    start_date?: string
    end_date?: string
  }>,
) =>
  useQuery({
    queryKey: computed(() => ['admin-logs', toValue(page), toValue(filters)]),
    queryFn: () => fetchAdminLogs(toValue(page), toValue(filters)),
    placeholderData: (previousData) => previousData,
  })

export const useAdminLogStats = () =>
  useQuery({
    queryKey: ['admin-log-stats'],
    queryFn: fetchAdminLogStats,
  })

const useAdminMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  invalidateKeys: string[],
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(
        invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      )
    },
  })
}

export const useCreateAdminUser = () => useAdminMutation(createAdminUser, ['admin-users'])
export const useUpdateAdminUser = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateAdminUser(id, payload),
    ['admin-users'],
  )
export const useChangeAdminUserPassword = () =>
  useAdminMutation(changeAdminUserPassword, ['admin-users'])
export const useDeleteAdminUser = () => useAdminMutation(deleteAdminUser, ['admin-users'])

export const useCreateAdminStore = () => useAdminMutation(createAdminStore, ['admin-stores'])
export const useDeleteAdminStore = () => useAdminMutation(deleteAdminStore, ['admin-stores'])

export const useCreateAdminProduct = () => useAdminMutation(createAdminProduct, ['admin-products'])
export const useDeleteAdminProduct = () => useAdminMutation(deleteAdminProduct, ['admin-products'])
export const useUpdateAdminProductStock = () =>
  useAdminMutation(
    ({ id, stock }: { id: string; stock: number }) => updateAdminProductStock(id, stock),
    ['admin-products'],
  )
export const useActivateAdminProduct = () =>
  useAdminMutation(activateAdminProduct, ['admin-products'])
export const useDeactivateAdminProduct = () =>
  useAdminMutation(deactivateAdminProduct, ['admin-products'])

export const useCreateAdminOrder = () => useAdminMutation(createAdminOrder, ['admin-orders'])
export const useUpdateAdminOrderStatus = () =>
  useAdminMutation(
    ({ id, status }: { id: string; status: string }) => updateAdminOrderStatus(id, status),
    ['admin-orders'],
  )
export const useDeleteAdminOrder = () => useAdminMutation(deleteAdminOrder, ['admin-orders'])

export const useCreateAdminInvoice = () => useAdminMutation(createAdminInvoice, ['admin-invoices'])
export const useUpdateAdminInvoiceStatus = () =>
  useAdminMutation(
    ({ id, status }: { id: string; status: string }) => updateAdminInvoiceStatus(id, status),
    ['admin-invoices'],
  )
export const useDeleteAdminInvoice = () => useAdminMutation(deleteAdminInvoice, ['admin-invoices'])

export const useBulkDeleteAdminLogs = () =>
  useAdminMutation(bulkDeleteAdminLogs, ['admin-logs', 'admin-log-stats'])
export const useClearAdminLogsBySeverity = () =>
  useAdminMutation(clearAdminLogsBySeverity, ['admin-logs', 'admin-log-stats'])
