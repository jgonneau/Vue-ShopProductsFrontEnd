import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyOrders } from '../services/customer-api'

export const useMyOrders = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['customer-orders', toValue(page)]),
    queryFn: () => fetchMyOrders(toValue(page)),
    placeholderData: (previousData) => previousData,
  })
