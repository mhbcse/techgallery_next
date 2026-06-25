import { SITE_DOMAIN } from './constants'

// cookieDomain returns the cookie `domain` attribute that scopes a cookie to every
// subdomain of the site's registrable root (".<SITE_DOMAIN>"), so first-party cookies are
// shared with the merchant's other properties (the shop.* landing pages, etc.). On any
// other host (localhost, Cloudflare previews) it returns "" so the cookie stays host-only
// — the browser would reject a mismatched domain attribute anyway.
export function cookieDomain(): string {
  if (typeof window === 'undefined') return ''
  const { hostname } = window.location
  return hostname === SITE_DOMAIN || hostname.endsWith(`.${SITE_DOMAIN}`) ? `.${SITE_DOMAIN}` : ''
}

// setCookie writes a root-scoped first-party cookie (Secure on https, Lax same-site).
export function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return
  const parts = [`${name}=${encodeURIComponent(value)}`, 'path=/', 'SameSite=Lax', `max-age=${maxAgeSeconds}`]
  const domain = cookieDomain()
  if (domain) parts.push(`domain=${domain}`)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') parts.push('Secure')
  document.cookie = parts.join('; ')
}

export function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}
