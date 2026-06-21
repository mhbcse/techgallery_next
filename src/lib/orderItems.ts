import type { CartItem } from '@/stores/cartStore'
import type { OrderItemInput } from '@/api/orders'

// Maps cart lines to the order payload: bundle lines order by bundle_id;
// everything else by variant_id. Exactly one id per line.
export function toOrderItems(items: CartItem[]): OrderItemInput[] {
  return items.map((item) =>
    item.bundleId
      ? { bundle_id: Number(item.bundleId), quantity: item.quantity }
      : { variant_id: Number(item.variantId), quantity: item.quantity }
  )
}
