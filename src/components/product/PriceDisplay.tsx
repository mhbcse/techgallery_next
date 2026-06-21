import { formatCurrency } from '@/lib/formatCurrency'

interface PriceDisplayProps {
  price: string | number | null
  originalPrice?: string | number | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}

export default function PriceDisplay({ price, originalPrice, size = 'md' }: PriceDisplayProps) {
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price)
  const discount = hasDiscount
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`font-bold text-secondary ${sizeClasses[size]}`}>
        {formatCurrency(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-outline line-through text-sm">
            {formatCurrency(originalPrice)}
          </span>
          <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2 py-0.5">
            -{discount}%
          </span>
        </>
      )}
    </div>
  )
}
