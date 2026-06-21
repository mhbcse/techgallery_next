import type { Order } from '@/api/types'

const statusConfig: Record<Order['status'], { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'schedule' },
  preorder: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'inventory_2' },
  locked: { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'lock' },
  approved: { bg: 'bg-pink-50', text: 'text-pink-500', icon: 'thumb_up' },
  shipped: { bg: 'bg-pink-100', text: 'text-pink-600', icon: 'local_shipping' },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'check_circle' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: 'error' },
  returned: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'undo' },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', icon: 'cancel' },
}

export default function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className="material-icons-outlined text-sm">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
