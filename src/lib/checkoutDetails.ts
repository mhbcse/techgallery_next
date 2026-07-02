// Persist the shopper's last-entered checkout details so a returning (mostly guest)
// customer finds the form pre-filled. Stored in localStorage — this is client-only data
// (PII) and must never ride request headers the way a cookie would. district/area are
// stored as their select IDs so the dropdowns can be re-selected and the dependent area
// list re-fetched.
const STORAGE_KEY = 'tg_checkout'

export interface SavedCheckoutDetails {
  name?: string
  phone?: string
  address?: string
  email?: string
  districtId?: string
  areaId?: string
}

function stripEmpty(d: SavedCheckoutDetails): SavedCheckoutDetails {
  const out: SavedCheckoutDetails = {}
  for (const [key, value] of Object.entries(d)) {
    const trimmed = typeof value === 'string' ? value.trim() : value
    if (trimmed) out[key as keyof SavedCheckoutDetails] = trimmed
  }
  return out
}

export function readCheckoutDetails(): SavedCheckoutDetails {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

// saveCheckoutDetails merges over any existing entry so a partial (phone-blur) save
// never wipes fields captured on a previous, more complete submission.
export function saveCheckoutDetails(d: SavedCheckoutDetails): void {
  if (typeof window === 'undefined') return
  const merged = { ...readCheckoutDetails(), ...stripEmpty(d) }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}
