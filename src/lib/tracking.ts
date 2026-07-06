import type { OrderTracking } from '@/api/types'
import { readCookie, setCookie } from './cookies'

// Attribution captured from the landing URL + Meta cookies, persisted as first-party
// `_<param>` cookies on the registrable root (same names as the eshops_storefront landing
// pages) so it is shared across the merchant's subdomains, then replayed onto order
// creation and abandoned-cart capture. Visitor/session ids stay in web storage.

const SESSION_KEY = 'attr-session-id'
const VISITOR_KEY = 'attr-visitor-id'
// Ad-attribution window for the `_<param>` cookies — matches the storefront and the 7-day
// click window of the Google conversion action / Meta default.
const ATTRIBUTION_MAX_AGE = 7 * 24 * 60 * 60

// URL params captured into first-party `_<param>` cookies (names match the storefront).
const URL_PARAM_KEYS: (keyof OrderTracking)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'fbclid',
  'gclid',
  'wbraid',
  'gbraid',
  'ttclid',
  'ad_id',
  'ad_group_id',
  'campaign_id',
]

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Stable per-browser visitor id (localStorage) and per-tab session id (sessionStorage).
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = randomId()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = randomId()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// Write URL params into the shared `_<param>` cookies and return the full attribution
// object. Last-touch (matches the eshops_storefront standard): a campaigned visit
// overwrites the stored value, so the most recent campaign wins. Referrer is kept
// first-touch — unlike campaign params it appears on every navigation, so overwriting
// would replace the original external source with an in-site page.
export function captureAttribution(): OrderTracking {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  for (const key of URL_PARAM_KEYS) {
    const value = params.get(key)
    if (value) setCookie(`_${key}`, value, ATTRIBUTION_MAX_AGE)
  }

  if (document.referrer && !readCookie('_referrer')) setCookie('_referrer', document.referrer, ATTRIBUTION_MAX_AGE)

  return getStoredTracking()
}

export function getStoredTracking(): OrderTracking {
  if (typeof window === 'undefined') return {}

  const tracking: OrderTracking = {}
  for (const key of URL_PARAM_KEYS) {
    const value = readCookie(`_${key}`)
    if (value) tracking[key] = value
  }

  const referrer = readCookie('_referrer')
  if (referrer) tracking.referrer = referrer

  // _fbp / _fbc are set by Meta's pixel; _ttp by TikTok's. The cookies are the source of truth.
  const fbp = readCookie('_fbp')
  const fbc = readCookie('_fbc')
  const ttp = readCookie('_ttp')
  if (fbp) tracking.fbp = fbp
  if (fbc) tracking.fbc = fbc
  if (ttp) tracking.ttp = ttp

  // GA4 sets _ga (client id) and _ga_<stream> (session id); parse both for GA4 MP attribution.
  const gaClientId = parseGaClientId(readCookie('_ga'))
  const gaSessionId = readGaSessionId()
  if (gaClientId) tracking.ga_client_id = gaClientId
  if (gaSessionId) tracking.ga_session_id = gaSessionId

  tracking.session_id = getSessionId()
  tracking.visitor_id = getVisitorId()

  return tracking
}

function parseGaClientId(value: string | undefined): string {
  if (!value) return ''
  const match = value.match(/^GA\d+\.\d+\.(.+)$/)
  return match ? match[1] : ''
}

function readGaSessionId(): string {
  if (typeof document === 'undefined') return ''
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    if (!trimmed.startsWith('_ga_')) continue
    const value = decodeURIComponent(trimmed.slice(trimmed.indexOf('=') + 1))
    const gs2 = value.match(/^GS2\.\d+\.s(\d+)/)
    if (gs2) return gs2[1]
    const fields = value.split('.')
    if (fields.length > 2) return fields[2]
  }
  return ''
}
