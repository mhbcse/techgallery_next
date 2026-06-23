import apiClient from './client'
import type { Product, ProductDetail, PaginatedResponse, SingleResponse } from './types'

export async function listProducts(params?: {
  search?: string
  category_id?: string
  brand_id?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Product>> {
  const res = await apiClient.get<PaginatedResponse<Product>>('/api/v1/products', { params })
  return res.data
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  const res = await apiClient.get<SingleResponse<ProductDetail>>(`/api/v1/products/${slug}`)
  return res.data.data
}
