import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { captureAttribution, getStoredTracking } from './tracking'
import { readCookie, setCookie } from './cookies'

const originalLocation = window.location

// localhost => host-only cookies, which jsdom's cookie jar accepts; `search` feeds the
// URL-param capture.
function setLocation(search: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, hostname: 'localhost', protocol: 'http:', search },
  })
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

beforeEach(() => {
  clearCookies()
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
})

describe('captureAttribution', () => {
  it('writes URL params (incl. utm_id) into first-party _<param> cookies', () => {
    setLocation('?utm_source=fb&utm_id=123&fbclid=xyz')
    captureAttribution()
    expect(readCookie('_utm_source')).toBe('fb')
    expect(readCookie('_utm_id')).toBe('123')
    expect(readCookie('_fbclid')).toBe('xyz')
  })

  it('is first-touch: does not overwrite an already-stored value', () => {
    setCookie('_utm_source', 'original', 3600)
    setLocation('?utm_source=newvalue')
    captureAttribution()
    expect(readCookie('_utm_source')).toBe('original')
  })
})

describe('getStoredTracking', () => {
  it('rebuilds the tracking object from cookies plus visitor/session ids', () => {
    setLocation('?utm_source=fb&utm_id=123')
    setCookie('_fbp', 'fbp.1', 3600)
    setCookie('_fbc', 'fbc.1', 3600)
    captureAttribution()

    const t = getStoredTracking()
    expect(t.utm_source).toBe('fb')
    expect(t.utm_id).toBe('123')
    expect(t.fbp).toBe('fbp.1')
    expect(t.fbc).toBe('fbc.1')
    expect(t.visitor_id).toBeTruthy()
    expect(t.session_id).toBeTruthy()
  })
})
