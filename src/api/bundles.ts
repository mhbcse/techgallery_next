import apiClient from './client'
import type { Bundle, PaginatedResponse, SingleResponse } from './types'

export async function listBundles(params?: {
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Bundle>> {
  const res = await apiClient.get<PaginatedResponse<Bundle>>('/api/v1/bundles', { params })
  return res.data
}

export async function getBundle(id: string): Promise<Bundle> {
  const res = await apiClient.get<SingleResponse<Bundle>>(`/api/v1/bundles/${id}`)
  return res.data.data
}
