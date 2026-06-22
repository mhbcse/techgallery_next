import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { serverFetch } from '@/api/server'
import type { Product, CategoryTree, Brand, PaginatedResponse } from '@/api/types'
import ShopContent from '@/views/ShopContent'

function findBySlug(cats: CategoryTree[], slug: string): CategoryTree | null {
  for (const cat of cats) {
    if (cat.slug === slug) return cat
    const child = findBySlug(cat.children || [], slug)
    if (child) return child
  }
  return null
}

async function resolveCategory(slug: string): Promise<{ tree: CategoryTree[]; match: CategoryTree | null }> {
  const res = await serverFetch<PaginatedResponse<CategoryTree>>('/api/v1/categories?tree=true', {
    revalidate: 300,
  })
  const tree = res.data || []
  return { tree, match: findBySlug(tree, slug) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const { match } = await resolveCategory(slug)
    if (match) {
      return {
        title: `${match.name} - Tech Gallery`,
        description: `Browse ${match.name} at Tech Gallery. High-performance peripherals and gear.`,
      }
    }
  } catch {
    // fall through to default
  }
  return { title: 'Category - Tech Gallery' }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const page = sp.page ? String(sp.page) : '1'
  const extraCategoryIds = sp.category_id ? String(sp.category_id) : ''
  const brandFilter = sp.brand_id ? String(sp.brand_id) : ''

  const { tree, match } = await resolveCategory(slug)
  if (!match) notFound()

  // The locked category id is always applied, plus any extra categories from the URL.
  const categoryParam = Array.from(
    new Set([match.id, ...extraCategoryIds.split(',').filter(Boolean)])
  ).join(',')

  let products: Product[] = []
  let pagination = null
  let brands: Brand[] = []

  try {
    const queryParts = [`page=${page}`, `category_id=${categoryParam}`]
    if (brandFilter) queryParts.push(`brand_id=${brandFilter}`)

    const [productsRes, brandsRes] = await Promise.all([
      serverFetch<PaginatedResponse<Product>>(`/api/v1/products?${queryParts.join('&')}`, {
        revalidate: 60,
      }),
      serverFetch<PaginatedResponse<Brand>>('/api/v1/brands?per_page=100', { revalidate: 300 }),
    ])
    products = productsRes.data
    pagination = productsRes.meta
    brands = brandsRes.data
  } catch {
    // Fail silently
  }

  return (
    <Suspense>
      <ShopContent
        initialProducts={products}
        initialPagination={pagination}
        categories={tree}
        brands={brands}
        lockedCategory={{ id: match.id, name: match.name }}
      />
    </Suspense>
  )
}
