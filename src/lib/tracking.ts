import type { OrderTracking } from '@/api/types'
import { readCookie, setCookie } from './cookies'

// Attribution captured from the landing URL + Meta cookies, persisted as first-party
// `_<param>` cookies on the registrable root (same names as the eshops_storefront landing
// pages) so it is shared across the merchant's subdomains, then replayed onto order
// creation and abandoned-cart capture. Visitor/session ids stay in web storage.

const SESSION_KEY = 'attr-session-id'
const VISITOR_KEY = 'attr-visitor-id'
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60 // 90 days, matches the storefront tracking cookies

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

// Merge first-touch URL params + referrer into the shared `_<param>` cookies and return
// the full attribution object. Existing cookie values are preserved (first-touch wins).
export function captureAttribution(): OrderTracking {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  for (const key of URL_PARAM_KEYS) {
    const value = params.get(key)
    if (value && !readCookie(`_${key}`)) setCookie(`_${key}`, value, COOKIE_MAX_AGE)
  }

  if (document.referrer && !readCookie('_referrer')) setCookie('_referrer', document.referrer, COOKIE_MAX_AGE)

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

  // _fbp / _fbc are set by Meta's pixel; the cookie is the source of truth.
  const fbp = readCookie('_fbp')
  const fbc = readCookie('_fbc')
  if (fbp) tracking.fbp = fbp
  if (fbc) tracking.fbc = fbc

  tracking.session_id = getSessionId()
  tracking.visitor_id = getVisitorId()

  return tracking
}
