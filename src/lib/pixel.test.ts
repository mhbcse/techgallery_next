import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configurePixels, setCustomerMatch, trackAddToCart, trackViewContent } from './pixel'
import type { Settings } from '@/api/types'

function baseSettings(overrides: Partial<Settings>): Settings {
  return {
    meta_pixel_id: 'FB1',
    google_analytics_id: 'G-1',
    google_ads_tag_id: 'AW-1',
    google_tag_manager_id: 'GTM-1',
    tiktok_pixel_id: 'TT1',
    microsoft_clarity_id: null,
    meta_browser_push_method: 'native',
    tiktok_browser_push_method: 'native',
    google_browser_push_method: 'google_analytics_4',
    browser_events: {},
    favicon_url: '',
    ...overrides,
  }
}

describe('pixel routing', () => {
  beforeEach(() => {
    window.fbq = vi.fn()
    window.ttq = { track: vi.fn(), identify: vi.fn() }
    window.gtag = vi.fn()
    window.dataLayer = []
  })

  it('fires native fbq/ttq/gtag with the wire name per platform', () => {
    configurePixels(baseSettings({ browser_events: { AddToCart: { meta: true, tiktok: true, google: true } } }))
    trackAddToCart({ contentId: 'p1-v1-web-1', value: 100, quantity: 2 })

    expect(window.fbq).toHaveBeenCalledWith('track', 'AddToCart', expect.objectContaining({ content_ids: ['p1-v1-web-1'] }))
    expect(window.ttq!.track).toHaveBeenCalledWith('AddToCart', expect.objectContaining({ contents: [{ id: 'p1-v1-web-1', quantity: 2 }] }))
    expect(window.gtag).toHaveBeenCalledWith('event', 'add_to_cart', expect.objectContaining({
      currency: 'BDT',
      items: [{ item_id: 'p1-v1-web-1', quantity: 2, price: 50 }],
    }))
    expect(window.dataLayer).toHaveLength(0)
  })

  it('routes GTM platforms via dataLayer and pushes the shared meta/tiktok event once', () => {
    configurePixels(baseSettings({
      meta_browser_push_method: 'google_tag_manager',
      tiktok_browser_push_method: 'google_tag_manager',
      google_browser_push_method: 'google_tag_manager',
      browser_events: { ViewContent: { meta: true, tiktok: true, google: true } },
    }))
    trackViewContent({ contentId: 'p1-v1-web-1', value: 100 })

    expect(window.fbq).not.toHaveBeenCalled()
    expect(window.gtag).not.toHaveBeenCalled()
    const events = (window.dataLayer as Array<Record<string, unknown>>).filter((e) => 'event' in e)
    expect(events.map((e) => e.event)).toEqual(['ViewContent', 'view_item'])
    expect(window.dataLayer).toEqual([
      { ecommerce: null },
      expect.objectContaining({ event: 'ViewContent' }),
      { ecommerce: null },
      expect.objectContaining({ event: 'view_item' }),
    ])
  })

  it('gates each platform by browser_events', () => {
    configurePixels(baseSettings({
      browser_events: { ViewContent: { meta: true, tiktok: false, google: false } },
    }))
    trackViewContent({ contentId: 'p1-v1-web-1', value: 100 })

    expect(window.fbq).toHaveBeenCalledTimes(1)
    expect(window.ttq!.track).not.toHaveBeenCalled()
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('does not fire an event absent from a non-empty config', () => {
    configurePixels(baseSettings({ browser_events: { AddToCart: { meta: true, tiktok: true, google: true } } }))
    trackViewContent({ contentId: 'p1-v1-web-1', value: 100 })
    expect(window.fbq).not.toHaveBeenCalled()
  })

  it('re-inits Meta with plaintext advanced matching', async () => {
    configurePixels(baseSettings({ meta_browser_push_method: 'native' }))
    await setCustomerMatch({ email: 'Buyer@Example.com', phone: '01711111111' })
    expect(window.fbq).toHaveBeenCalledWith('init', 'FB1', { em: 'buyer@example.com', ph: '8801711111111' })
  })

  it('hashes identity into ttq.identify and the GTM user_data', async () => {
    configurePixels(baseSettings({
      meta_browser_push_method: 'google_tag_manager',
      tiktok_browser_push_method: 'google_tag_manager',
      google_browser_push_method: 'google_tag_manager',
      browser_events: { ViewContent: { meta: true, tiktok: true, google: true } },
    }))
    await setCustomerMatch({ email: 'buyer@example.com', phone: '01711111111' })
    expect(window.ttq!.identify).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String), phone_number: expect.any(String) }),
    )
    trackViewContent({ contentId: 'p1-v1-web-1', value: 100 })
    const pushed = (window.dataLayer as Array<Record<string, unknown>>).find((e) => e.event === 'ViewContent')
    expect(pushed!.user_data).toMatchObject({
      sha256_email_address: expect.any(String),
      sha256_phone_number: expect.any(String),
    })
  })
})
