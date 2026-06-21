'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useTitle } from '@/hooks/useTitle'
import { listOrders } from '@/api/orders'
import type { Order, Pagination as PaginationType } from '@/api/types'
import OrderStatusBadge from '@/components/common/OrderStatusBadge'
import Pagination from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/formatCurrency'
import Spinner from '@/components/ui/Spinner'

export default function OrderHistoryPage() {
  useTitle('My Orders - Tech Gallery')

  const searchParams = useSearchParams()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const currentPage = parseInt(searchParams?.get('page') || '1', 10)

  useEffect(() => {
    setLoading(true)
    listOrders({ page: currentPage, per_page: 10 })
      .then((res) => {
        setOrders(res.data)
        setPagination(res.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentPage])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

  // Client-side filtering
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesId = `#tg-${order.id}`.includes(searchLower) || order.id.toString().includes(searchLower)
      if (!matchesId) return false
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false

    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      const monthsAgo = new Date(now.getFullYear(), now.getMonth() - parseInt(dateFilter), now.getDate())
      if (orderDate < monthsAgo) return false
    }

    return true
  })

  const getContextualAction = (order: Order) => {
    switch (order.status) {
      case 'delivered':
        return (
          <button className="text-label-sm uppercase tracking-wider text-secondary hover:underline">
            Buy Again
          </button>
        )
      case 'pending':
        return (
          <button className="text-label-sm uppercase tracking-wider text-red-600 hover:underline">
            Cancel
          </button>
        )
      case 'shipped':
        return (
          <button className="text-label-sm uppercase tracking-wider text-secondary hover:underline">
            Track
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-display text-on-surface">My Orders</h1>
          {pagination && (
            <p className="text-body-sm text-on-surface-variant mt-1">
              {pagination.total_count} total orders
            </p>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-xl">search</span>
            </span>
            <input
              type="text"
              placeholder="Search order ID or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-outline-variant bg-white px-4 py-2.5 text-body-sm transition-all focus:outline-none focus:ring-1 focus:ring-secondary pl-10"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-outline-variant bg-white px-4 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            <option value="all">All Time</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-outline-variant bg-white px-4 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
              receipt_long
            </span>
            <h3 className="text-headline-lg-mobile font-display text-on-surface mb-2">No Orders Found</h3>
            <p className="text-on-surface-variant text-body-sm max-w-md mb-6">
              {search || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to find what you are looking for.'
                : 'You have not placed any orders yet. Start shopping to see your orders here.'}
            </p>
            <Link
              href="/shop"
              className="bg-primary text-white px-6 py-3 text-label-md uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left py-4 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Order ID</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                  >
                    <td className="py-4 px-6 font-label-md text-on-surface">#TG-{order.id}</td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-on-surface">
                      {formatCurrency(order.grand_total)}
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-label-sm uppercase tracking-wider text-secondary hover:underline"
                        >
                          View Details
                        </Link>
                        {getContextualAction(order)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Help CTA */}
      <div className="bg-primary-container p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary mb-3 block">
          support_agent
        </span>
        <h3 className="text-headline-lg-mobile font-display text-white mb-2">Need Help with an Order?</h3>
        <p className="text-body-sm text-white/70 mb-6">
          Our support team is here to assist you with any order-related queries.
        </p>
        <div className="flex items-center justify-center flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white text-label-md uppercase tracking-widest hover:bg-white hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">chat</span>
            Live Chat
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white text-label-md uppercase tracking-widest hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-lg">call</span>
            Call
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white text-label-md uppercase tracking-widest hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-lg">help_outline</span>
            FAQs
          </button>
        </div>
      </div>
    </div>
  )
}
