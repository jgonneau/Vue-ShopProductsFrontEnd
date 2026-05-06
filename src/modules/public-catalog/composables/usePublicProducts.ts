import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchPublicProducts } from '../services/public-catalog-api'

export const usePublicProducts = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['public-products', toValue(page)]),
    queryFn: () => fetchPublicProducts(toValue(page)),
    placeholderData: (previousData) => previousData,
  })
