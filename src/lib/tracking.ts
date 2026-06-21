import type { OrderTracking } from '@/api/types'

// Persisted attribution captured from the landing URL + Meta cookies, replayed
// onto order creation and abandoned-cart capture.

const STORAGE_KEY = 'attribution'
const SESSION_KEY = 'attr-session-id'
const VISITOR_KEY = 'attr-visitor-id'

const URL_PARAM_KEYS: (keyof OrderTracking)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
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

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
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

// Merge first-touch URL params + live Meta cookies into stored attribution.
// Existing non-empty values are preserved (first-touch wins for utm/click ids).
export function captureAttribution(): OrderTracking {
  if (typeof window === 'undefined') return {}

  const stored = getStoredTracking()
  const params = new URLSearchParams(window.location.search)

  for (const key of URL_PARAM_KEYS) {
    const value = params.get(key)
    if (value && !stored[key]) stored[key] = value
  }

  if (!stored.referrer && document.referrer) stored.referrer = document.referrer

  // _fbp / _fbc are refreshed on every load (cookie is the source of truth).
  const fbp = readCookie('_fbp')
  const fbc = readCookie('_fbc')
  if (fbp) stored.fbp = fbp
  if (fbc) stored.fbc = fbc

  stored.session_id = getSessionId()
  stored.visitor_id = getVisitorId()

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  return stored
}

export function getStoredTracking(): OrderTracking {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OrderTracking) : {}
  } catch {
    return {}
  }
}
