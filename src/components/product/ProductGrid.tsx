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
      <div className="text-center py-20">
        <span className="material-icons-outlined text-5xl text-slate-200 mb-4">inventory_2</span>
        <p className="text-slate-500">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
