import type { Bundle, Product } from '@/api/types'

// A single entry in a mixed product/bundle feed.
export type CatalogEntry =
  | { kind: 'product'; product: Product }
  | { kind: 'bundle'; bundle: Bundle }

// Interleave bundles into a product list so the feed reads
// [prod][bundle][prod][prod][bundle]…. A bundle is dropped in after every
// `gap` products; any leftover bundles are appended at the end.
export function mergeCatalog(
  products: Product[],
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
