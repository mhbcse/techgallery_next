import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { serverFetch } from '@/api/server'
import type { Product, CategoryTree, Brand, PaginatedResponse } from '@/api/types'
import ShopContent from '@/views/ShopContent'

async function resolveBrand(slug: string): Promise<{ brands: Brand[]; match: Brand | null }> {
  const res = await serverFetch<PaginatedResponse<Brand>>('/api/v1/brands?per_page=100', {
    revalidate: 300,
  })
  const brands = res.data || []
  return { brands, match: brands.find((b) => b.slug === slug) || null }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const { match } = await resolveBrand(slug)
    if (match) {
      return {
        title: `${match.name} - Tech Gallery`,
        description: `Shop ${match.name} hardware at Tech Gallery.`,
      }
    }
  } catch {
    // fall through to default
  }
  return { title: 'Brand - Tech Gallery' }
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const page = sp.page ? String(sp.page) : '1'
  const categoryFilter = sp.category_id ? String(sp.category_id) : ''
  const extraBrandIds = sp.brand_id ? String(sp.brand_id) : ''

  const { brands, match } = await resolveBrand(slug)
  if (!match) notFound()

  // The locked brand id is always applied, plus any extra brands from the URL.
  const brandParam = Array.from(
    new Set([match.id, ...extraBrandIds.split(',').filter(Boolean)])
  ).join(',')

  let products: Product[] = []
  let pagination = null
  let categories: CategoryTree[] = []

  try {
    const queryParts = [`page=${page}`, `brand_id=${brandParam}`]
    if (categoryFilter) queryParts.push(`category_id=${categoryFilter}`)

    const [productsRes, categoriesRes] = await Promise.all([
      serverFetch<PaginatedResponse<Product>>(`/api/v1/products?${queryParts.join('&')}`, {
        revalidate: 60,
      }),
      serverFetch<PaginatedResponse<CategoryTree>>('/api/v1/categories?tree=true', {
        revalidate: 300,
      }),
    ])
    products = productsRes.data
    pagination = productsRes.meta
    categories = categoriesRes.data
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
        lockedBrand={{ id: match.id, name: match.name }}
      />
    </Suspense>
  )
}
