'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { ProductDetail, Variant, Product, Color, Property, Offer } from '@/api/types'
import { useCartStore } from '@/stores/cartStore'
import { useCartUIStore } from '@/stores/cartUIStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatCurrency } from '@/lib/formatCurrency'
import { trackViewContent, trackAddToCart } from '@/lib/pixel'
import QuantitySelector from '@/components/product/QuantitySelector'
import ProductCard from '@/components/product/ProductCard'
import Breadcrumb from '@/components/common/Breadcrumb'

type Tab = 'description' | 'specs'

// Shared styling for admin-authored rich-text (description + specs). Tailwind preflight
// strips default list/heading styles, so we restyle the editor's tag set explicitly.
// Editor tag set: strong, em, del, a, h1, blockquote, pre, ul, ol, li, div, br.
const richTextClass = [
  'max-w-none font-body-md text-body-md text-on-surface-variant leading-relaxed',
  '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-on-surface [&_h1]:mt-4 [&_h1]:mb-2',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:mb-1',
  '[&_a]:text-secondary [&_a]:underline',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-outline-variant [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2',
  '[&_pre]:bg-surface-container [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto [&_pre]:my-2',
  '[&_p]:my-2 [&_del]:line-through',
].join(' ')

// Order a list of {id} entities by the first time each id is referenced across the
// position-sorted variants; fall back to the original list when nothing matches.
function orderByVariants<T extends { id: string }>(
  variants: Variant[],
  key: 'property_id' | 'color_id',
  items: T[]
): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const v of variants) {
    const refId = v[key]
    if (refId && !seen.has(refId)) {
      const found = items.find((i) => i.id === refId)
      if (found) {
        seen.add(refId)
        out.push(found)
      }
    }
  }
  return out.length ? out : items
}

// availability_date is a bare calendar date ("YYYY-MM-DD", no timezone) — format it
// from its parts so no timezone conversion can shift the merchant-set day.
function formatAvailabilityDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface ProductDetailContentProps {
  product: ProductDetail
  relatedProducts: Product[]
}

