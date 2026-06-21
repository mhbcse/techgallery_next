'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTitle } from '@/hooks/useTitle'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { listOrders } from '@/api/orders'
import type { Order } from '@/api/types'
import OrderStatusBadge from '@/components/common/OrderStatusBadge'
import { formatCurrency } from '@/lib/formatCurrency'

const trackingSteps = [
  { label: 'Order Placed', icon: 'receipt_long' },
  { label: 'Processing', icon: 'inventory_2' },
  { label: 'Shipped', icon: 'local_shipping' },
  { label: 'Delivered', icon: 'check_circle' },
]

function getTrackingStep(status: Order['status']): number {
  switch (status) {
    case 'pending':
    case 'preorder':
      return 0
    case 'locked':
    case 'approved':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    default:
      return -1
  }
}

export default function DashboardPage() {
  useTitle('Dashboard - Tech Gallery')

  const { user } = useAuthStore()
  const wishlistItems = useWishlistStore((s) => s.items)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listOrders({ per_page: 5 })
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeOrder = orders.find(
    (o) => o.status === 'shipped' || o.status === 'approved'
  )

  const stats = [
    {
      icon: 'shopping_bag',
      label: 'Total Orders',
      value: user?.orders_count ?? orders.length,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      icon: 'stars',
      label: 'Tech Points',
      value: '0',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      icon: 'favorite',
      label: 'Wishlist',
      value: wishlistItems.length,
      color: 'bg-surface-container text-on-surface',
    },
    {
      icon: 'local_shipping',
      label: 'Active Shipments',
      value: '0',
      color: 'bg-secondary/10 text-secondary',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-primary-container p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-headline-lg font-extrabold font-display mb-2">
            Hello, {user?.name || 'there'}!
          </h1>
          <p className="text-white/80 text-body-sm mb-6">
            Welcome back to your Tech Gallery dashboard
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop?tag=new-arrivals"
              className="bg-secondary text-white px-6 py-2.5 text-label-md uppercase tracking-widest hover:bg-secondary/90 transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/account/orders"
              className="bg-white/10 text-white px-6 py-2.5 text-label-md uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant p-6">
            <div className={`w-12 h-12 ${stat.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-display font-extrabold text-on-surface">{stat.value}</p>
            <p className="text-label-sm uppercase tracking-wider text-on-surface-variant mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-label-md uppercase tracking-wider font-bold text-on-surface">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-body-sm text-secondary font-semibold hover:underline"
            >
              View All Orders
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-outline-variant border-t-secondary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">
                shopping_bag
              </span>
              <p className="text-on-surface-variant text-body-sm">No orders yet</p>
              <Link
                href="/shop"
                className="text-secondary text-body-sm font-semibold hover:underline mt-2 inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left py-3 px-2 text-on-surface-variant text-label-sm uppercase tracking-wider font-medium">Order ID</th>
                    <th className="text-left py-3 px-2 text-on-surface-variant text-label-sm uppercase tracking-wider font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-on-surface-variant text-label-sm uppercase tracking-wider font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-on-surface-variant text-label-sm uppercase tracking-wider font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-on-surface-variant text-label-sm uppercase tracking-wider font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-2 font-medium text-on-surface">
                        #TG-{order.id}
                      </td>
                      <td className="py-3 px-2 text-on-surface-variant">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-2 font-semibold text-on-surface">
                        {formatCurrency(order.grand_total)}
                      </td>
                      <td className="py-3 px-2">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-secondary font-medium hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Overview */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6">
            <h2 className="text-label-md uppercase tracking-wider font-bold text-on-surface mb-4">Account Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                <span className="text-body-sm text-on-surface">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">email</span>
                <span className="text-body-sm text-on-surface">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">phone</span>
                <span className="text-body-sm text-on-surface">{user?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  location_on
                </span>
                <span className="text-body-sm text-on-surface">{user?.address || 'Not set'}</span>
              </div>
            </div>
            <Link
              href="/account/profile"
              className="mt-4 inline-flex items-center gap-1 text-body-sm text-secondary font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </Link>
          </div>

          {/* Member Exclusive Promo */}
          <div className="bg-tertiary-container p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <span className="text-label-sm uppercase tracking-wider font-bold bg-secondary text-white px-3 py-1">
                Member Exclusive
              </span>
              <p className="text-3xl font-extrabold mt-3 mb-1 font-display">15% OFF</p>
              <p className="text-body-sm text-white/80 mb-4">On your next order</p>
              <Link
                href="/shop"
                className="bg-secondary text-white px-5 py-2 text-label-md uppercase tracking-widest hover:bg-secondary/90 transition-colors inline-block"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking */}
      {activeOrder && (
        <div className="bg-surface-container-lowest border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-label-md uppercase tracking-wider font-bold text-on-surface">Order Tracking</h2>
            <span className="text-body-sm text-on-surface-variant">Order #TG-{activeOrder.id}</span>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-outline-variant">
              <div
                className="h-full bg-secondary transition-all duration-500"
                style={{
                  width: `${(getTrackingStep(activeOrder.status) / (trackingSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {trackingSteps.map((step, index) => {
                const currentStep = getTrackingStep(activeOrder.status)
                const isCompleted = index <= currentStep
                const isActive = index === currentStep

                return (
                  <div key={step.label} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center z-10 transition-all ${
                        isActive
                          ? 'bg-secondary text-white ring-4 ring-secondary/20'
                          : isCompleted
                            ? 'bg-secondary text-white'
                            : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{step.icon}</span>
                    </div>
                    <span
                      className={`text-label-sm uppercase tracking-wider font-medium mt-2 ${
                        isCompleted ? 'text-secondary' : 'text-on-surface-variant'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
