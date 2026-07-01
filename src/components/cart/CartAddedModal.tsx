'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCartUIStore } from '@/stores/cartUIStore'
import { useCartStore } from '@/stores/cartStore'
import { getProduct } from '@/api/products'
import type { Product } from '@/api/types'
import { formatCurrency } from '@/lib/formatCurrency'
import { trackAddToCart } from '@/lib/pixel'

export default function CartAddedModal() {
  const router = useRouter()
  const { open, addedItem, related, close } = useCartUIStore()
  const addItem = useCartStore((s) => s.addItem)
  const totalItems = useCartStore((s) => s.totalItems())
  const [addingId, setAddingId] = useState<string | null>(null)

  if (!open || !addedItem) return null

  // Quick-add: fetch the product's default variant and drop it straight into the cart.
  const quickAdd = async (product: Product) => {
    if (!product.slug) {
      toast.error('This unit is unavailable')
      return
    }
    setAddingId(product.id)
    try {
      const detail = await getProduct(product.slug)
      const variant = detail.variants.find((v) => v.is_default) || detail.variants[0]
      if (!variant) {
        toast.error('This unit is unavailable')
        return
      }
      addItem({
        productId: product.id,
        variantId: variant.id,
        contentId: variant.content_id,
        name: product.name,
        variantName: variant.name || product.name,
        price: Number(variant.price),
        quantity: 1,
        imageUrl: variant.image_url || product.thumbnail_url || product.photo_url,
      })
      trackAddToCart({ contentId: variant.content_id, value: Number(variant.price), quantity: 1 })
      toast.success('Added to loadout')
    } catch {
      toast.error('Could not add this unit')
    } finally {
      setAddingId(null)
    }
  }

  const goCheckout = () => {
    close()
    router.push('/cart')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-surface border border-outline-variant w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-primary text-white px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
            <span className="font-label-md text-label-md uppercase tracking-[0.2em]">Added To Loadout</span>
          </div>
          <button onClick={close} className="hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Added item */}
          <div className="flex items-center gap-4 border border-outline-variant bg-white p-4">
            <div className="w-16 h-16 bg-surface-container flex-shrink-0 overflow-hidden">
              <img
                src={addedItem.imageUrl || '/assets/logo-vertical-blue.png'}
                alt={addedItem.name}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-label-md text-label-md font-bold uppercase truncate">{addedItem.name}</h3>
              {addedItem.variantName && (
                <p className="font-label-sm text-label-sm text-outline">{addedItem.variantName}</p>
              )}
            </div>
            <span className="font-bold text-secondary">{formatCurrency(addedItem.price)}</span>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div>
              <h4 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-3 border-l-2 border-secondary pl-2">
                Complete Your Setup
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.slice(0, 3).map((p) => (
                  <div key={p.id} className="border border-outline-variant bg-white p-3 flex flex-col">
                    <div className="aspect-square mb-2 overflow-hidden">
                      <img
                        src={p.thumbnail_url || p.photo_url || '/assets/logo-vertical-blue.png'}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-label-sm text-label-sm font-bold uppercase line-clamp-2 mb-1">{p.name}</p>
                    <p className="font-label-sm text-label-sm text-secondary font-bold mb-2">
                      {formatCurrency(p.price_min)}
                    </p>
                    <button
                      onClick={() => quickAdd(p)}
                      disabled={addingId === p.id}
                      className="mt-auto w-full py-2 border border-primary font-label-sm text-label-sm uppercase tracking-wider hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      {addingId === p.id ? 'Adding…' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={close}
              className="flex-1 py-4 border border-outline-variant font-label-md text-label-md uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all"
            >
              Continue Shopping
            </button>
            <button
              onClick={goCheckout}
              className="flex-1 py-4 bg-secondary text-white font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Checkout ({totalItems})
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
