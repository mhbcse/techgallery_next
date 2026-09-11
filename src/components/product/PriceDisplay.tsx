import { formatPriceRange } from '@/lib/formatCurrency'

interface PriceDisplayProps {
  price: string | number | null
  // The top of the range when the variants don't share one price.
  priceMax?: string | number | null
  originalPrice?: string | number | null
  originalPriceMax?: string | number | null
  // The API's resolved discount; computed from the pair when absent.
  discountPercent?: number | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}

export default function PriceDisplay({
  price,
  priceMax,
  originalPrice,
  originalPriceMax,
  discountPercent,
  size = 'md',
}: PriceDisplayProps) {
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price)
  const discount = hasDiscount
    ? discountPercent ??
      Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`font-bold text-secondary ${sizeClasses[size]}`}>
        {formatPriceRange(price, priceMax)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-outline line-through text-sm">
            {formatPriceRange(originalPrice, originalPriceMax)}
          </span>
          <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2 py-0.5">
            -{discount}%
          </span>
        </>
      )}
    </div>
  )
}
