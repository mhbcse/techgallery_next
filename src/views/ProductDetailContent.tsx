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

type Tab = 'description' | 'size-chart' | 'shipping'

const sampleReviews = [
  {
    id: 1,
    name: 'Fatima Akter',
    date: 'January 15, 2025',
    rating: 5,
    comment: 'Absolutely love this! The quality is amazing and my baby looks so adorable in it. Will definitely order again.',
  },
  {
    id: 2,
    name: 'Rashida Begum',
    date: 'December 28, 2024',
    rating: 4,
    comment: 'Great product, fast delivery. The color is slightly different from the picture but still beautiful. Recommended!',
  },
  {
    id: 3,
    name: 'Nusrat Jahan',
    date: 'December 10, 2024',
    rating: 5,
    comment: 'Perfect fit for my little one. The fabric is soft and comfortable. My baby loves wearing it all day!',
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

  // Initialize default variant
  useEffect(() => {
    const defaultVariant = product.variants.find((v) => v.is_default) || product.variants[0] || null
    setSelectedVariant(defaultVariant)
    if (defaultVariant) {
      setSelectedPropertyId(defaultVariant.property_id)
      setSelectedColorId(defaultVariant.color_id)
      if (defaultVariant.image_url) {
        setMainImage(defaultVariant.image_url)
      }
    }
  }, [product])

  // Update selected variant when property or color changes
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

  // Build thumbnail list
  const thumbnails: string[] = []
  product.variants.forEach((v) => {
    if (v.image_url && !thumbnails.includes(v.image_url)) {
      thumbnails.push(v.image_url)
    }
  })
  if (thumbnails.length === 0 && product.photo_url) {
    thumbnails.push(product.photo_url)
  }

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
    toast.success('Added to cart!')
  }

  const handleBuyNow = () => {
    handleAddToCart()
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
      toast.success('Added to wishlist!')
    }
  }

  const selectedColorName = product.colors.find((c) => c.id === selectedColorId)?.name

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb />
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {thumbnails.length > 0 && (
                <div className="flex md:flex-col gap-3">
                  {thumbnails.slice(0, 4).map((url) => (
                    <button
                      key={url}
                      onClick={() => setMainImage(url)}
                      className={`w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 ${
                        mainImage === url
                          ? 'border-2 border-primary'
                          : 'border border-pink-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 relative">
                <div className="aspect-[4/5] rounded-2xl bg-rose-blush overflow-hidden">
                  <img
                    src={mainImage || '/assets/carton-girl.webp'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className={`material-icons-outlined text-lg ${inWishlist ? 'text-primary' : 'text-slate-400'}`}>
                    {inWishlist ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-5">
            <div className="mb-3">
              {inStock ? (
                <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`material-icons-outlined text-sm ${i < 4 ? 'text-primary' : 'text-pink-200'}`}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-slate-500">(42 Reviews)</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">SKU: {selectedVariant?.sku || 'N/A'}</span>
            </div>

            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-primary">
                  {formatCurrency(currentPrice)}
                </span>
                {product.price_max && currentPrice && Number(product.price_max) > Number(currentPrice) && (
                  <>
                    <span className="text-slate-400 line-through text-sm">
                      {formatCurrency(product.price_max)}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      -{Math.round(((Number(product.price_max) - Number(currentPrice)) / Number(product.price_max)) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">VAT included</p>
            </div>

            {product.properties.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Select Age / Size</h3>
                  <button className="text-xs text-primary font-medium hover:underline">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.properties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelectedPropertyId(prop.id)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedPropertyId === prop.id
                          ? 'border-2 border-primary bg-primary/5 text-primary'
                          : 'border border-slate-200 text-slate-600 hover:border-slate-300'
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
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Color: {selectedColorName || product.color_type || 'Select'}
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColorId(color.id)}
                      title={color.name}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedColorId === color.id
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'ring-1 ring-slate-200'
                      }`}
                    >
                      <span
                        className="block w-full h-full rounded-full"
                        style={{ backgroundColor: color.color_code || '#ccc', padding: '2px' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Quantity</h3>
              <QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={Math.max(stockCount, 1)} />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-[2] flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold py-4 rounded-xl hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-icons-outlined text-lg">shopping_cart</span>
                Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className="w-[64px] h-[56px] flex items-center justify-center border-2 border-pink-100 text-pink-400 rounded-xl hover:border-primary active:scale-95 transition-all"
              >
                <span className="material-icons-outlined text-lg">
                  {inWishlist ? 'favorite' : 'favorite_border'}
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-[2] flex items-center justify-center gap-2 bg-primary-dark text-white font-semibold py-4 rounded-xl hover:bg-primary-dark/90 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-icons-outlined text-lg">bolt</span>
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-pink-100">
              <div className="flex items-center gap-3 p-3">
                <span className="material-icons-outlined text-primary text-xl">local_shipping</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">Delivery</p>
                  <p className="text-xs text-slate-500">2-4 Days in BD</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3">
                <span className="material-icons-outlined text-primary text-xl">payments</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">Payment</p>
                  <p className="text-xs text-slate-500">COD Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex border-b border-pink-100">
            {([
              { key: 'description' as Tab, label: 'Description' },
              { key: 'size-chart' as Tab, label: 'Size Chart' },
              { key: 'shipping' as Tab, label: 'Shipping & Returns' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="text-slate-400 italic">No description available for this product.</p>
                )}
              </div>
            )}
            {activeTab === 'size-chart' && (
              <div className="text-slate-600">
                <p className="mb-4">Please refer to the size chart below to find the best fit for your little one.</p>
                <table className="w-full max-w-lg border-collapse border border-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-4 py-2 text-left">Size</th>
                      <th className="border border-slate-200 px-4 py-2 text-left">Age</th>
                      <th className="border border-slate-200 px-4 py-2 text-left">Height (cm)</th>
                      <th className="border border-slate-200 px-4 py-2 text-left">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 px-4 py-2">S</td><td className="border border-slate-200 px-4 py-2">0-6 months</td><td className="border border-slate-200 px-4 py-2">56-68</td><td className="border border-slate-200 px-4 py-2">3-8</td></tr>
                    <tr><td className="border border-slate-200 px-4 py-2">M</td><td className="border border-slate-200 px-4 py-2">6-12 months</td><td className="border border-slate-200 px-4 py-2">68-80</td><td className="border border-slate-200 px-4 py-2">8-10</td></tr>
                    <tr><td className="border border-slate-200 px-4 py-2">L</td><td className="border border-slate-200 px-4 py-2">1-2 years</td><td className="border border-slate-200 px-4 py-2">80-92</td><td className="border border-slate-200 px-4 py-2">10-13</td></tr>
                    <tr><td className="border border-slate-200 px-4 py-2">XL</td><td className="border border-slate-200 px-4 py-2">2-3 years</td><td className="border border-slate-200 px-4 py-2">92-98</td><td className="border border-slate-200 px-4 py-2">13-15</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="text-slate-600 space-y-4">
                <div><h4 className="font-semibold text-slate-800 mb-1">Shipping</h4><p>We offer free shipping on orders over ৳2,000. Standard delivery takes 3-5 business days inside Dhaka and 5-7 business days outside Dhaka.</p></div>
                <div><h4 className="font-semibold text-slate-800 mb-1">Returns & Exchanges</h4><p>If you are not satisfied with your purchase, you may return or exchange the item within 7 days of delivery. Items must be unused and in their original packaging.</p></div>
                <div><h4 className="font-semibold text-slate-800 mb-1">Cash on Delivery</h4><p>We accept Cash on Delivery (COD) for all orders within Bangladesh. Pay when your package arrives at your doorstep.</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Customer Reviews</h2>
              <p className="text-sm text-slate-500 mt-1">What our customers say about this product</p>
            </div>
            <button className="border-2 border-primary text-primary font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/5 transition-colors">
              Write a Review
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center justify-center p-6 bg-pink-50/50 border border-pink-100 rounded-2xl">
              <span className="text-5xl font-bold text-slate-900">4.8</span>
              <span className="text-sm text-slate-500 mt-1">out of 5</span>
              <div className="mt-2"><StarRating rating={4.8} size="md" /></div>
              <span className="text-xs text-slate-400 mt-2">Based on 128 reviews</span>
            </div>
            <div className="lg:col-span-2 space-y-2">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-12">{item.stars} star</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="text-sm text-slate-500 w-10 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 mb-8">
            {sampleReviews.map((review) => (
              <div key={review.id} className="border border-pink-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{review.name}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                      </div>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">You May Also Like</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-pink-100 flex items-center justify-center hover:bg-pink-50 transition-colors">
                  <span className="material-icons-outlined text-slate-400 text-lg">chevron_left</span>
                </button>
                <button className="w-10 h-10 rounded-full border border-pink-100 flex items-center justify-center hover:bg-pink-50 transition-colors">
                  <span className="material-icons-outlined text-slate-400 text-lg">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 p-4 flex items-center gap-3 z-50">
        <button
          onClick={toggleWishlist}
          className="w-12 h-12 flex items-center justify-center border-2 border-pink-100 rounded-xl"
        >
          <span className={`material-icons-outlined ${inWishlist ? 'text-primary' : 'text-pink-400'}`}>
            {inWishlist ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex-1 bg-primary-dark text-white font-semibold py-3 rounded-xl hover:bg-primary-dark/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Now - {formatCurrency(currentPrice)}
        </button>
      </div>
    </>
  )
}
