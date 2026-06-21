'use client'

import toast from 'react-hot-toast'
import type { Bundle } from '@/api/types'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/formatCurrency'

interface BundleCardProps {
  bundle: Bundle
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  // Add the bundle as a single line at its discounted bundle price. Checkout
  // places it with bundle_id, and Rails expands components + applies the
  // bundle price server-side.
  const handleAddBundle = () => {
    if (!bundle.orderable) {
      toast.error('This loadout is currently out of stock')
      return
    }
    addItem({
      productId: `bundle-${bundle.id}`,
      variantId: `bundle-${bundle.id}`,
      bundleId: bundle.id,
      name: bundle.name,
      variantName: `Kit · ${bundle.items.length} items`,
      price: bundle.price,
      quantity: 1,
      imageUrl: bundle.image_url,
    })
    toast.success(`${bundle.name} added to cart`)
  }

  const onSale = bundle.original_price != null && bundle.original_price > bundle.price

  return (
    <div className="group block bg-surface-container-lowest border border-outline-variant overflow-hidden hover:border-secondary transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={bundle.image_url || '/assets/logo-vertical-blue.png'}
          alt={bundle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-primary text-white font-label-sm uppercase tracking-widest px-2 py-1 border border-outline-variant">
          COMBAT KIT
        </span>
        {!bundle.orderable && (
          <span className="absolute top-3 right-3 bg-primary-container text-white font-label-sm uppercase tracking-widest px-2 py-1">
            OUT OF STOCK
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-headline-lg text-on-surface mb-1 truncate">{bundle.name}</h3>
        <p className="font-label-sm uppercase tracking-wider text-on-surface-variant mb-3">{bundle.items.length} items included</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-on-surface">{formatCurrency(bundle.price)}</span>
            {onSale && (
              <span className="text-sm text-on-surface-variant line-through">
                {formatCurrency(bundle.original_price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddBundle}
            disabled={!bundle.orderable}
            className="bg-primary hover:bg-secondary disabled:bg-outline-variant text-white p-2 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}
