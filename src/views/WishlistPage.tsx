'use client'

import Link from 'next/link'
import { useTitle } from '@/hooks/useTitle'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/formatCurrency'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)

  useTitle('My Wishlist - Baby Gallery')

  const handleMoveToCart = (item: typeof items[0]) => {
    // Number() tolerates legacy string values persisted in older localStorage.
    const price = Number(item.price ?? 0)

    addToCart({
      productId: item.productId,
      variantId: `${item.productId}-default`,
      name: item.name,
      variantName: 'Default',
      price,
      quantity: 1,
      imageUrl: item.imageUrl,
    })

    removeItem(item.productId)
    toast.success(`${item.name} moved to cart`)
  }

  const getDiscount = (item: typeof items[0]) => {
    if (!item.originalPrice || !item.price) return 0
    const original = Number(item.originalPrice)
    const current = Number(item.price)
    if (original <= current || isNaN(original) || isNaN(current)) return 0
    return Math.round(((original - current) / original) * 100)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex mb-6 text-sm font-medium">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-slate-500 hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <span className="material-icons-outlined text-slate-400 text-xs">chevron_right</span>
          </li>
          <li className="text-primary">Wishlist</li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="flex items-baseline gap-3 mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">My Wishlist</h1>
        <span className="text-slate-500 font-medium">({items.length} Items)</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 mb-8 bg-primary/5 rounded-full flex items-center justify-center">
            <span className="material-icons-outlined text-5xl text-primary/30">favorite</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            Your wishlist is feeling a bit lonely
          </h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">
            Add your favorite items to keep them saved for later.
          </p>
          <Link
            href="/shop"
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all flex items-center gap-2"
          >
            <span className="material-icons-outlined">storefront</span>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => {
            const discount = getDiscount(item)

            return (
              <div
                key={item.productId}
                className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-icons-outlined text-6xl text-slate-200">
                        image
                      </span>
                    </div>
                  )}

                  {/* Overlay Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm text-primary hover:bg-white transition-colors">
                      <span className="material-icons-outlined text-xl">favorite</span>
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-icons-outlined text-lg">close</span>
                    </button>
                  </div>

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute bottom-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
                      {discount}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-bold text-slate-800 mb-2 truncate hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-lg font-extrabold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    {item.originalPrice &&
                      Number(item.originalPrice) > Number(item.price) && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="mt-auto w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-outlined text-sm">shopping_cart</span>
                    Move to Cart
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
