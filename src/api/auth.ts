import apiClient from './client'
import type { AuthTokens, Customer, SingleResponse } from './types'

export async function register(data: {
  name: string
  phone: string
  email: string
  password: string
  address?: string
}): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>('/api/v1/auth/register', data)
  return res.data
}

export async function login(data: {
  email: string
  password: string
}): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>('/api/v1/auth/login', data)
  return res.data
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  })
  return res.data
}

export async function getMe(): Promise<Customer> {
  const res = await apiClient.get<SingleResponse<Customer>>('/api/v1/auth/me')
  return res.data.data
}

export async function updateMe(data: {
  name?: string
  email?: string
  address?: string
}): Promise<Customer> {
  const res = await apiClient.patch<SingleResponse<Customer>>('/api/v1/auth/me', data)
  return res.data.data
}