export default function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const [mainImage, setMainImage] = useState<string | null>(
    [...product.images].sort((a, b) => a.position - b.position)[0]?.image_url ?? null
  )
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<Tab>('description')

  const addItem = useCartStore((s) => s.addItem)
  const openCartAdded = useCartUIStore((s) => s.openCartAdded)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  // The API returns variants already in display order (sorted server-side by position);
  // use that order as-is to drive thumbnails + option pickers.
  const orderedVariants = product.variants

  // The properties/colors arrays carry no ordering field, so derive their order from the
  // position-sorted variants (first appearance wins), falling back to the raw arrays.
  const orderedProperties = orderByVariants<Property>(orderedVariants, 'property_id', product.properties)
  const orderedColors = orderByVariants<Color>(orderedVariants, 'color_id', product.colors)

  useEffect(() => {
    // Prefer a variant deep-linked via ?variant=<id> (e.g. from an ad/feed link) so the
    // page — and the ViewContent pixel below — lands on the advertised variant. Read the
    // param client-side to keep the page SSR/prerendered; fall back to the default variant.
    const variantParam =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('variant')
        : null
    const initialVariant =
      (variantParam && orderedVariants.find((v) => String(v.id) === variantParam)) ||
      orderedVariants.find((v) => v.is_default) ||
      orderedVariants[0] ||
      null
    setSelectedVariant(initialVariant)
    if (initialVariant) {
      setSelectedPropertyId(initialVariant.property_id)
      setSelectedColorId(initialVariant.color_id)
      if (initialVariant.image_url) setMainImage(initialVariant.image_url)
    }
  }, [product])

  useEffect(() => {
    const match = product.variants.find((v) => {
      const propertyMatch = selectedPropertyId ? v.property_id === selectedPropertyId : !v.property_id
      const colorMatch = selectedColorId ? v.color_id === selectedColorId : !v.color_id
      return propertyMatch && colorMatch
    })
    if (match) {
      setSelectedVariant(match)
      if (match.image_url) setMainImage(match.image_url)
    }
    // Offers are variant-specific — clear the selection when the variant changes.
    setSelectedOfferId(null)
  }, [selectedPropertyId, selectedColorId, product])

  // Thumbnail strip: the product's gallery images (position-ordered), then any
  // variant-specific images — deduped, skipping blanks. The cover/thumbnail is
  // intentionally excluded.
  const thumbnails: string[] = []
  const pushThumb = (url: string | null | undefined) => {
    if (url && !thumbnails.includes(url)) thumbnails.push(url)
  }
  ;[...product.images]
    .sort((a, b) => a.position - b.position)
    .forEach((img) => pushThumb(img.image_url))
  orderedVariants.forEach((v) => pushThumb(v.image_url))

  const currentPrice = selectedVariant?.price ?? product.price_min
  const originalPrice = selectedVariant?.original_price ?? null

  // Fire ViewContent for the selected variant, re-firing whenever the variant changes.
  const viewedContentId = selectedVariant?.content_id ?? null
  useEffect(() => {
    trackViewContent({ contentId: viewedContentId, value: selectedVariant?.price ?? null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedContentId])

  const stockCount = selectedVariant?.available_stock ?? 0
  const inStock = stockCount > 0
  // Out-of-stock variants can still be orderable via preorder (not yet received, expected on
  // availability_date) or backorder (resupplied continuously, ships in ~backorder_lead_days).
  const policy = selectedVariant?.out_of_stock_policy ?? 'none'
  const isPreorder = !inStock && policy === 'preorder'
  const isBackorder = !inStock && policy === 'backorder'
  const canOrder = inStock || (!inStock && !!selectedVariant?.sells_out_of_stock)

  // Quantity offers tied to the currently selected variant, and the picked one.
  const variantOffers = selectedVariant
    ? product.offers.filter((o) => o.variant_id === selectedVariant.id)
    : []
  const selectedOffer = variantOffers.find((o) => o.id === selectedOfferId) || null

  const handleAddToCart = () => {
    if (!selectedVariant) return
    // An offer line orders the whole tier via quantity_tier_id; `quantity` is the
    // multiplier. Otherwise place the regular variant line.
    const cartItem = selectedOffer
      ? {
          productId: product.id,
          variantId: `offer-${selectedOffer.id}`,
          quantityTierId: selectedOffer.id,
          contentId: selectedVariant.content_id,
          name: product.name,
          variantName: `${selectedOffer.variant_name} · Buy ${selectedOffer.quantity}`,
          price: Number(selectedOffer.price),
          quantity,
          imageUrl: selectedVariant.image_url || product.thumbnail_url || product.photo_url,
        }
      : {
          productId: product.id,
          variantId: selectedVariant.id,
          contentId: selectedVariant.content_id,
          name: product.name,
          variantName: selectedVariant.name || product.name,
          price: Number(selectedVariant.price),
          quantity,
          imageUrl: selectedVariant.image_url || product.thumbnail_url || product.photo_url,
        }
    addItem(cartItem)
    trackAddToCart({ contentId: selectedVariant.content_id, value: cartItem.price, quantity })
    toast.success('Added to loadout')
    openCartAdded(cartItem, relatedProducts)
  }

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: currentPrice,
        originalPrice: originalPrice,
        imageUrl: product.thumbnail_url || product.photo_url,
      })
      toast.success('Saved to wishlist')
    }
  }

  const selectedColorName = product.colors.find((c) => c.id === selectedColorId)?.name

  return (
    <>
      <div className="max-w-container-max mx-auto px-margin-lg py-6">
        <div className="mb-6">
          <Breadcrumb />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {thumbnails.length > 0 && (
                <div className="flex md:flex-col gap-3">
                  {thumbnails.map((url) => (
                    <button
                      key={url}
                      onClick={() => setMainImage(url)}
                      className={`w-20 h-24 overflow-hidden flex-shrink-0 border ${
                        mainImage === url ? 'border-2 border-secondary' : 'border-outline-variant'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 relative">
                <div className="aspect-[4/5] bg-surface-container industrial-grid overflow-hidden border border-outline-variant relative">
                  <div className="absolute -top-px -left-px w-10 h-10 border-t-2 border-l-2 border-secondary z-10" />
                  <div className="absolute -bottom-px -right-px w-10 h-10 border-b-2 border-r-2 border-secondary z-10" />
                  <img
                    src={mainImage || '/assets/logo-vertical-blue.png'}
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <h1 className="font-headline-lg text-headline-lg font-black text-on-surface leading-tight mb-3 uppercase">
              {product.name}
            </h1>

            {(product.categories.length > 0 || product.brand) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {product.categories.map((category) =>
                  category.slug ? (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="inline-block px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                    >
                      {category.name}
                    </Link>
                  ) : (
                    <span
                      key={category.id}
                      className="inline-block px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant text-on-surface-variant"
                    >
                      {category.name}
                    </span>
                  )
                )}
                {product.brand &&
                  (product.brand.slug ? (
                    <Link
                      href={`/brands/${product.brand.slug}`}
                      className="inline-block px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                    >
                      {product.brand.name}
                    </Link>
                  ) : (
                    <span className="inline-block px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant text-on-surface-variant">
                      {product.brand.name}
                    </span>
                  ))}
              </div>
            )}

            {product.summary && (
              <p className="mb-4 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {product.summary}
              </p>
            )}

            <div className="bg-primary-container p-5 border-l-4 border-secondary mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display-lg text-3xl font-extrabold text-white">
                  {formatCurrency(currentPrice)}
                </span>
                {originalPrice && currentPrice && Number(originalPrice) > Number(currentPrice) && (
                  <>
                    <span className="text-outline line-through text-sm">{formatCurrency(originalPrice)}</span>
                    <span className="bg-secondary text-white text-label-sm font-bold px-2 py-0.5">
                      -{Math.round(((Number(originalPrice) - Number(currentPrice)) / Number(originalPrice)) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="font-label-sm text-label-sm text-on-primary-container mt-1 uppercase tracking-widest">VAT included</p>
            </div>

            <div className="mb-6">
              {inStock ? (
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-secondary/10 text-secondary">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> In Stock
                </span>
              ) : isPreorder ? (
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-secondary/10 text-secondary">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" /> Pre-order
                  {selectedVariant?.availability_date && (
                    <> · Available {formatAvailabilityDate(selectedVariant.availability_date)}</>
                  )}
                </span>
              ) : isBackorder ? (
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-secondary/10 text-secondary">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" /> Available for order
                  {selectedVariant?.backorder_lead_days != null && (
                    <> · Ships in ~{selectedVariant.backorder_lead_days} days</>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 bg-red-100 text-red-700">
                  Out of Stock
                </span>
              )}
            </div>

            {variantOffers.length > 0 && (
              <div className="mb-6">
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">Bulk Offers</h3>
                <div className="flex flex-col gap-2">
                  {variantOffers.map((offer) => {
                    const active = selectedOfferId === offer.id
                    const save =
                      offer.original_price != null ? offer.original_price - offer.price : 0
                    return (
                      <button
                        key={offer.id}
                        onClick={() => setSelectedOfferId(active ? null : offer.id)}
                        className={`flex items-center justify-between px-4 py-3 border text-left transition-colors ${
                          active
                            ? 'border-2 border-secondary bg-secondary/10'
                            : 'border-outline-variant hover:border-secondary'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              active ? 'border-secondary bg-secondary' : 'border-outline'
                            }`}
                          />
                          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                            Buy {offer.quantity}
                          </span>
                        </span>
                        <span className="flex items-baseline gap-2">
                          {save > 0 && (
                            <span className="font-label-sm text-label-sm bg-secondary text-white px-2 py-0.5">
                              Save {formatCurrency(save)}
                            </span>
                          )}
                          <span className="font-bold text-on-surface">{formatCurrency(offer.price)}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {orderedProperties.length > 0 && (
              <div className="mb-6">
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">Configuration</h3>
                <div className="grid grid-cols-4 gap-2">
                  {orderedProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelectedPropertyId(prop.id)}
                      className={`px-3 py-2 font-label-md text-label-md uppercase border transition-colors ${
                        selectedPropertyId === prop.id
                          ? 'border-2 border-secondary bg-secondary/10 text-secondary'
                          : 'border-outline-variant text-on-surface-variant hover:border-secondary'
                      }`}
                    >
                      {prop.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderedColors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Finish: {selectedColorName || product.color_type || 'Select'}
                </h3>
                <div className="flex gap-3">
                  {orderedColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColorId(color.id)}
                      title={color.name}
                      className={`w-10 h-10 flex items-center justify-center transition-all ${
                        selectedColorId === color.id ? 'ring-2 ring-secondary ring-offset-2' : 'ring-1 ring-outline-variant'
                      }`}
                    >
                      <span className="block w-full h-full" style={{ backgroundColor: color.color_code || '#ccc' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-2">Quantity</h3>
              <QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={inStock ? stockCount : canOrder ? 99 : 1} />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!canOrder}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-label-md text-label-md uppercase tracking-widest py-4 hover:bg-secondary active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                {isBackorder ? 'Available for order' : isPreorder ? 'Pre-order' : 'Add To Loadout'}
              </button>
              <button
                onClick={toggleWishlist}
                className="w-14 h-14 flex items-center justify-center border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-secondary active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">{inWishlist ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">bolt</span>
                <div>
                  <p className="font-label-md text-label-md font-bold uppercase">24H Dispatch</p>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Nationwide</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
                <div>
                  <p className="font-label-md text-label-md font-bold uppercase">Warranty</p>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                    {product.warranty_days ? `${product.warranty_days} Days` : 'Not Covered'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-outline-variant">
            {([
              { key: 'description' as Tab, label: 'Description' },
              { key: 'specs' as Tab, label: 'Specifications' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-4 font-label-md text-label-md uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab.key ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === 'description' &&
              (product.description ? (
                <div className={richTextClass} dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-outline italic">No description available for this unit.</p>
              ))}
            {activeTab === 'specs' &&
              (product.specs ? (
                <div className={richTextClass} dangerouslySetInnerHTML={{ __html: product.specs }} />
              ) : (
                <p className="text-outline italic">No specifications available for this unit.</p>
              ))}
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <h2 className="font-headline-lg text-headline-lg-mobile font-black uppercase mb-6">Related Hardware</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant p-4 flex items-center gap-3 z-50">
        <button
          onClick={toggleWishlist}
          className="w-12 h-12 flex items-center justify-center border border-outline-variant text-on-surface-variant"
        >
          <span className="material-symbols-outlined">{inWishlist ? 'favorite' : 'favorite_border'}</span>
        </button>
        <button
          onClick={handleAddToCart}
          disabled={!canOrder}
          className="flex-1 bg-primary text-white font-label-md text-label-md uppercase tracking-widest py-3 hover:bg-secondary active:scale-95 transition-all disabled:opacity-50"
        >
          {isBackorder ? 'Available for order' : isPreorder ? 'Pre-order' : 'Add To Loadout'} — {formatCurrency(selectedOffer ? selectedOffer.price : currentPrice)}
        </button>
      </div>
    </>
  )
}
