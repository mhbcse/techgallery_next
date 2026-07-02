import type { Order } from '@/api/types'

// The customer-facing tracking timeline. Shared by the dashboard's active-order
// progress bar and the order detail page so the two can never disagree.
export const trackingSteps = [
  { label: 'Order Placed', icon: 'receipt_long' },
  { label: 'Processing', icon: 'inventory_2' },
  { label: 'Shipped', icon: 'local_shipping' },
  { label: 'Delivered', icon: 'check_circle' },
]

// Maps an order status to its timeline step; -1 for statuses outside the happy path
// (cancelled, failed, returned, lost), which render no progress.
export function getTrackingStep(status: Order['status']): number {
  switch (status) {
    case 'pending':
    case 'calling':
      return 0
    case 'confirmed':
    case 'hold':
    case 'processing':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    default:
      return -1
  }
}
