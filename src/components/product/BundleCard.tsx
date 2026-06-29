'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Bundle } from '@/api/types'
import { bundlePriceRange } from '@/api/bundles'
import { formatCurrency } from '@/lib/formatCurrency'

interface BundleCardProps {
  bundle: Bundle
}

// Mirrors ProductCard: a card that navigates to the bundle detail page, where the
// user picks a combo. No direct add — combos carry their own price/stock.
export default function BundleCard({ bundle }: BundleCardProps) {
  const router = useRouter()
  const { min, minOriginal } = bundlePriceRange(bundle)
  const onSale = minOriginal != null && minOriginal > min

  const goToDetail = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/bundles/${bundle.id}`)
  }

  return (
    <Link
      href={`/bundles/${bundle.id}`}
      className="group flex flex-col justify-between bg-white border border-outline-variant p-6 hover:border-secondary transition-all"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-tighter font-bold">
            Combo Kit
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-bold">
            {formatCurrency(min)}
          </span>
        </div>
        <div className="aspect-square mb-6 overflow-hidden">
          <img
            src={bundle.image_url || '/assets/logo-vertical-blue.png'}
            alt={bundle.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <h4 className="font-label-md text-label-md font-bold uppercase mb-2 line-clamp-2">
          {bundle.name}
        </h4>
        {onSale && (
          <span className="inline-block bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 mb-2">
            SALE
          </span>
        )}
      </div>
      <button
        onClick={goToDetail}
        className="w-full py-3 border border-primary font-label-md text-label-md uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all"
      >
        View Kit
      </button>
    </Link>
  )
}
