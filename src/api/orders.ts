import apiClient from './client'
import type { Order, OrderTracking, PaginatedResponse, SingleResponse } from './types'

export async function listOrders(params?: {
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Order>> {
  const res = await apiClient.get<PaginatedResponse<Order>>('/api/v1/orders', { params })
  return res.data
}

// Each order_items line carries exactly one of variant_id, bundle_variant_id, or
// quantity_tier_id (most-specific wins server-side). Pricing is recomputed in Rails.
export type OrderItemInput =
  | { variant_id: number; quantity: number }
  | { bundle_variant_id: number; quantity: number }
  | { quantity_tier_id: number; quantity: number }

export async function createOrder(data: {
  order?: {
    customer_name?: string
    customer_phone?: string
    customer_address?: string
    customer_email?: string
    customer_district?: string
    customer_area?: string
    landing_page_id?: number
  }
  order_items: OrderItemInput[]
  // Optional zone hint; not trusted — Rails recomputes shipping server-side.
  shipping_area?: string
  // Client-displayed estimate only; the server recomputes the authoritative value.
  shipping_charge?: number
  custom_fields?: Record<string, unknown>
  // Only needed when the API has RECAPTCHA_SECRET_KEY configured.
  recaptcha_token?: string
  tracking?: OrderTracking
}): Promise<Order> {
  const res = await apiClient.post<SingleResponse<Order>>('/api/v1/orders', data)
  return res.data.data
}

export async function getOrder(id: string): Promise<Order> {
  const res = await apiClient.get<SingleResponse<Order>>(`/api/v1/orders/${id}`)
  return res.data.data
}
