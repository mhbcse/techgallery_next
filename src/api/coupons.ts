import apiClient from './client'
import type { SingleResponse } from './types'
import type { OrderItemInput } from './orders'

export interface CouponQuoteRequest {
  code: string
  order_items: OrderItemInput[]
  shipping_charge?: number
  // Only matters for a coupon with a per-customer limit.
  customer_phone?: string
}

// A refusal is a 200 with `valid: false`, not an error — only a transport or server failure
// throws, and that means the code could not be checked, never that it was rejected.
export type CouponQuote =
  | { valid: true; code: string; discount_amount: number; shipping_discount_amount: number }
  | { valid: false; reason: string }

export async function validateCoupon(data: CouponQuoteRequest): Promise<CouponQuote> {
  const res = await apiClient.post<SingleResponse<CouponQuote>>('/api/v1/coupons/validate', data)
  return res.data.data
}
