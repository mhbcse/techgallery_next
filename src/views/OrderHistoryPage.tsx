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
import ProtectedLink from '@/components/common/ProtectedLink'

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
          <ProtectedLink
            encodedHref="dGVsOis4ODAxMzEzNjY1NTIy"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white text-label-md uppercase tracking-widest hover:bg-white hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Call Now
          </ProtectedLink>
          <ProtectedLink
            encodedHref="aHR0cHM6Ly93YS5tZS84ODAxMzEzODUzNTM1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white text-label-md uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            WhatsApp
          </ProtectedLink>
          <a
            href="https://www.facebook.com/techgallery.store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white text-label-md uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07z" />
            </svg>
            Facebook
          </a>
        </div>
      </div>
    </div>
  )
}
