import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchStoreProducts } from '../services/customer-api'

export const useStoreProducts = (
  storeId: MaybeRefOrGetter<string>,
  page: MaybeRefOrGetter<number>,
) =>
  useQuery({
    queryKey: computed(() => ['store-products', toValue(storeId), toValue(page)]),
    queryFn: () => fetchStoreProducts(toValue(storeId), toValue(page)),
    enabled: computed(() => Boolean(toValue(storeId))),
    placeholderData: (previousData) => previousData,
  })
