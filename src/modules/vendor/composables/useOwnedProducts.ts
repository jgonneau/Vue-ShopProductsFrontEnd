import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchOwnedProducts, fetchOwnedStoreProducts } from '../services/vendor-api'

export const useOwnedProducts = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['vendor-owned-products', toValue(page)]),
    queryFn: () => fetchOwnedProducts(toValue(page)),
    placeholderData: (previousData) => previousData,
  })

export const useOwnedStoreProducts = (
  storeId: MaybeRefOrGetter<string>,
  page: MaybeRefOrGetter<number>,
) =>
  useQuery({
    queryKey: computed(() => ['vendor-store-products', toValue(storeId), toValue(page)]),
    queryFn: () => fetchOwnedStoreProducts(toValue(storeId), toValue(page)),
    enabled: computed(() => Boolean(toValue(storeId))),
    placeholderData: (previousData) => previousData,
  })
