'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { listProducts } from '@/api/products'
import type { Product, CategoryTree, Pagination } from '@/api/types'
import ProductGrid from '@/components/product/ProductGrid'
import PaginationComponent from '@/components/ui/Pagination'
import Breadcrumb from '@/components/common/Breadcrumb'

const AGE_GROUPS = ['0-12 Months', '1-3 Years', '4-6 Years', '7+ Years']

const SORT_OPTIONS = [
  { label: 'Sort by: Popularity', value: 'featured' },
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
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null)
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

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) })
  }

  const handleCategoryToggle = (categoryId: string) => {
    if (activeCategoryId === categoryId) {
      updateParams({ category_id: null, page: null })
    } else {
      updateParams({ category_id: categoryId, page: null })
    }
  }

  const pageTitle = categorySlug
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ')
    : search
      ? `Search: "${search}"`
      : 'Shop'

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top bar: breadcrumb + sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Breadcrumb />
        <div className="flex items-center gap-4">
          {pagination && (
            <span className="text-sm text-slate-500">
              Showing {(pagination.current_page - 1) * pagination.per_page + 1}-
              {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of{' '}
              {pagination.total_count} products
            </span>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={activeCategoryId === cat.id}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span
                    className={`text-sm ${
                      activeCategoryId === cat.id
                        ? 'font-medium text-primary'
                        : 'group-hover:text-primary transition-colors'
                    }`}
                  >
                    {cat.name}
                  </span>
                  {cat.children && (
                    <span className="ml-auto text-xs text-slate-400">
                      ({cat.children.length})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Price Range (BDT)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-1/2 bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-1/2 bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Age Group */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Age Group
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {AGE_GROUPS.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAgeGroup(selectedAgeGroup === age ? null : age)}
                  className={`px-3 py-2 text-xs border rounded transition-all ${
                    selectedAgeGroup === age
                      ? 'border-primary text-primary bg-primary/10 font-semibold'
                      : 'border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Promotional card */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-primary group">
            <img
              src="/assets/category-girls-party-wear.webp"
              alt="Seasonal Offer"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <p className="text-xs font-bold uppercase mb-1">Seasonal Offer</p>
              <h4 className="text-xl font-bold leading-tight mb-3">Up to 40% OFF on Party Wear</h4>
              <Link
                href="/shop?sale=true"
                className="w-full py-2 bg-white text-primary rounded-lg font-bold text-sm shadow-xl hover:bg-slate-50 transition-colors text-center block"
              >
                Shop Collection
              </Link>
            </div>
          </div>
        </aside>

        {/* Product grid area */}
        <div className="flex-1 min-w-0">
          {/* Products */}
          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
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
