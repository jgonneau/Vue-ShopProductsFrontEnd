import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createProductForStore } from '../services/vendor-api'

type CreateProductVariables = {
  storeId: string
  payload: {
    reference: string
    title: string
    description?: string
    price: string
    stock_quantity: number
    activated?: boolean
  }
}

export const useCreateProductForStore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, payload }: CreateProductVariables) =>
      createProductForStore(storeId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['vendor-owned-products'] })
      await queryClient.invalidateQueries({
        queryKey: ['vendor-store-products', variables.storeId],
      })
    },
  })
}
