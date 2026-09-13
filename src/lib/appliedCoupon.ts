// Hold the code a shopper applied so returning to the cart does not lose it. The code alone
// is stored, never the quoted amount — the quote is advisory and is re-fetched on restore.
// The hold expires because the API tells us nothing about a coupon's own validity window,
// so a code left here indefinitely would keep re-applying long after it stopped working.
const STORAGE_KEY = 'tg_coupon'
const HOLD_MS = 24 * 60 * 60 * 1000

interface StoredCoupon {
  code: string
  expiresAt: number
}

function read(): StoredCoupon | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.code !== 'string' || typeof parsed?.expiresAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function readAppliedCoupon(): string | null {
  const stored = read()
  if (!stored) return null
  if (stored.expiresAt <= Date.now()) {
    clearAppliedCoupon()
    return null
  }
  return stored.code
}

// The deadline is set when a code is first held and is not extended by later re-quotes, so
// the hold cannot renew itself for as long as someone keeps the tab open.
export function saveAppliedCoupon(code: string): void {
  if (typeof window === 'undefined') return
  const stored = read()
  const expiresAt =
    stored && stored.code === code && stored.expiresAt > Date.now()
      ? stored.expiresAt
      : Date.now() + HOLD_MS
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, expiresAt }))
}

export function clearAppliedCoupon(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
