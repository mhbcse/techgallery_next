import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { serverFetch } from '@/api/server'
import type { Product, CollectionResponse } from '@/api/types'
import CollectionListing from '@/views/CollectionListing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await serverFetch<CollectionResponse<Product>>(
      `/api/v1/categories/${slug}/products?page=1`,
      { revalidate: 300 }
    )
    if (res.category) {
      return {
        title: `${res.category.name} - Tech Gallery`,
        description: `Browse ${res.category.name} at Tech Gallery. High-performance peripherals and gear.`,
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

  let res: CollectionResponse<Product> | null = null
  try {
    res = await serverFetch<CollectionResponse<Product>>(
      `/api/v1/categories/${slug}/products?page=${page}`,
      { revalidate: 60 }
    )
  } catch {
    notFound()
  }

  if (!res || !res.category) notFound()

  return (
    <Suspense>
      <CollectionListing
        title={res.category.name}
        kind="category"
        slug={slug}
        initialProducts={res.data}
        initialPagination={res.meta}
      />
    </Suspense>
  )
}
