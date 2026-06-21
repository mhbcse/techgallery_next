import { Suspense } from 'react'
import type { Metadata } from 'next'
import { serverFetch } from '@/api/server'
import type { Bundle, PaginatedResponse } from '@/api/types'
import BundlesContent from '@/views/BundlesContent'

export const metadata: Metadata = {
  title: 'Bundles - Baby Gallery',
  description: 'Shop curated bundles and combo deals for kids fashion at a better price.',
}

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = params.page ? String(params.page) : '1'

  let bundles: Bundle[] = []
  let pagination = null

  try {
    const res = await serverFetch<PaginatedResponse<Bundle>>(
      `/api/v1/bundles?page=${page}`,
      { revalidate: 60 }
    )
    bundles = res.data
    pagination = res.meta
  } catch {
    // Fail silently
  }

  return (
    <Suspense>
      <BundlesContent initialBundles={bundles} initialPagination={pagination} />
    </Suspense>
  )
}
