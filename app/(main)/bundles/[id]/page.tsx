import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/api/server'
import type { Bundle, SingleResponse } from '@/api/types'
import BundleDetailContent from '@/views/BundleDetailContent'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const res = await serverFetch<SingleResponse<Bundle>>(`/api/v1/bundles/${id}`, {
      revalidate: 60,
    })
    const bundle = res.data

    return {
      title: `${bundle.name} - Tech Gallery`,
      description: `Get the ${bundle.name} combo kit at Tech Gallery. Bundled high-performance gear.`,
      openGraph: {
        title: `${bundle.name} - Tech Gallery`,
        images: bundle.image_url ? [{ url: bundle.image_url }] : [],
      },
    }
  } catch {
    return { title: 'Bundle - Tech Gallery' }
  }
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let bundle: Bundle | null = null

  try {
    const res = await serverFetch<SingleResponse<Bundle>>(`/api/v1/bundles/${id}`, {
      revalidate: 60,
    })
    bundle = res.data
  } catch {
    // Fail silently — falls through to notFound below.
  }

  if (!bundle || bundle.variants.length === 0) {
    notFound()
  }

  return <BundleDetailContent bundle={bundle} />
}
