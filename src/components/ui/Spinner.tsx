export default function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-4 border-rose-light border-t-primary ${className}`} />
  )
}
