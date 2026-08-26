import type { OrderTracking } from '@/api/types'
import { readCookie, setCookie } from './cookies'

// Attribution captured from the landing URL + Meta cookies, persisted as first-party
// `_<param>` cookies on the registrable root (same names as the eshops_storefront landing
// pages) so it is shared across the merchant's subdomains, then replayed onto order
// creation and incomplete-order capture. Visitor/session ids stay in web storage.

const SESSION_KEY = 'attr-session-id'
const VISITOR_KEY = 'attr-visitor-id'
// Lifetime of the `_<param>` cookies — deliberately longer than any platform's attribution
// window so a late conversion still carries its click id; the platform ignores one that falls
// outside its own window. 90 days matches Meta's _fbc/_fbp, Google's _gcl_aw and TikTok's _ttp.
// Safari's ITP caps anything written via document.cookie to 7 days regardless.
const ATTRIBUTION_MAX_AGE = 90 * 24 * 60 * 60
// Epoch ms when a `fbclid` was first seen, stamped alongside `_fbclid`.
const FBCLID_AT_KEY = '_fbclid_at'
const FBC_SUBDOMAIN_INDEX = 1

// URL params captured into first-party `_<param>` cookies (names match the storefront).
const URL_PARAM_KEYS = [
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
] as const satisfies readonly (keyof OrderTracking)[]

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

// Session-scoped one-shot guard. Returns true the first time it is called for `key`
// this tab session, false thereafter. sessionStorage survives reload/SPA nav but
// resets on a genuinely new session; keyed by session id.
export function markOncePerSession(key: string): boolean {
  if (typeof window === 'undefined') return false
  const storageKey = `once:${key}:${getSessionId()}`
  try {
    if (sessionStorage.getItem(storageKey)) return false
    sessionStorage.setItem(storageKey, '1')
    return true
  } catch {
    return true // storage blocked (private mode): fail-open, don't break tracking
  }
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
    if (!value) continue
    setCookie(`_${key}`, value, ATTRIBUTION_MAX_AGE)
    if (key === 'fbclid') setCookie(FBCLID_AT_KEY, String(Date.now()), ATTRIBUTION_MAX_AGE)
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

  // _fbp / _fbc are set by Meta's pixel; _ttp by TikTok's. The cookies are the source of truth,
  // except that _fbc is rebuilt from the click id when the pixel has not written it yet.
  const fbp = readCookie('_fbp')
  const fbclidAt = readCookie(FBCLID_AT_KEY)
  const fbc = readCookie('_fbc') || synthesizeFbc(tracking.fbclid, fbclidAt)
  const ttp = readCookie('_ttp')
  if (fbp) tracking.fbp = fbp
  if (fbc) tracking.fbc = fbc
  if (ttp) tracking.ttp = ttp
  if (fbclidAt) tracking.fbclid_at = Number(fbclidAt)

  // GA4 sets _ga (client id) and _ga_<stream> (session id); parse both for GA4 MP attribution.
  const gaClientId = parseGaClientId(readCookie('_ga'))
  const gaSessionId = readGaSessionId()
  if (gaClientId) tracking.ga_client_id = gaClientId
  if (gaSessionId) tracking.ga_session_id = gaSessionId

  tracking.session_id = getSessionId()
  tracking.visitor_id = getVisitorId()

  return tracking
}

// Meta's pixel writes _fbc on page load, so an event firing in the same instant reads the click
// id before the cookie exists. The timestamp must be when the click was first observed, never
// read time: a fresh one per read mints a different identifier for the same click.
function synthesizeFbc(fbclid: string | undefined, clickedAtMs: string | undefined): string {
  if (!fbclid || !clickedAtMs) return ''
  return `fb.${FBC_SUBDOMAIN_INDEX}.${clickedAtMs}.${fbclid}`
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
