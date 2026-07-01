// Thin, guarded wrappers around the Meta (`window.fbq`) and TikTok (`window.ttq`)
// pixels, both bootstrapped in src/components/common/TrackingScripts.tsx. Commerce
// events carry the variant catalog `content_id` (see Variant.content_id) so each
// platform can attribute them against the product feed.
//
// Note: settings (and thus `fbq`/`ttq`) load asynchronously, so they may be undefined
// for a brief window on first paint — early events are simply dropped, same as the
// base PageView. There is intentionally no retry/queue logic here.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    ttq?: { track?: (...args: unknown[]) => void; page?: () => void }
  }
}

const CURRENCY = 'BDT'
const CONTENT_TYPE = 'product'

function trackMeta(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  window.fbq('track', event, params)
}

function trackTikTok(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.ttq?.track !== 'function') return
  window.ttq.track(event, params)
}

export function trackViewContent({ contentId, value }: { contentId: string | null; value: number | null }): void {
  if (!contentId) return
  const params = {
    content_ids: [contentId],
    content_type: CONTENT_TYPE,
    currency: CURRENCY,
    ...(value != null ? { value } : {}),
  }
  trackMeta('ViewContent', params)
  trackTikTok('ViewContent', params)
}

export function trackAddToCart({
  contentId,
  value,
  quantity,
}: {
  contentId: string | null
  value: number | null
  quantity: number
}): void {
  if (!contentId) return
  const params = {
    content_ids: [contentId],
    content_type: CONTENT_TYPE,
    contents: [{ id: contentId, quantity }],
    currency: CURRENCY,
    quantity,
    ...(value != null ? { value } : {}),
  }
  trackMeta('AddToCart', params)
  trackTikTok('AddToCart', params)
}

export function trackInitiateCheckout({
  contentIds,
  value,
  numItems,
}: {
  contentIds: string[]
  value: number | null
  numItems: number
}): void {
  if (contentIds.length === 0) return
  const params = {
    content_ids: contentIds,
    content_type: CONTENT_TYPE,
    currency: CURRENCY,
    num_items: numItems,
    ...(value != null ? { value } : {}),
  }
  trackMeta('InitiateCheckout', params)
  trackTikTok('InitiateCheckout', params)
}
