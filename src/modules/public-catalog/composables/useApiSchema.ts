import { useQuery } from '@tanstack/vue-query'
import { fetchApiSchemaHealth } from '../../../shared/api/schema'

export const useApiSchema = () =>
  useQuery({
    queryKey: ['api-schema'],
    queryFn: fetchApiSchemaHealth,
  })
