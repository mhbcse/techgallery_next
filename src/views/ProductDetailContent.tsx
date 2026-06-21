'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { ProductDetail, Variant, Product } from '@/api/types'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatCurrency } from '@/lib/formatCurrency'
import QuantitySelector from '@/components/product/QuantitySelector'
import StarRating from '@/components/ui/StarRating'
import ProductCard from '@/components/product/ProductCard'
import Breadcrumb from '@/components/common/Breadcrumb'

type Tab = 'description' | 'specs' | 'reviews'

const sampleReviews = [
  {
    id: 1,
    name: 'Arif H.',
    date: 'January 15, 2025',
    rating: 5,
    comment: 'Insane polling rate and zero perceptible latency. Build quality is monolithic — feels engineered, not assembled.',
  },
  {
    id: 2,
    name: 'Tanvir R.',
    date: 'December 28, 2024',
    rating: 4,
    comment: 'Great hardware, fast dispatch. Software could use more profiles, but the raw performance is elite.',
  },
  {
    id: 3,
    name: 'Sadia K.',
    date: 'December 10, 2024',
    rating: 5,
    comment: 'Survived a full season of competitive play. Stress-tested and validated — exactly as advertised.',
  },
]

const ratingBreakdown = [
  { stars: 5, percentage: 72 },
  { stars: 4, percentage: 18 },
  { stars: 3, percentage: 6 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 1 },
]

interface ProductDetailContentProps {
  product: ProductDetail
  relatedProducts: Product[]
}

