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
      toast.error('This bundle is currently out of stock')
      return
    }
    addItem({
      productId: `bundle-${bundle.id}`,
      variantId: `bundle-${bundle.id}`,
      bundleId: bundle.id,
      name: bundle.name,
      variantName: `Bundle · ${bundle.items.length} items`,
      price: bundle.price,
      quantity: 1,
      imageUrl: bundle.image_url,
    })
    toast.success(`${bundle.name} added to bag`)
  }

  const onSale = bundle.original_price != null && bundle.original_price > bundle.price

  return (
    <div className="group block bg-white border border-pink-50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={bundle.image_url || '/assets/carton-girl.webp'}
          alt={bundle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm border border-purple-200">
          BUNDLE
        </span>
        {!bundle.orderable && (
          <span className="absolute top-3 right-3 bg-slate-800/80 text-white text-[11px] font-bold px-2 py-0.5 rounded">
            OUT OF STOCK
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-800 mb-1 truncate">{bundle.name}</h3>
        <p className="text-xs text-slate-400 mb-3">{bundle.items.length} items included</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatCurrency(bundle.price)}</span>
            {onSale && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(bundle.original_price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddBundle}
            disabled={!bundle.orderable}
            className="bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <span className="material-icons-outlined text-sm">shopping_bag</span>
          </button>
        </div>
      </div>
    </div>
  )
}
