import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/api/server'
import type { ProductDetail, Product, SingleResponse, PaginatedResponse } from '@/api/types'
import ProductDetailContent from '@/views/ProductDetailContent'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    const res = await serverFetch<SingleResponse<ProductDetail>>(
      `/api/v1/products/${slug}`,
      { revalidate: 60 }
    )
    const product = res.data

    return {
      title: `${product.name} - Tech Gallery`,
      description: product.description || `Buy ${product.name} at Tech Gallery. High-performance peripherals and gear.`,
      openGraph: {
        title: `${product.name} - Tech Gallery`,
        description: product.description || `Buy ${product.name} at Tech Gallery.`,
        images: product.photo_url ? [{ url: product.photo_url }] : [],
      },
    }
  } catch {
    return {
      title: 'Product - Tech Gallery',
    }
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let product: ProductDetail | null = null
  let relatedProducts: Product[] = []

  try {
    const productRes = await serverFetch<SingleResponse<ProductDetail>>(
      `/api/v1/products/${slug}`,
      { revalidate: 60 }
    )
    product = productRes.data

    // Fetch related products from the same category
    if (product.category_id) {
      const relatedRes = await serverFetch<PaginatedResponse<Product>>(
        `/api/v1/products?category_id=${product.category_id}&per_page=4`,
        { revalidate: 120 }
      )
      relatedProducts = relatedRes.data.filter((p) => p.id !== product!.id)
    }
  } catch {
    // Fail silently
  }

  if (!product) {
    notFound()
  }

  return (
    <ProductDetailContent
      product={product}
      relatedProducts={relatedProducts}
    />
  )
}
