let inMemoryAccessToken: string | null = null

export const setAccessToken = (token: string) => {
  inMemoryAccessToken = token
}

export const getAccessToken = () => {
  return inMemoryAccessToken
}

export const clearAuthTokens = () => {
  inMemoryAccessToken = null
}
