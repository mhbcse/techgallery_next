import type { Bundle, ProductListItem } from '@/api/types'

// The home page fills six product slots: the hero, the large tile and four secondary cards.
export const HOME_FEATURED_LIMIT = 6
export const HOME_NEW_LIMIT = 8

// Curation first — the featured collection, in the drag order set in admin. `featured` is a
// per-website flag that stays empty until the seller curates, so a shop that has curated
// nothing falls back to new arrivals rather than an empty home page.
export const HOME_PRODUCT_SOURCES = [
  ['featured', HOME_FEATURED_LIMIT],
  ['new', HOME_NEW_LIMIT],
] as const

// A single entry in a mixed product/bundle feed.
export type CatalogEntry =
  | { kind: 'product'; product: ProductListItem }
  | { kind: 'bundle'; bundle: Bundle }

// Interleave bundles into a product list so the feed reads
// [prod][bundle][prod][prod][bundle]…. A bundle is dropped in after every
// `gap` products; any leftover bundles are appended at the end.
export function mergeCatalog(
  products: ProductListItem[],
  bundles: Bundle[],
  gap = 3
): CatalogEntry[] {
  const out: CatalogEntry[] = []
  let b = 0
  products.forEach((product, i) => {
    out.push({ kind: 'product', product })
    if (b < bundles.length && (i + 1) % gap === 0) {
      out.push({ kind: 'bundle', bundle: bundles[b++] })
    }
  })
  while (b < bundles.length) {
    out.push({ kind: 'bundle', bundle: bundles[b++] })
  }
  return out
}
