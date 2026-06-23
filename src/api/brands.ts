import apiClient from './client'
import type { Brand, Product, CollectionResponse, PaginatedResponse } from './types'

export async function listBrands(params?: {
  search?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Brand>> {
  const res = await apiClient.get<PaginatedResponse<Brand>>('/api/v1/brands', { params })
  return res.data
}

// Paginated products for a brand (by slug), plus the resolved brand for the heading.
export async function getBrandProducts(
  slug: string,
  params?: { page?: number; per_page?: number }
): Promise<CollectionResponse<Product>> {
  const res = await apiClient.get<CollectionResponse<Product>>(
    `/api/v1/brands/${slug}/products`,
    { params }
  )
  return res.data
}
