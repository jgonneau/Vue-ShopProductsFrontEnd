import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { fetchPublicStoreById } from '../services/public-catalog-api'

export const usePublicStoreDetail = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => ['public-store-detail', toValue(id)]),
    queryFn: () => fetchPublicStoreById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  })
