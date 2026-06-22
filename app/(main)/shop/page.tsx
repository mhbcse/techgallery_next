import { Suspense } from 'react'
import type { Metadata } from 'next'
import { serverFetch } from '@/api/server'
import type { Product, CategoryTree, Brand, PaginatedResponse } from '@/api/types'
import ShopContent from '@/views/ShopContent'

export const metadata: Metadata = {
  title: 'Shop - Tech Gallery',
  description: 'Browse high-performance keyboards, mice, audio gear and accessories.',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = params.page ? String(params.page) : '1'
  const search = params.search ? String(params.search) : ''
  const categoryId = params.category_id ? String(params.category_id) : ''
  const brandId = params.brand_id ? String(params.brand_id) : ''

  let products: Product[] = []
  let pagination = null
  let categories: CategoryTree[] = []
  let brands: Brand[] = []

  try {
    const queryParts = [`page=${page}`]
    if (search) queryParts.push(`search=${encodeURIComponent(search)}`)
    if (categoryId) queryParts.push(`category_id=${categoryId}`)
    if (brandId) queryParts.push(`brand_id=${brandId}`)

    const [productsRes, categoriesRes, brandsRes] = await Promise.all([
      serverFetch<PaginatedResponse<Product>>(
        `/api/v1/products?${queryParts.join('&')}`,
        { revalidate: 60 }
      ),
      serverFetch<PaginatedResponse<CategoryTree>>(
        '/api/v1/categories?tree=true',
        { revalidate: 300 }
      ),
      serverFetch<PaginatedResponse<Brand>>(
        '/api/v1/brands?per_page=100',
        { revalidate: 300 }
      ),
    ])

    products = productsRes.data
    pagination = productsRes.meta
    categories = categoriesRes.data
    brands = brandsRes.data
  } catch {
    // Fail silently
  }

  return (
    <Suspense>
      <ShopContent
        initialProducts={products}
        initialPagination={pagination}
        categories={categories}
        brands={brands}
      />
    </Suspense>
  )
}
