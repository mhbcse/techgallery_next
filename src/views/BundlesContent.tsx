'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { listBundles } from '@/api/bundles'
import type { Bundle, Pagination } from '@/api/types'
import BundleCard from '@/components/product/BundleCard'
import PaginationComponent from '@/components/ui/Pagination'
import Breadcrumb from '@/components/common/Breadcrumb'
import EmptyState from '@/components/common/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { useTitle } from '@/hooks/useTitle'

interface BundlesContentProps {
  initialBundles: Bundle[]
  initialPagination: Pagination | null
}

export default function BundlesContent({ initialBundles, initialPagination }: BundlesContentProps) {
  useTitle('Loadout Bundles - Tech Gallery')
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page')) || 1

  const [bundles, setBundles] = useState<Bundle[]>(initialBundles)
  const [pagination, setPagination] = useState<Pagination | null>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Re-fetch only when the page changes after the initial server render.
  useEffect(() => {
    if (!hydrated) {
      setHydrated(true)
      return
    }
    setLoading(true)
    listBundles({ page })
      .then((res) => {
        setBundles(res.data)
        setPagination(res.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handlePageChange = (next: number) => {
    router.push(`/bundles?page=${next}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb />
      <h1 className="text-headline-lg-mobile md:text-headline-lg font-display text-on-surface mb-2">Combat Kits & Loadout Bundles</h1>
      <p className="font-label-md uppercase tracking-wider text-on-surface-variant mb-8">Curated gear sets at a better price.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : bundles.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No loadouts available"
          description="Check back soon for kit deals."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
          {pagination && (
            <div className="mt-10">
              <PaginationComponent
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
