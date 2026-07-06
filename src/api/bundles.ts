import apiClient from './client'
import type { Bundle, PaginatedResponse, SingleResponse } from './types'

export async function listBundles(params?: {
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Bundle>> {
  const res = await apiClient.get<PaginatedResponse<Bundle>>('/api/v1/bundles', { params })
  return res.data
}

export async function getBundle(slug: string): Promise<Bundle> {
  const res = await apiClient.get<SingleResponse<Bundle>>(`/api/v1/bundles/${slug}`)
  return res.data.data
}

// Min/max combo price across a bundle's combos, for "from {min}" card pricing.
// minOriginal is the original price of the cheapest combo (for a SALE badge).
export function bundlePriceRange(bundle: Bundle): {
  min: number
  max: number
  minOriginal: number | null
} {
  const combos = bundle.variants
  if (combos.length === 0) return { min: 0, max: 0, minOriginal: null }
  let cheapest = combos[0]
  let max = combos[0].price
  for (const c of combos) {
    if (c.price < cheapest.price) cheapest = c
    if (c.price > max) max = c.price
  }
  return { min: cheapest.price, max, minOriginal: cheapest.original_price }
}
