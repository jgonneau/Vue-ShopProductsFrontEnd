import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { fetchPublicProductById } from '../services/public-catalog-api'

export const usePublicProductDetail = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => ['public-product-detail', toValue(id)]),
    queryFn: () => fetchPublicProductById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  })
