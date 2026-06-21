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
  useTitle('My Orders - Baby Gallery')

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
      const matchesId = `#bg-${order.id}`.includes(searchLower) || order.id.toString().includes(searchLower)
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
          <button className="text-xs text-primary font-medium hover:underline">
            Buy Again
          </button>
        )
      case 'pending':
        return (
          <button className="text-xs text-red-500 font-medium hover:underline">
            Cancel
          </button>
        )
      case 'shipped':
        return (
          <button className="text-xs text-blue-500 font-medium hover:underline">
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
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">My Orders</h1>
          {pagination && (
            <p className="text-sm text-slate-500 mt-1">
              {pagination.total_count} total orders
            </p>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons-outlined text-slate-400 text-xl">search</span>
            </span>
            <input
              type="text"
              placeholder="Search order ID or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pl-10"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <span className="material-icons-outlined text-6xl text-slate-200 mb-4">
              receipt_long
            </span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Orders Found</h3>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              {search || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to find what you are looking for.'
                : 'You have not placed any orders yet. Start shopping to see your orders here.'}
            </p>
            <Link
              href="/shop"
              className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-4 px-6 text-slate-500 font-medium">Order ID</th>
                  <th className="text-left py-4 px-6 text-slate-500 font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-slate-500 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-slate-500 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">#BG-{order.id}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {formatCurrency(order.grand_total)}
                    </td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-xs text-primary font-medium hover:underline"
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
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <span className="material-icons-outlined text-4xl text-primary mb-3 block">
          support_agent
        </span>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Need Help with an Order?</h3>
        <p className="text-sm text-slate-500 mb-6">
          Our support team is here to assist you with any order-related queries.
        </p>
        <div className="flex items-center justify-center flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
            <span className="material-icons-outlined text-lg">chat</span>
            Live Chat
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
            <span className="material-icons-outlined text-lg">call</span>
            Call
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
            <span className="material-icons-outlined text-lg">help_outline</span>
            FAQs
          </button>
        </div>
      </div>
    </div>
  )
}
