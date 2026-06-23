import apiClient from './client'
import type { CategoryTree, Product, CollectionResponse, PaginatedResponse } from './types'

export async function listCategories(params?: {
  tree?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<CategoryTree>> {
  const res = await apiClient.get<PaginatedResponse<CategoryTree>>('/api/v1/categories', { params })
  return res.data
}

// Paginated products for a category (by slug), plus the resolved category for the heading.
export async function getCategoryProducts(
  slug: string,
  params?: { page?: number; per_page?: number }
): Promise<CollectionResponse<Product>> {
  const res = await apiClient.get<CollectionResponse<Product>>(
    `/api/v1/categories/${slug}/products`,
    { params }
  )
  return res.data
}
