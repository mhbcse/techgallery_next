import type { Metadata } from 'next'
import Link from 'next/link'
import { serverFetch } from '@/api/server'
import type { Product, Bundle, PaginatedResponse } from '@/api/types'
import ProductCard from '@/components/product/ProductCard'
import BundleCard from '@/components/product/BundleCard'
import { mergeCatalog } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Tech Gallery - High-Performance Peripherals',
  description:
    'Engineered for zero-latency execution. Discover precision keyboards, mice and audio gear built for high-stakes competition.',
}

const specs = [
  {
    label: 'Global Logistics',
    title: '24H DISPATCH',
    body: 'All orders prioritized through our central tech hub for rapid deployment.',
  },
  {
    label: 'Support Protocol',
    title: 'BRAND WARRANTY',
    body: 'Authentic products backed by the manufacturer\'s warranty where applicable.',
  },
  {
    label: 'Encryption',
    title: 'SECURE CHECKOUT',
    body: '256-bit military grade encryption for all transactional data packets.',
  },
]

export default async function HomePage() {
  let products: Product[] = []
  let bundles: Bundle[] = []

  try {
    const [productsRes, bundlesRes] = await Promise.all([
      serverFetch<PaginatedResponse<Product>>('/api/v1/products?per_page=8', {
        revalidate: 60,
      }),
      serverFetch<PaginatedResponse<Bundle>>('/api/v1/bundles?per_page=4', {
        revalidate: 60,
      }).catch(() => ({ data: [] as Bundle[] })),
    ])
    products = productsRes.data
    bundles = bundlesRes.data
  } catch {
    // Fail silently — show page without products
  }

  const feature = products[0]
  // The Command Center large tile shows a different product than the hero banner; fall
  // back to the hero only when the catalog has a single product.
  const trending = products[1] ?? feature
  // Interleave bundles into the secondary cards, keeping the grid tidy at 4 tiles.
  const secondaryEntries = mergeCatalog(products.slice(2, 6), bundles, 2).slice(0, 4)

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[640px] flex items-center bg-tertiary-container overflow-hidden industrial-grid">
        <div className="max-w-container-max mx-auto px-margin-lg grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10 w-full">
          {/* Content */}
          <div className="lg:col-span-6 bg-primary py-12 lg:py-20 px-8 lg:px-12 slanted-container border-l-4 border-secondary self-center shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-12 h-[2px] bg-secondary" />
              <span className="font-label-md text-label-md text-secondary tracking-[0.2em] uppercase">
                Performance Engineered
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-white leading-none mb-6">
              {feature?.name ?? 'Performance Peripherals'}
            </h1>
            <p className="font-body-md text-body-md text-outline-variant max-w-md mb-8">
              {feature?.summary ||
                'Engineered for zero-latency execution. High-performance peripherals built for high-stakes competition.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={feature?.slug ? `/products/${feature.slug}` : '/shop'}
                className="bg-secondary text-white font-label-md text-label-md px-8 py-4 uppercase tracking-widest hover:brightness-110 active:translate-y-1 transition-all border border-secondary"
              >
                Initialize Purchase
              </Link>
              <Link
                href="/shop"
                className="bg-transparent text-white font-label-md text-label-md px-8 py-4 uppercase tracking-widest border border-outline hover:bg-white/10 transition-all"
              >
                Browse Armory
              </Link>
            </div>
          </div>

          {/* Product display */}
          <div className="lg:col-span-6 flex justify-center items-center relative py-16 lg:py-0">
            <div className="relative w-full aspect-square max-w-lg group">
              <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full scale-75 group-hover:scale-90 transition-transform duration-700" />
              {feature?.photo_url ? (
                <Link href={feature.slug ? `/products/${feature.slug}` : '/shop'} className="block w-full h-full">
                  <img
                    src={feature.photo_url}
                    alt={feature.name}
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,123,255,0.5)]"
                  />
                </Link>
              ) : (
                <img
                  src="/assets/logo-vertical-transparent-white.png"
                  alt="Tech Gallery"
                  className="relative z-10 w-2/3 h-2/3 m-auto inset-0 absolute object-contain opacity-80"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Command Center: Trending Hardware */}
      <section className="py-24 bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-lg">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-headline-lg font-black tracking-tight mb-2">COMMAND CENTER</h2>
              <div className="h-1 w-24 bg-secondary" />
            </div>
            <Link
              href="/shop"
              className="font-label-md text-label-md text-secondary flex items-center gap-2 hover:gap-4 transition-all"
            >
              VIEW ENTIRE ARMORY <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* Large feature */}
              {trending && (
                <Link
                  href={`/products/${trending.slug}`}
                  className="lg:col-span-3 bg-white border border-outline-variant p-1 group overflow-hidden"
                >
                  <div className="relative h-full min-h-[400px]">
                    <img
                      src={trending.photo_url || trending.thumbnail_url || '/assets/logo-vertical-blue.png'}
                      alt={trending.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-8">
                      <span className="bg-secondary text-white text-[10px] font-bold px-2 py-1 mb-4 inline-block">FEATURED</span>
                      <h3 className="text-white font-headline-lg text-headline-lg mb-2 uppercase line-clamp-2">{trending.name}</h3>
                      <span className="text-white font-label-md text-label-md flex items-center gap-2">
                        DEPLOY SYSTEM <span className="material-symbols-outlined text-sm">east</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Secondary cards — products interleaved with bundle kits */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secondaryEntries.map((entry) =>
                  entry.kind === 'bundle' ? (
                    <BundleCard key={`bundle-${entry.bundle.id}`} bundle={entry.bundle} />
                  ) : (
                    <ProductCard key={`product-${entry.product.id}`} product={entry.product} />
                  )
                )}
              </div>

              {/* Specs bar */}
              <div className="lg:col-span-6 bg-primary-container p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-l-4 border-secondary">
                {specs.map((s) => (
                  <div key={s.title} className="flex flex-col gap-2">
                    <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-widest">{s.label}</span>
                    <div className="text-white font-headline-lg text-headline-lg-mobile font-bold">{s.title}</div>
                    <p className="text-on-primary-container font-body-sm text-body-sm">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="material-symbols-outlined text-4xl text-secondary animate-spin">progress_activity</span>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
                Awaiting hardware feed…
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Visual Break */}
      <section className="h-64 relative bg-primary flex items-center justify-center overflow-hidden">
        <div className="relative z-10 flex flex-wrap justify-center gap-4 px-4">
          <span className="text-white/20 font-display-lg text-display-lg font-black italic tracking-tighter">ENGINEERED</span>
          <span className="text-secondary font-display-lg text-display-lg font-black italic tracking-tighter">BEYOND</span>
          <span className="text-white/20 font-display-lg text-display-lg font-black italic tracking-tighter">LIMITS</span>
        </div>
      </section>

      {/* Technical Superiority */}
      <section className="py-24 bg-white">
        <div className="max-w-container-max mx-auto px-margin-lg">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 w-full relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-secondary" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-secondary" />
              <div className="w-full aspect-video bg-tertiary-container industrial-grid flex items-center justify-center">
                <img src="/assets/logo-vertical-transparent-white.png" alt="Tech Gallery" className="w-1/3 object-contain opacity-90" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-headline-lg text-headline-lg font-bold mb-6">TECHNICAL SUPERIORITY</h2>
              <p className="text-on-surface-variant font-body-md text-body-md mb-8 leading-relaxed">
                Every component in our gallery undergoes rigorous stress-testing. We don&apos;t just sell hardware; we
                provide the instruments of digital mastery. Our technical support team consists of engineers, not just
                representatives.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 border border-outline-variant bg-surface-container-lowest">
                  <div className="font-label-md text-label-md font-bold mb-1">STRESS TESTED</div>
                  <div className="text-[10px] text-outline uppercase tracking-widest">Level 04 Certified</div>
                </div>
                <div className="p-4 border border-outline-variant bg-surface-container-lowest">
                  <div className="font-label-md text-label-md font-bold mb-1">PRO VALIDATED</div>
                  <div className="text-[10px] text-outline uppercase tracking-widest">eSports Ready</div>
                </div>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 font-label-md text-label-md text-white bg-primary px-8 py-4 hover:bg-secondary transition-colors uppercase tracking-widest"
              >
                Enter The Gallery <span className="material-symbols-outlined">launch</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
