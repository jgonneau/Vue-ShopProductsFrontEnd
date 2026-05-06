import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createOrder } from '../services/customer-api'

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customer-orders'] })
    },
  })
}
