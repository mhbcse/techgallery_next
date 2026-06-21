'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTitle } from '@/hooks/useTitle'
import { getOrder } from '@/api/orders'
import type { Order } from '@/api/types'
import OrderStatusBadge from '@/components/common/OrderStatusBadge'
import { formatCurrency } from '@/lib/formatCurrency'
import Spinner from '@/components/ui/Spinner'

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>() ?? {}
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useTitle(order ? `Order #TG-${order.id} - Tech Gallery` : 'Order Details - Tech Gallery')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getOrder(id)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">error_outline</span>
        <h2 className="text-headline-lg-mobile font-display text-on-surface mb-2">Order Not Found</h2>
        <p className="text-on-surface-variant text-body-sm mb-6">
          The order you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/account/orders"
          className="bg-primary text-white px-6 py-3 text-label-md uppercase tracking-widest hover:bg-secondary transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  const currentStep = getTrackingStep(order.status)
  const subtotal = order.total_amount

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg font-display text-on-surface flex items-center gap-3">
            Order #TG-{order.id}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Order Tracking Timeline */}
      {currentStep >= 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant p-6">
          <h2 className="text-label-md uppercase tracking-wider text-on-surface mb-6">Order Progress</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-outline-variant">
              <div
                className="h-full bg-secondary transition-all duration-500"
                style={{
                  width: `${(currentStep / (trackingSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {trackingSteps.map((step, index) => {
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
                            : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{step.icon}</span>
                    </div>
                    <span
                      className={`text-label-sm uppercase tracking-wider mt-2 text-center ${
                        isCompleted ? 'text-secondary' : 'text-outline'
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant overflow-hidden">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-label-md uppercase tracking-wider text-on-surface">Order Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-surface-container">
                  <th className="text-left py-3 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Product</th>
                  <th className="text-center py-3 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Qty</th>
                  <th className="text-right py-3 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Unit Price</th>
                  <th className="text-right py-3 px-6 text-on-surface-variant text-label-sm uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item) => (
                  <tr key={item.id} className="border-b border-outline-variant">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-surface-container border border-outline-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline">
                            inventory_2
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">Product #{item.product_id}</p>
                          <p className="text-body-sm text-on-surface-variant">
                            Variant #{item.variant_id}
                            {item.preorder && (
                              <span className="ml-2 text-secondary font-medium">Pre-order</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-on-surface-variant">{item.quantity}</td>
                    <td className="py-4 px-6 text-right text-on-surface-variant">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-on-surface">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6">
            <h2 className="text-label-md uppercase tracking-wider text-on-surface mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-on-surface font-medium">
                  {formatCurrency(order.shipping_charge)}
                </span>
              </div>
              <div className="border-t border-outline-variant pt-3 flex items-center justify-between">
                <span className="text-label-md uppercase tracking-wider text-on-surface">Grand Total</span>
                <span className="text-headline-lg-mobile font-display text-secondary">
                  {formatCurrency(order.grand_total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6">
            <h2 className="text-label-md uppercase tracking-wider text-on-surface mb-4">Shipping Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline text-xl">person</span>
                <span className="text-body-sm text-on-surface">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline text-xl">phone</span>
                <span className="text-body-sm text-on-surface">{order.customer_phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-xl mt-0.5">
                  location_on
                </span>
                <span className="text-body-sm text-on-surface">{order.customer_address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
