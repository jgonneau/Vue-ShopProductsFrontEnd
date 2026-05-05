import { httpClient } from './http'
import { normalizeApiError } from './errors'
import type { SchemaHealth } from '../types/api'

type OpenApiSchema = {
  openapi?: string
  info?: {
    title?: string
    version?: string
  }
  [key: string]: unknown
}

export const fetchApiSchemaHealth = async (): Promise<SchemaHealth> => {
  try {
    const { data } = await httpClient.get<OpenApiSchema>('/api/schema/')

    return {
      keys: Object.keys(data),
      title: data.info?.title,
      version: data.info?.version ?? data.openapi,
    }
  } catch (error) {
    throw normalizeApiError(error)
  }
}
