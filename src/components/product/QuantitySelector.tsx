interface QuantitySelectorProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
}

export default function QuantitySelector({ quantity, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-pink-100 rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="px-3 py-2 text-primary hover:bg-pink-50 transition-colors"
        disabled={quantity <= min}
      >
        <span className="material-icons-outlined text-sm">remove</span>
      </button>
      <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center border-x border-pink-100">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="px-3 py-2 text-primary hover:bg-pink-50 transition-colors"
        disabled={quantity >= max}
      >
        <span className="material-icons-outlined text-sm">add</span>
      </button>
    </div>
  )
}
