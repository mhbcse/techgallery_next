import type { CatalogEntry } from '@/lib/catalog'
import ProductCard from './ProductCard'
import BundleCard from './BundleCard'
import Spinner from '../ui/Spinner'

interface CatalogGridProps {
  entries: CatalogEntry[]
  loading?: boolean
}

// Renders a mixed product/bundle feed; dispatches each entry to its card.
// Mirrors ProductGrid's loading/empty states.
export default function CatalogGrid({ entries, loading }: CatalogGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 border border-outline-variant bg-surface-container-lowest">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">inventory_2</span>
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">No hardware found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) =>
        entry.kind === 'bundle' ? (
          <BundleCard key={`bundle-${entry.bundle.id}`} bundle={entry.bundle} />
        ) : (
          <ProductCard key={`product-${entry.product.id}`} product={entry.product} />
        )
      )}
    </div>
  )
}
