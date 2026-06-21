import type { Order } from '@/api/types'

const statusConfig: Record<Order['status'], { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'schedule' },
  preorder: { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'inventory_2' },
  locked: { bg: 'bg-surface-container', text: 'text-on-surface-variant', icon: 'lock' },
  approved: { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'thumb_up' },
  shipped: { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'local_shipping' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: 'check_circle' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: 'error' },
  returned: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'undo' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: 'cancel' },
}

export default function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-label-sm uppercase tracking-wider ${config.bg} ${config.text}`}>
      <span className="material-symbols-outlined text-sm">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
