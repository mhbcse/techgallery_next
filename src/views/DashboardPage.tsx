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
  useTitle('Dashboard - Baby Gallery')

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
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: 'stars',
      label: 'Baby Points',
      value: '0',
      color: 'bg-amber-50 text-amber-500',
    },
    {
      icon: 'favorite',
      label: 'Wishlist',
      value: wishlistItems.length,
      color: 'bg-rose-50 text-rose-500',
    },
    {
      icon: 'local_shipping',
      label: 'Active Shipments',
      value: '0',
      color: 'bg-blue-50 text-blue-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold font-display mb-2">
            Hello, {user?.name || 'there'}!
          </h1>
          <p className="text-white/80 text-sm mb-6">
            Welcome back to your Baby Gallery dashboard
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop?tag=new-arrivals"
              className="bg-white text-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/account/orders"
              className="bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors border border-white/20"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-3`}>
              <span className="material-icons-outlined text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-sm text-primary font-semibold hover:underline"
            >
              View All Orders
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-light border-t-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-outlined text-4xl text-slate-200 mb-3 block">
                shopping_bag
              </span>
              <p className="text-slate-500 text-sm">No orders yet</p>
              <Link
                href="/shop"
                className="text-primary text-sm font-semibold hover:underline mt-2 inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Order ID</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-medium text-slate-900">
                        #BG-{order.id}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-900">
                        {formatCurrency(order.grand_total)}
                      </td>
                      <td className="py-3 px-2">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-primary font-medium hover:underline"
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
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Account Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-slate-400 text-xl">person</span>
                <span className="text-sm text-slate-700">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-slate-400 text-xl">email</span>
                <span className="text-sm text-slate-700">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-slate-400 text-xl">phone</span>
                <span className="text-sm text-slate-700">{user?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-slate-400 text-xl">
                  location_on
                </span>
                <span className="text-sm text-slate-700">{user?.address || 'Not set'}</span>
              </div>
            </div>
            <Link
              href="/account/profile"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              <span className="material-icons-outlined text-lg">edit</span>
              Edit Profile
            </Link>
          </div>

          {/* Member Exclusive Promo */}
          <div className="bg-gradient-to-br from-primary via-rose-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                Member Exclusive
              </span>
              <p className="text-3xl font-extrabold mt-3 mb-1 font-display">15% OFF</p>
              <p className="text-sm text-white/80 mb-4">On your next order</p>
              <Link
                href="/shop"
                className="bg-white text-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors inline-block"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking */}
      {activeOrder && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Order Tracking</h2>
            <span className="text-sm text-slate-500">Order #BG-{activeOrder.id}</span>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200">
              <div
                className="h-full bg-primary transition-all duration-500"
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                        isActive
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : isCompleted
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="material-icons-outlined text-xl">{step.icon}</span>
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        isCompleted ? 'text-primary' : 'text-slate-400'
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
