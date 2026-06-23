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
      `/api/v1/brands/${slug}/products?page=1`,
      { revalidate: 300 }
    )
    if (res.brand) {
      return {
        title: `${res.brand.name} - Tech Gallery`,
        description: `Shop ${res.brand.name} hardware at Tech Gallery.`,
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

  let res: CollectionResponse<Product> | null = null
  try {
    res = await serverFetch<CollectionResponse<Product>>(
      `/api/v1/brands/${slug}/products?page=${page}`,
      { revalidate: 60 }
    )
  } catch {
    notFound()
  }

  if (!res || !res.brand) notFound()

  return (
    <Suspense>
      <CollectionListing
        title={res.brand.name}
        kind="brand"
        slug={slug}
        initialProducts={res.data}
        initialPagination={res.meta}
      />
    </Suspense>
  )
}
