import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMyOrderById } from '../services/customer-api'

export const useMyOrderDetail = (orderId: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => ['customer-order-detail', toValue(orderId)]),
    queryFn: () => fetchMyOrderById(toValue(orderId)),
    enabled: computed(() => Boolean(toValue(orderId))),
  })
