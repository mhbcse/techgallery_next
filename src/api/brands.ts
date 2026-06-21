import apiClient from './client'
import type { Brand, PaginatedResponse, SingleResponse } from './types'

export async function listBrands(params?: {
  search?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Brand>> {
  const res = await apiClient.get<PaginatedResponse<Brand>>('/api/v1/brands', { params })
  return res.data
}

export async function getBrand(id: string): Promise<Brand> {
  const res = await apiClient.get<SingleResponse<Brand>>(`/api/v1/brands/${id}`)
  return res.data.data
}
