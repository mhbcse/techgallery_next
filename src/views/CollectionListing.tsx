'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Product, Pagination } from '@/api/types'
import { getCategoryProducts } from '@/api/categories'
import { getBrandProducts } from '@/api/brands'
import ProductGrid from '@/components/product/ProductGrid'
import PaginationComponent from '@/components/ui/Pagination'

interface CollectionListingProps {
  title: string
  kind: 'category' | 'brand'
  slug: string
  initialProducts: Product[]
  initialPagination: Pagination | null
}

// Exclusive product listing for a single category or brand — no cross-filter sidebar.
export default function CollectionListing({
  title,
  kind,
  slug,
  initialProducts,
  initialPagination,
}: CollectionListingProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page')) || 1

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [pagination, setPagination] = useState<Pagination | null>(initialPagination)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetcher = kind === 'category' ? getCategoryProducts : getBrandProducts
    fetcher(slug, { page })
      .then((res) => {
        setProducts(res.data)
        setPagination(res.meta)
      })
      .finally(() => setLoading(false))
  }, [kind, slug, page])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', String(newPage))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-10">
      {/* Header */}
      <div className="mb-8 border-b border-outline-variant pb-6">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em]">Hardware Catalog</span>
        <h1 className="font-headline-lg text-headline-lg font-black tracking-tight mt-2">{title.toUpperCase()}</h1>
      </div>

      {pagination && (
        <div className="mb-8">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {pagination.total_count} units · page {pagination.current_page}/{pagination.total_pages}
          </span>
        </div>
      )}

      <ProductGrid products={products} loading={loading} />
      {pagination && (
        <PaginationComponent
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
