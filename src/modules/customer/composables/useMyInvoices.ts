import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyInvoices } from '../services/customer-api'

export const useMyInvoices = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['customer-invoices', toValue(page)]),
    queryFn: () => fetchMyInvoices(toValue(page)),
    placeholderData: (previousData) => previousData,
  })