export default function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const [mainImage, setMainImage] = useState<string | null>(product.photo_url)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<Tab>('description')

  const addItem = useCartStore((s) => s.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  useEffect(() => {
    const defaultVariant = product.variants.find((v) => v.is_default) || product.variants[0] || null
    setSelectedVariant(defaultVariant)
    if (defaultVariant) {
      setSelectedPropertyId(defaultVariant.property_id)
      setSelectedColorId(defaultVariant.color_id)
      if (defaultVariant.image_url) setMainImage(defaultVariant.image_url)
    }
  }, [product])

  useEffect(() => {
    const match = product.variants.find((v) => {
      const propertyMatch = selectedPropertyId ? v.property_id === selectedPropertyId : !v.property_id
      const colorMatch = selectedColorId ? v.color_id === selectedColorId : !v.color_id
      return propertyMatch && colorMatch
    })
    if (match) {
      setSelectedVariant(match)
      if (match.image_url) setMainImage(match.image_url)
    }
  }, [selectedPropertyId, selectedColorId, product])

  const thumbnails: string[] = []
  product.variants.forEach((v) => {
    if (v.image_url && !thumbnails.includes(v.image_url)) thumbnails.push(v.image_url)
  })
  if (thumbnails.length === 0 && product.photo_url) thumbnails.push(product.photo_url)

  const currentPrice = selectedVariant?.price ?? product.price_min
  const stockCount = selectedVariant?.available_stock ?? 0
  const inStock = stockCount > 0

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name || product.name,
      price: Number(selectedVariant.price),
      quantity,
      imageUrl: selectedVariant.image_url || product.thumbnail_url || product.photo_url,
    })
    toast.success('Added to loadout')
  }

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price_min,
        originalPrice: product.price_max,
        imageUrl: product.thumbnail_url || product.photo_url,
      })
      toast.success('Saved to wishlist')
    }
  }

  const selectedColorName = product.colors.find((c) => c.id === selectedColorId)?.name

  return (
    <>
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
                  <img
                    src={mainImage || '/assets/logo-vertical-blue.png'}
                    alt={product.name}
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
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> In Stock · {stockCount} units
                </span>
              ) : (
                <span className="inline-flex items-center font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-red-100 text-red-700">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="font-headline-lg text-headline-lg font-black text-on-surface leading-tight mb-3 uppercase">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4 font-body-sm text-body-sm text-on-surface-variant">
              <StarRating rating={4} size="sm" />
              <span>(42 Reviews)</span>
              <span className="text-outline-variant">|</span>
              <span className="font-mono">SKU: {selectedVariant?.sku || 'N/A'}</span>
            </div>

            <div className="bg-primary-container p-5 border-l-4 border-secondary mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display-lg text-3xl font-extrabold text-white">
                  {formatCurrency(currentPrice)}
                </span>
                {product.price_max && currentPrice && Number(product.price_max) > Number(currentPrice) && (
                  <>
                    <span className="text-outline line-through text-sm">{formatCurrency(product.price_max)}</span>
                    <span className="bg-secondary text-white text-label-sm font-bold px-2 py-0.5">
                      -{Math.round(((Number(product.price_max) - Number(currentPrice)) / Number(product.price_max)) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="font-label-sm text-label-sm text-on-primary-container mt-1 uppercase tracking-widest">VAT included</p>
            </div>

            {product.properties.length > 0 && (
              <div className="mb-6">
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">Configuration</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.properties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelectedPropertyId(prop.id)}
                      className={`px-3 py-2 font-label-md text-label-md uppercase border transition-colors ${
                        selectedPropertyId === prop.id
                          ? 'border-2 border-secondary bg-secondary/10 text-secondary'
                          : 'border-outline-variant text-on-surface-variant hover:border-secondary'
                      }`}
                    >
                      {prop.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Finish: {selectedColorName || product.color_type || 'Select'}
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColorId(color.id)}
                      title={color.name}
                      className={`w-10 h-10 flex items-center justify-center transition-all ${
                        selectedColorId === color.id ? 'ring-2 ring-secondary ring-offset-2' : 'ring-1 ring-outline-variant'
                      }`}
                    >
                      <span className="block w-full h-full" style={{ backgroundColor: color.color_code || '#ccc' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">Quantity</h3>
              <QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={Math.max(stockCount, 1)} />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-label-md text-label-md uppercase tracking-widest py-4 hover:bg-secondary active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                Add To Loadout
              </button>
              <button
                onClick={toggleWishlist}
                className="w-14 h-14 flex items-center justify-center border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-secondary active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">{inWishlist ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">bolt</span>
                <div>
                  <p className="font-label-md text-label-md font-bold uppercase">24H Dispatch</p>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Nationwide</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
                <div>
                  <p className="font-label-md text-label-md font-bold uppercase">Warranty</p>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Lifetime Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-outline-variant">
            {([
              { key: 'description' as Tab, label: 'Description' },
              { key: 'specs' as Tab, label: 'Specifications' },
              { key: 'reviews' as Tab, label: 'Reviews' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-4 font-label-md text-label-md uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab.key ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === 'description' && (
              <div className="max-w-none text-on-surface-variant font-body-md text-body-md leading-relaxed">
                {product.description ? <p>{product.description}</p> : <p className="text-outline italic">No description available for this unit.</p>}
              </div>
            )}
            {activeTab === 'specs' && (
              <table className="w-full max-w-lg border-collapse border border-outline-variant font-body-sm text-body-sm">
                <tbody>
                  <tr><td className="border border-outline-variant px-4 py-2 font-bold uppercase font-label-md text-label-md">SKU</td><td className="border border-outline-variant px-4 py-2">{selectedVariant?.sku || 'N/A'}</td></tr>
                  <tr><td className="border border-outline-variant px-4 py-2 font-bold uppercase font-label-md text-label-md">Configuration</td><td className="border border-outline-variant px-4 py-2">{product.property_type || 'Standard'}</td></tr>
                  <tr><td className="border border-outline-variant px-4 py-2 font-bold uppercase font-label-md text-label-md">Finish</td><td className="border border-outline-variant px-4 py-2">{product.color_type || 'Standard'}</td></tr>
                  <tr><td className="border border-outline-variant px-4 py-2 font-bold uppercase font-label-md text-label-md">Available Stock</td><td className="border border-outline-variant px-4 py-2">{stockCount} units</td></tr>
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center justify-center p-6 bg-surface-container border border-outline-variant">
                    <span className="font-display-lg text-5xl font-bold text-on-surface">4.8</span>
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mt-1">out of 5</span>
                    <div className="mt-2"><StarRating rating={4.8} size="md" /></div>
                    <span className="font-label-sm text-label-sm text-outline mt-2">Based on 128 reviews</span>
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="font-label-md text-label-md text-on-surface-variant w-12">{item.stars} star</span>
                        <div className="flex-1 h-2 bg-surface-container overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className="font-label-md text-label-md text-outline w-10 text-right">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {sampleReviews.map((review) => (
                  <div key={review.id} className="border border-outline-variant p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center">
                          <span className="font-label-md text-label-md font-bold text-secondary">{review.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-label-md text-label-md font-bold text-on-surface">{review.name}</p>
                            <span className="font-label-sm text-label-sm bg-secondary/10 text-secondary px-2 py-0.5 uppercase">Verified</span>
                          </div>
                          <p className="font-label-sm text-label-sm text-outline">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <h2 className="font-headline-lg text-headline-lg-mobile font-black uppercase mb-6">Related Hardware</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant p-4 flex items-center gap-3 z-50">
        <button
          onClick={toggleWishlist}
          className="w-12 h-12 flex items-center justify-center border border-outline-variant text-on-surface-variant"
        >
          <span className="material-symbols-outlined">{inWishlist ? 'favorite' : 'favorite_border'}</span>
        </button>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 bg-primary text-white font-label-md text-label-md uppercase tracking-widest py-3 hover:bg-secondary active:scale-95 transition-all disabled:opacity-50"
        >
          Add To Loadout — {formatCurrency(currentPrice)}
        </button>
      </div>
    </>
  )
}
