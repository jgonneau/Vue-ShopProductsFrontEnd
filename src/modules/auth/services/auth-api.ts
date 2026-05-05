import type { UserProfile, AuthTokens, LoginPayload, RegisterPayload } from '../types'
import { httpClient } from '../../../shared/api/http'

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await httpClient.post<AuthTokens>('/api/user/login/', payload, {
    withCredentials: true,
  })
  return data
}

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await httpClient.post<UserProfile>('/api/user/register/', payload)
  return data
}

export const refreshAccessToken = async () => {
  const { data } = await httpClient.post<Pick<AuthTokens, 'access'>>(
    '/api/user/token/refresh/',
    {},
    {
      withCredentials: true,
    },
  )
  return data
}

export const logoutUser = async () => {
  await httpClient.post(
    '/api/user/logout/',
    {},
    {
      withCredentials: true,
    },
  )
}

export const verifyAccessToken = async (token: string) => {
  await httpClient.post('/api/user/token/verify/', { token })
}

export const fetchCurrentUser = async () => {
  const { data } = await httpClient.get<UserProfile>('/api/user/')
  return data
}

export const updateCurrentUser = async (payload: Pick<UserProfile, 'username'>) => {
  const { data } = await httpClient.patch<UserProfile>('/api/user/', payload)
  return data
}
