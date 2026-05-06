import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createOwnedStore, fetchOwnedStores } from '../services/vendor-api'

export const useOwnedStores = (page: MaybeRefOrGetter<number>) =>
  useQuery({
    queryKey: computed(() => ['vendor-owned-stores', toValue(page)]),
    queryFn: () => fetchOwnedStores(toValue(page)),
    placeholderData: (previousData) => previousData,
  })

export const useCreateOwnedStore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOwnedStore,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vendor-owned-stores'] })
    },
  })
}
