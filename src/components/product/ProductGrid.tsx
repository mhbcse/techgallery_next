import type { Product } from '@/api/types'
import ProductCard from './ProductCard'
import Spinner from '../ui/Spinner'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 border border-outline-variant bg-surface-container-lowest">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">inventory_2</span>
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">No hardware found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
