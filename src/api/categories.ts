import apiClient from './client'
import type { CategoryTree, PaginatedResponse, SingleResponse } from './types'

export async function listCategories(params?: {
  tree?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<CategoryTree>> {
  const res = await apiClient.get<PaginatedResponse<CategoryTree>>('/api/v1/categories', { params })
  return res.data
}

export async function getCategory(id: string): Promise<CategoryTree> {
  const res = await apiClient.get<SingleResponse<CategoryTree>>(`/api/v1/categories/${id}`)
  return res.data.data
}
