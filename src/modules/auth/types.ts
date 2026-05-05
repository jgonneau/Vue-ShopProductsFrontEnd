export type AuthTokens = {
  access: string
  refresh: string
}

export type UserProfile = {
  id: string
  email: string
  username: string | null
  role: 'admin' | 'vendor' | 'customer' | 'guest' | null
  created_at: string
  updated_at: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  username?: string
  password: string
  password_confirm: string
}
