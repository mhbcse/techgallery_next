'use client'

import { useEffect } from 'react'
import { captureCouponFromUrl } from '@/lib/appliedCoupon'

// Holds a `?coupon=CODE` from the landing URL so it is still there when the shopper reaches
// checkout, however long they browse first. Mounted once in the public layout.
export default function CouponCapture() {
  useEffect(() => {
    captureCouponFromUrl()
  }, [])

  return null
}
