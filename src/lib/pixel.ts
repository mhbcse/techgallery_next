import type { BrowserEventFlags, Settings } from '@/api/types'
import { getStoredTracking } from './tracking'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.techgallerybd.com'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    ttq?: { track?: (...args: unknown[]) => void; page?: () => void; identify?: (...args: unknown[]) => void }
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const CURRENCY = 'BDT'
const CONTENT_TYPE = 'product'

const GOOGLE_EVENT_NAMES: Record<string, string> = {
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
}

type Platform = keyof BrowserEventFlags

interface PixelConfig {
  meta: string | null
  tiktok: string | null
  google: string | null
  metaPixelId: string | null
  events: Record<string, BrowserEventFlags>
}

let config: PixelConfig | null = null

interface UserData {
  sha256_email_address?: string
  sha256_phone_number?: string
}

let matchUserData: UserData | null = null

export function configurePixels(settings: Settings): void {
  config = {
    meta: settings.meta_browser_push_method,
    tiktok: settings.tiktok_browser_push_method,
    google: settings.google_browser_push_method,
    metaPixelId: settings.meta_pixel_id,
    events: settings.browser_events || {},
  }
}

async function sha256Hex(input: string): Promise<string> {
  if (!input || typeof crypto === 'undefined' || !crypto.subtle) return ''
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function toE164(phone: string): string {
  const p = phone.replace(/[\s\-()]/g, '')
  if (!p) return ''
  if (p.startsWith('+')) return p
  if (p.startsWith('0')) return `+880${p.slice(1)}`
  return `+${p}`
}

export async function setCustomerMatch({ email, phone }: { email?: string | null; phone?: string | null }): Promise<void> {
  const em = (email || '').trim().toLowerCase()
  const e164 = phone ? toE164(phone) : ''
  if (!em && !e164) return

  if (
    config?.meta !== 'google_tag_manager' &&
    config?.metaPixelId &&
    typeof window !== 'undefined' &&
    typeof window.fbq === 'function'
  ) {
    const advanced: Record<string, string> = {}
    if (em) advanced.em = em
    if (e164) advanced.ph = e164.replace('+', '')
    window.fbq('init', config.metaPixelId, advanced)
  }

  const [emailHash, phoneHash] = await Promise.all([sha256Hex(em), sha256Hex(e164)])
  const ud: UserData = {}
  if (emailHash) ud.sha256_email_address = emailHash
  if (phoneHash) ud.sha256_phone_number = phoneHash
  matchUserData = Object.keys(ud).length ? ud : null

  if (matchUserData && typeof window !== 'undefined' && typeof window.ttq?.identify === 'function') {
    const identity: Record<string, string> = {}
    if (emailHash) identity.email = emailHash
    if (phoneHash) identity.phone_number = phoneHash
    window.ttq.identify(identity)
  }
}

function enabled(name: string, platform: Platform): boolean {
  if (!config) return true
  const flags = config.events[name]
  return flags ? Boolean(flags[platform]) : false
}

interface EcommerceItem {
  item_id: string
  item_name?: string
  price?: number
  quantity: number
}

interface Ecommerce {
  currency: string
  value?: number
  items: EcommerceItem[]
}

function gtmPush(wireName: string, ecommerce: Ecommerce): void {
  if (typeof window === 'undefined' || !Array.isArray(window.dataLayer)) return
  window.dataLayer.push({ ecommerce: null })
  const payload: Record<string, unknown> = { event: wireName, ecommerce }
  if (matchUserData) payload.user_data = matchUserData
  window.dataLayer.push(payload)
}

function genEventId(): string {
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// Mirror each browser funnel event to the API so the Rails drain can re-send it via
// server-side CAPI with the SAME event_id (Meta/TikTok dedup the browser + server pair).
function beaconFunnel(name: string, eventID: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    const tracking: Record<string, unknown> = {
      ...getStoredTracking(),
      user_agent: navigator.userAgent,
      page_url: window.location.href,
    }
    void fetch(`${API_BASE_URL}/api/v1/tracking-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: name, event_id: eventID, properties: params, tracking }),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {})
  } catch {
    // best-effort: matching is an enhancement, never a blocker
  }
}

function fire(name: string, params: Record<string, unknown>, ecommerce: Ecommerce): void {
  const googleName = GOOGLE_EVENT_NAMES[name] ?? name
  if (config && !config.events[name] && !config.events[googleName]) return
  const meta = config?.meta ?? 'native'
  const tiktok = config?.tiktok ?? 'native'
  const google = config?.google ?? 'none'
  const eventID = genEventId()
  let sharedGtmPushed = false

  if (enabled(name, 'meta')) {
    if (meta === 'google_tag_manager') {
      if (!sharedGtmPushed) {
        gtmPush(name, ecommerce)
        sharedGtmPushed = true
      }
    } else if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', name, params, { eventID })
    }
  }

  if (enabled(name, 'tiktok')) {
    if (tiktok === 'google_tag_manager') {
      if (!sharedGtmPushed) {
        gtmPush(name, ecommerce)
        sharedGtmPushed = true
      }
    } else if (typeof window !== 'undefined' && typeof window.ttq?.track === 'function') {
      window.ttq.track(name, params, { event_id: eventID })
    }
  }

  if (enabled(googleName, 'google')) {
    if (google === 'google_tag_manager') {
      gtmPush(googleName, ecommerce)
    } else if (
      (google === 'google_analytics_4' || google === 'google_ads_tag') &&
      typeof window !== 'undefined' &&
      typeof window.gtag === 'function'
    ) {
      window.gtag('event', googleName, ecommerce)
    }
  }

  beaconFunnel(name, eventID, params)
}

export function trackViewContent({ contentId, value }: { contentId: string | null; value: number | null }): void {
  if (!contentId) return
  const params = {
    content_ids: [contentId],
    content_type: CONTENT_TYPE,
    currency: CURRENCY,
    ...(value != null ? { value } : {}),
  }
  const ecommerce: Ecommerce = {
    currency: CURRENCY,
    ...(value != null ? { value } : {}),
    items: [{ item_id: contentId, quantity: 1, ...(value != null ? { price: value } : {}) }],
  }
  fire('ViewContent', params, ecommerce)
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
  const ecommerce: Ecommerce = {
    currency: CURRENCY,
    ...(value != null ? { value } : {}),
    items: [{ item_id: contentId, quantity, ...(value != null && quantity > 0 ? { price: value / quantity } : {}) }],
  }
  fire('AddToCart', params, ecommerce)
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
  const ecommerce: Ecommerce = {
    currency: CURRENCY,
    ...(value != null ? { value } : {}),
    items: contentIds.map((id) => ({ item_id: id, quantity: 1 })),
  }
  fire('InitiateCheckout', params, ecommerce)
}
