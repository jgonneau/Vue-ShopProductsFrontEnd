export type ApiError = {
  status?: number
  message: string
  details?: unknown
}

export type SchemaHealth = {
  keys: string[]
  title?: string
  version?: string
}

export type DrfPaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
