'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { listProducts } from '@/api/products'
import type { Product, CategoryTree, Pagination } from '@/api/types'
import ProductGrid from '@/components/product/ProductGrid'
import PaginationComponent from '@/components/ui/Pagination'

const SPEC_TAGS = ['Wireless', 'RGB', 'Mechanical', 'OLED', '8K Polling', 'Hot-Swap']

const SORT_OPTIONS = [
  { label: 'Sort: Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
]

interface ShopContentProps {
  initialProducts: Product[]
  initialPagination: Pagination | null
  categories: CategoryTree[]
  categorySlug?: string
}

export default function ShopContent({
  initialProducts,
  initialPagination,
  categories,
  categorySlug,
}: ShopContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams?.get('search') || ''
  const page = Number(searchParams?.get('page')) || 1
  const activeCategoryId = searchParams?.get('category_id') || ''

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [pagination, setPagination] = useState<Pagination | null>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  // Re-fetch when URL params change (after initial render)
  useEffect(() => {
    setLoading(true)
    const params: Record<string, string | number> = { page }
    if (search) params.search = search
    if (activeCategoryId) params.category_id = Number(activeCategoryId)

    listProducts(params)
      .then((res) => {
        setProducts(res.data)
        setPagination(res.meta)
      })
      .finally(() => setLoading(false))
  }, [search, page, activeCategoryId])

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key)
      else params.set(key, value)
    })
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => updateParams({ page: String(newPage) })

  const handleCategoryToggle = (categoryId: string) => {
    if (activeCategoryId === categoryId) updateParams({ category_id: null, page: null })
    else updateParams({ category_id: categoryId, page: null })
  }

  const toggleSpec = (spec: string) =>
    setSelectedSpecs((prev) => (prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]))

  const pageTitle = categorySlug
    ? categorySlug.replace(/-/g, ' ').toUpperCase()
    : search
      ? `SEARCH: "${search.toUpperCase()}"`
      : 'THE ARMORY'

  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-10">
      {/* Header */}
      <div className="mb-8 border-b border-outline-variant pb-6">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em]">Hardware Catalog</span>
        <h1 className="font-headline-lg text-headline-lg font-black tracking-tight mt-2">{pageTitle}</h1>
      </div>

      {/* Top bar: count + sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {pagination && (
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {pagination.total_count} units · page {pagination.current_page}/{pagination.total_pages}
          </span>
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-outline-variant text-label-md font-label-md uppercase px-3 py-2 outline-none focus:ring-1 focus:ring-secondary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          {/* Hardware type / categories */}
          <div>
            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-4 border-l-2 border-secondary pl-2">
              Hardware Type
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeCategoryId === cat.id}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="border-outline-variant text-secondary focus:ring-secondary"
                  />
                  <span
                    className={`font-body-sm text-body-sm ${
                      activeCategoryId === cat.id
                        ? 'font-semibold text-secondary'
                        : 'text-on-surface group-hover:text-secondary transition-colors'
                    }`}
                  >
                    {cat.name}
                  </span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className="font-body-sm text-body-sm text-outline">No categories available.</p>
              )}
            </div>
          </div>

          {/* Price range */}
          <div>
            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-4 border-l-2 border-secondary pl-2">
              Price Range (BDT)
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="MIN"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-1/2 bg-white border border-outline-variant text-label-md font-label-md px-3 py-2 focus:ring-1 focus:ring-secondary outline-none"
              />
              <span className="text-outline">–</span>
              <input
                type="number"
                placeholder="MAX"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-1/2 bg-white border border-outline-variant text-label-md font-label-md px-3 py-2 focus:ring-1 focus:ring-secondary outline-none"
              />
            </div>
          </div>

          {/* Technical specs */}
          <div>
            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-4 border-l-2 border-secondary pl-2">
              Technical Specs
            </h3>
            <div className="flex flex-wrap gap-2">
              {SPEC_TAGS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-1.5 font-label-sm text-label-sm uppercase tracking-wider border transition-all ${
                    selectedSpecs.includes(spec)
                      ? 'border-secondary text-secondary bg-secondary/10'
                      : 'border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} />
          {pagination && (
            <PaginationComponent
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
