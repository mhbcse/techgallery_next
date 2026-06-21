interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
}

export default function StarRating({ rating, maxStars = 5, size = 'sm' }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sizeClasses[size]} ${
            i < Math.floor(rating) ? 'text-secondary' : 'text-outline-variant'
          }`}
        >
          star
        </span>
      ))}
    </div>
  )
}
