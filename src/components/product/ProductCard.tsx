'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/api/types'
import { formatCurrency } from '@/lib/formatCurrency'

interface ProductCardProps {
  product: Product
  showWishlist?: boolean
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()

  const handleAddToLoadout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${product.slug}`)
  }

  const hasDiscount = product.price_min !== product.price_max

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col justify-between bg-white border border-outline-variant p-6 hover:border-secondary transition-all"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-tighter">
            {product.color_type || 'Hardware'}
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-bold">
            {formatCurrency(product.price_min)}
          </span>
        </div>
        <div className="aspect-square mb-6 overflow-hidden">
          <img
            src={product.thumbnail_url || product.photo_url || '/assets/logo-vertical-blue.png'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <h4 className="font-label-md text-label-md font-bold uppercase mb-2 line-clamp-2">
          {product.name}
        </h4>
        {hasDiscount && (
          <span className="inline-block bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 mb-2">
            SALE
          </span>
        )}
      </div>
      <button
        onClick={handleAddToLoadout}
        className="w-full py-3 border border-primary font-label-md text-label-md uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all"
      >
        Add To Loadout
      </button>
    </Link>
  )
}
