import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchPublicStores } from '../services/public-catalog-api'

export const usePublicStores = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['public-stores', toValue(page)]),
    queryFn: () => fetchPublicStores(toValue(page)),
    placeholderData: (previousData) => previousData,
  })
