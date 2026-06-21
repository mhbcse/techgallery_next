import { Suspense } from 'react'
import type { Metadata } from 'next'
import { serverFetch } from '@/api/server'
import type { Product, CategoryTree, PaginatedResponse } from '@/api/types'
import ShopContent from '@/views/ShopContent'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}): Promise<Metadata> {
  const { categorySlug } = await params
  const title =
    categorySlug.charAt(0).toUpperCase() +
    categorySlug.slice(1).replace(/-/g, ' ')

  return {
    title: `${title} - Baby Gallery`,
    description: `Shop ${title} at Baby Gallery. Premium kids fashion and accessories.`,
  }
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { categorySlug } = await params
  const sp = await searchParams
  const page = sp.page ? String(sp.page) : '1'
  const categoryId = sp.category_id ? String(sp.category_id) : ''

  let products: Product[] = []
  let pagination = null
  let categories: CategoryTree[] = []

  try {
    const queryParts = [`page=${page}`]
    if (categoryId) queryParts.push(`category_id=${categoryId}`)

    const [productsRes, categoriesRes] = await Promise.all([
      serverFetch<PaginatedResponse<Product>>(
        `/api/v1/products?${queryParts.join('&')}`,
        { revalidate: 60 }
      ),
      serverFetch<PaginatedResponse<CategoryTree>>(
        '/api/v1/categories?tree=true',
        { revalidate: 300 }
      ),
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
        categorySlug={categorySlug}
      />
    </Suspense>
  )
}
