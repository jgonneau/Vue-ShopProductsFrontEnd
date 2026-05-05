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
