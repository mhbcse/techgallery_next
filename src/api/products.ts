import apiClient from './client'
import type { ProductListItem, ProductDetail, PaginatedResponse, SingleResponse } from './types'

export async function listProducts(params?: {
  search?: string
  category_id?: string
  brand_id?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<ProductListItem>> {
  const res = await apiClient.get<PaginatedResponse<ProductListItem>>('/api/v1/products', { params })
  return res.data
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  const res = await apiClient.get<SingleResponse<ProductDetail>>(`/api/v1/products/${slug}`)
  return res.data.data
}
