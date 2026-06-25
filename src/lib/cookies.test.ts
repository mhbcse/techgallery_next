import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cookieDomain, readCookie, setCookie } from './cookies'
import { SITE_DOMAIN } from './constants'

const originalLocation = window.location

function setLocation(hostname: string, protocol = 'https:') {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, hostname, protocol, search: '' },
  })
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
})

describe('cookieDomain', () => {
  it('scopes to ".<SITE_DOMAIN>" on the apex and any subdomain', () => {
    setLocation(SITE_DOMAIN)
    expect(cookieDomain()).toBe(`.${SITE_DOMAIN}`)
    setLocation(`www.${SITE_DOMAIN}`)
    expect(cookieDomain()).toBe(`.${SITE_DOMAIN}`)
  })

  it('is host-only (empty) off-domain — localhost / previews', () => {
    setLocation('localhost', 'http:')
    expect(cookieDomain()).toBe('')
    setLocation('techgallery.pages.dev')
    expect(cookieDomain()).toBe('')
  })
})

describe('setCookie / readCookie', () => {
  beforeEach(() => {
    // localhost => host-only cookie, which jsdom's cookie jar accepts.
    setLocation('localhost', 'http:')
    clearCookies()
  })

  it('writes a value that readCookie returns', () => {
    setCookie('_utm_source', 'fb', 3600)
    expect(readCookie('_utm_source')).toBe('fb')
  })

  it('returns undefined for an absent cookie', () => {
    expect(readCookie('_missing')).toBeUndefined()
  })
})
