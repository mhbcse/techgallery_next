import type { CartItem } from '@/stores/cartStore'
import type { OrderItemInput } from '@/api/orders'

// Maps cart lines to the order payload, by specificity (mirrors the server
// precedence): quantity-offer lines order by quantity_tier_id, bundle combo lines
// by bundle_variant_id, everything else by variant_id. Exactly one id per line.
export function toOrderItems(items: CartItem[]): OrderItemInput[] {
  return items.map((item) => {
    if (item.quantityTierId)
      return { quantity_tier_id: Number(item.quantityTierId), quantity: item.quantity }
    if (item.bundleVariantId)
      return { bundle_variant_id: Number(item.bundleVariantId), quantity: item.quantity }
    return { variant_id: Number(item.variantId), quantity: item.quantity }
  })
}
