import apiClient from './client'
import type { CategoryTree, Product, CollectionResponse, PaginatedResponse, SingleResponse } from './types'

export async function listCategories(params?: {
  tree?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<CategoryTree>> {
  const res = await apiClient.get<PaginatedResponse<CategoryTree>>('/api/v1/categories', { params })
  return res.data
}

// Category details with its recursive children (by slug).
export async function getCategory(slug: string): Promise<CategoryTree> {
  const res = await apiClient.get<SingleResponse<CategoryTree>>(`/api/v1/categories/${slug}`)
  return res.data.data
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
