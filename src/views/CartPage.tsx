'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/formatCurrency'
import EmptyState from '@/components/common/EmptyState'
import { useTitle } from '@/hooks/useTitle'

export default function CartPage() {
  useTitle('My Cart - Tech Gallery')
  const { items, removeItem, updateQuantity, clearCart, totalItems, subtotal } = useCartStore()

  const cartSubtotal = subtotal()
  const itemCount = totalItems()

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-lg py-20">
        <EmptyState
          icon="shopping_cart"
          title="Your loadout is empty"
          description="No hardware queued for deployment yet. Browse the armory and equip your setup."
          action={
            <Link
              href="/shop"
              className="bg-primary text-white px-8 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              Enter The Armory
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <h1 className="font-headline-lg text-headline-lg font-black uppercase">
              Your Cart{' '}
              <span className="text-outline font-normal text-headline-lg-mobile">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </h1>
            <button
              onClick={clearCart}
              className="font-label-md text-label-md uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Clear
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white p-4 border border-outline-variant flex flex-col sm:flex-row gap-4"
              >
                <div className="w-24 h-24 bg-surface-container overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl || '/assets/logo-vertical-blue.png'}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface">{item.name}</h3>
                      {item.variantName && <p className="font-label-sm text-label-sm text-outline mt-1">{item.variantName}</p>}
                    </div>
                    <p className="font-bold text-lg text-secondary">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-outline-variant overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 hover:bg-surface-container-low text-on-surface"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-label-md text-label-md font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-surface-container-low text-on-surface"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-outline hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border border-outline-variant px-5 py-3 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Continue Shopping
          </Link>
        </div>

        <div className="lg:w-[420px]">
          <div className="bg-white border border-outline-variant p-6 space-y-6 sticky top-24">
            <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              Order Summary
            </h2>

            <div className="space-y-3 font-body-sm text-body-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              {/* Delivery resolves from district + area at checkout; guessing here would misprice the order. */}
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping Fee</span>
                <span className="text-outline">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-outline-variant">
                <span>Subtotal</span>
                <span className="text-secondary">{formatCurrency(cartSubtotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-primary text-white py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-2"
            >
              Proceed To Checkout
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>

            <p className="font-label-sm text-label-sm text-on-surface-variant text-center uppercase tracking-wider">
              Cash on delivery available
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant py-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: 'bolt', title: '24H Dispatch', body: 'Prioritized nationwide deployment.' },
            { icon: 'lock', title: 'Secure Checkout', body: '256-bit encrypted transactions.' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-4">
              <div className="bg-secondary/10 p-3 text-secondary">
                <span className="material-symbols-outlined">{b.icon}</span>
              </div>
              <div>
                <h5 className="font-label-md text-label-md font-bold uppercase">{b.title}</h5>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
