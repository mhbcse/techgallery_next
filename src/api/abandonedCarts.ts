import apiClient from './client'
import type { OrderTracking } from './types'
import type { OrderItemInput } from './orders'

export interface AbandonedCartPayload {
  customer_phone: string
  customer_name?: string
  customer_address?: string
  customer_district?: string
  customer_area?: string
  shipping_charge?: number
  order_items?: OrderItemInput[]
  tracking?: OrderTracking
}

// Silent lead capture. Backend always responds 204 and never surfaces validation errors.
export async function captureAbandonedCart(payload: AbandonedCartPayload): Promise<void> {
  try {
    await apiClient.post('/api/v1/abandoned-carts', payload)
  } catch {
    // Capture is best-effort; swallow errors.
  }
}
