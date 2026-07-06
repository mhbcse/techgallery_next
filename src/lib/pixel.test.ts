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
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true } as Response)))
  })

  it('fires native fbq/ttq/gtag with the wire name and a shared event id', () => {
    configurePixels(baseSettings({ browser_events: {
      AddToCart: { meta: true, tiktok: true, google: false },
      add_to_cart: { meta: false, tiktok: false, google: true },
    } }))
    trackAddToCart({ contentId: 'p1-v1-web-1', value: 100, quantity: 2 })

    expect(window.fbq).toHaveBeenCalledWith('track', 'AddToCart', expect.objectContaining({ content_ids: ['p1-v1-web-1'] }), { eventID: expect.any(String) })
    expect(window.ttq!.track).toHaveBeenCalledWith('AddToCart', expect.objectContaining({ contents: [{ id: 'p1-v1-web-1', quantity: 2 }] }), { event_id: expect.any(String) })
    expect(window.gtag).toHaveBeenCalledWith('event', 'add_to_cart', expect.objectContaining({
      currency: 'BDT',
      items: [{ item_id: 'p1-v1-web-1', quantity: 2, price: 50 }],
    }))
    expect(window.dataLayer).toHaveLength(0)

    const fbEventID = (window.fbq as ReturnType<typeof vi.fn>).mock.calls[0][3].eventID
    const ttEventID = (window.ttq!.track as ReturnType<typeof vi.fn>).mock.calls[0][2].event_id
    expect(fbEventID).toBe(ttEventID)
  })

  it('fires google via its wire-name config even when no canonical key exists', () => {
    configurePixels(baseSettings({ browser_events: { view_item: { meta: false, tiktok: false, google: true } } }))
    trackViewContent({ contentId: 'p1-v1-web-1', value: 100 })

    expect(window.fbq).not.toHaveBeenCalled()
    expect(window.gtag).toHaveBeenCalledWith('event', 'view_item', expect.objectContaining({ currency: 'BDT' }))
  })

  it('skips firing and beaconing entirely for an unconfigured event', () => {
    configurePixels(baseSettings({ browser_events: { AddToCart: { meta: true, tiktok: true, google: false } } }))
    trackViewContent({ contentId: 'p1-v1-web-1', value: 100 })

    expect(window.fbq).not.toHaveBeenCalled()
    expect(window.gtag).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('mirrors the event to the API /tracking-events with the same event id for server dedup', async () => {
    configurePixels(baseSettings({ browser_events: { AddToCart: { meta: true, tiktok: true, google: true } } }))
    trackAddToCart({ contentId: 'p1-v1-web-1', value: 100, quantity: 2 })

    const fetchMock = fetch as ReturnType<typeof vi.fn>
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/tracking-events')
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.event_name).toBe('AddToCart')
    const nativeEventID = (window.fbq as ReturnType<typeof vi.fn>).mock.calls[0][3].eventID
    expect(body.event_id).toBe(nativeEventID)
  })

  it('routes GTM platforms via dataLayer and pushes the shared meta/tiktok event once', () => {
    configurePixels(baseSettings({
      meta_browser_push_method: 'google_tag_manager',
      tiktok_browser_push_method: 'google_tag_manager',
      google_browser_push_method: 'google_tag_manager',
      browser_events: {
        ViewContent: { meta: true, tiktok: true, google: false },
        view_item: { meta: false, tiktok: false, google: true },
      },
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
      browser_events: {
        ViewContent: { meta: true, tiktok: true, google: false },
        view_item: { meta: false, tiktok: false, google: true },
      },
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
