'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { Bundle, BundleCombo } from '@/api/types'
import { useCartStore } from '@/stores/cartStore'
import { useCartUIStore } from '@/stores/cartUIStore'
import { formatCurrency } from '@/lib/formatCurrency'
import QuantitySelector from '@/components/product/QuantitySelector'
import Breadcrumb from '@/components/common/Breadcrumb'

interface BundleDetailContentProps {
  bundle: Bundle
}

export default function BundleDetailContent({ bundle }: BundleDetailContentProps) {
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState<string | null>(bundle.image_url || null)
  const [quantity, setQuantity] = useState(1)

  const addItem = useCartStore((s) => s.addItem)
  const openCartAdded = useCartUIStore((s) => s.openCartAdded)

  // Default to the first orderable combo, else the first combo.
  useEffect(() => {
    const fallback = bundle.variants.find((c) => c.orderable) || bundle.variants[0] || null
    if (fallback) {
      setSelectedComboId(fallback.id)
      setMainImage(fallback.image_url || bundle.image_url || null)
    }
  }, [bundle])

  const selectedCombo: BundleCombo | null =
    bundle.variants.find((c) => c.id === selectedComboId) || null

  const thumbnails = useMemo(() => {
    const urls: string[] = []
    bundle.variants.forEach((c) => {
      if (c.image_url && !urls.includes(c.image_url)) urls.push(c.image_url)
    })
    if (urls.length === 0 && bundle.image_url) urls.push(bundle.image_url)
    return urls
  }, [bundle])

  const inStock = (selectedCombo?.available_stock ?? 0) > 0
  const orderable = selectedCombo?.orderable ?? false
  const onSale =
    selectedCombo?.original_price != null && selectedCombo.original_price > selectedCombo.price

  const handleAddToCart = () => {
    if (!selectedCombo) return
    if (!selectedCombo.orderable) {
      toast.error('This loadout is currently out of stock')
      return
    }
    const cartItem = {
      productId: `bundle-${bundle.id}`,
      variantId: `bundle-${selectedCombo.id}`,
      bundleVariantId: selectedCombo.id,
      name: bundle.name,
      variantName: selectedCombo.name || `Kit · ${selectedCombo.items.length} items`,
      price: Number(selectedCombo.price),
      quantity,
      imageUrl: selectedCombo.image_url || bundle.image_url || null,
    }
    addItem(cartItem)
    toast.success(`${bundle.name} added to loadout`)
    openCartAdded(cartItem, [])
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-6">
      <div className="mb-6">
        <Breadcrumb />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {thumbnails.length > 0 && (
              <div className="flex md:flex-col gap-3">
                {thumbnails.slice(0, 4).map((url) => (
                  <button
                    key={url}
                    onClick={() => setMainImage(url)}
                    className={`w-20 h-24 overflow-hidden flex-shrink-0 border ${
                      mainImage === url ? 'border-2 border-secondary' : 'border-outline-variant'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 relative">
              <div className="aspect-[4/5] bg-surface-container industrial-grid overflow-hidden border border-outline-variant relative">
                <div className="absolute -top-px -left-px w-10 h-10 border-t-2 border-l-2 border-secondary z-10" />
                <div className="absolute -bottom-px -right-px w-10 h-10 border-b-2 border-r-2 border-secondary z-10" />
                <span className="absolute top-3 left-3 bg-primary text-white font-label-sm uppercase tracking-widest px-2 py-1 border border-outline-variant z-20">
                  COMBAT KIT
                </span>
                <img
                  src={mainImage || '/assets/logo-vertical-blue.png'}
                  alt={bundle.name}
                  className="w-full h-full object-contain p-6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="mb-3">
            {inStock ? (
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-secondary/10 text-secondary">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> In Stock ·{' '}
                {selectedCombo?.available_stock} kits
              </span>
            ) : (
              <span className="inline-flex items-center font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-red-100 text-red-700">
                Out of Stock
              </span>
            )}
          </div>

          <h1 className="font-headline-lg text-headline-lg font-black text-on-surface leading-tight mb-3 uppercase">
            {bundle.name}
          </h1>

          <div className="bg-primary-container p-5 border-l-4 border-secondary mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display-lg text-3xl font-extrabold text-white">
                {formatCurrency(selectedCombo?.price ?? 0)}
              </span>
              {onSale && selectedCombo?.original_price != null && (
                <>
                  <span className="text-outline line-through text-sm">
                    {formatCurrency(selectedCombo.original_price)}
                  </span>
                  <span className="bg-secondary text-white text-label-sm font-bold px-2 py-0.5">
                    -
                    {Math.round(
                      ((selectedCombo.original_price - selectedCombo.price) /
                        selectedCombo.original_price) *
                        100
                    )}
                    %
                  </span>
                </>
              )}
            </div>
            <p className="font-label-sm text-label-sm text-on-primary-container mt-1 uppercase tracking-widest">
              VAT included
            </p>
          </div>

          {/* Combo selector (only when there is a real choice) */}
          {bundle.variants.length > 1 && (
            <div className="mb-6">
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Configuration
              </h3>
              <div className="flex flex-col gap-2">
                {bundle.variants.map((combo) => {
                  const active = selectedComboId === combo.id
                  return (
                    <button
                      key={combo.id}
                      onClick={() => {
                        setSelectedComboId(combo.id)
                        setMainImage(combo.image_url || bundle.image_url || null)
                      }}
                      disabled={!combo.orderable}
                      className={`flex items-center justify-between px-4 py-3 border text-left transition-colors disabled:opacity-50 ${
                        active
                          ? 'border-2 border-secondary bg-secondary/10'
                          : 'border-outline-variant hover:border-secondary'
                      }`}
                    >
                      <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                        {combo.name}
                      </span>
                      <span className="font-bold text-on-surface">{formatCurrency(combo.price)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* What's inside */}
          {selectedCombo && selectedCombo.items.length > 0 && (
            <div className="mb-6 border border-outline-variant">
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant px-4 py-2 border-b border-outline-variant bg-surface-container-low">
                What&apos;s Inside
              </h3>
              <ul className="divide-y divide-outline-variant">
                {selectedCombo.items.map((item, i) => (
                  <li
                    key={`${item.variant_id}-${i}`}
                    className="flex items-center justify-between px-4 py-2.5 font-body-sm text-body-sm text-on-surface"
                  >
                    <span>{item.variant_name}</span>
                    <span className="font-mono text-on-surface-variant">×{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Quantity
            </h3>
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(selectedCombo?.available_stock ?? 1, 1)}
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!orderable}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-label-md text-label-md uppercase tracking-widest py-4 hover:bg-secondary active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            Add To Loadout
          </button>
        </div>
      </div>
    </div>
  )
}
