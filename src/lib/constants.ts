export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.techgallerybd.com'

// Registrable root domain. First-party tracking cookies are scoped to ".<SITE_DOMAIN>" so
// they are shared with the merchant's other properties (e.g. the shop.* landing pages).
export const SITE_DOMAIN = 'techgallerybd.com'

export const APP_NAME = 'Tech Gallery'
// Shared preview image for links posted to Facebook, Messenger, WhatsApp and the like.
// Product pages override it with the product's own photo.
export const OG_IMAGE = { url: '/assets/techgallery.jpg', width: 786, height: 411 }
export const CURRENCY_SYMBOL = '৳'
export const DEFAULT_PER_PAGE = 20
