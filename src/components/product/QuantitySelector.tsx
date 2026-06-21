interface QuantitySelectorProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
}

export default function QuantitySelector({ quantity, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-outline-variant overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-40"
        disabled={quantity <= min}
      >
        <span className="material-symbols-outlined text-sm">remove</span>
      </button>
      <span className="px-4 py-2 font-label-md text-label-md font-bold min-w-[3rem] text-center border-x border-outline-variant">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-40"
        disabled={quantity >= max}
      >
        <span className="material-symbols-outlined text-sm">add</span>
      </button>
    </div>
  )
}
