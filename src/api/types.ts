export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string | null
  orders_count: number | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string | null
  description: string | null
  // Short plain-text summary shown on the product detail page.
  summary: string | null
  // Rich text / HTML specifications (admin-authored, trusted).
  specs: string | null
  price_min: number | null
  price_max: number | null
  active: boolean
  photo_url: string | null
  thumbnail_url: string | null
  // Full CDN URL for the product video; empty string when none.
  video_url: string | null
  color_type: string | null
  property_type: string | null
  // Warranty length in days; null when none is set.
  warranty_days: number | null
  created_at: string
  updated_at: string
}

export interface ProductDetail extends Product {
  variants: Variant[]
  colors: Color[]
  properties: Property[]
  // The product's gallery images, ordered by position.
  images: ProductImage[]
  // The product's categories on the resolved website (many); brand is single.
  categories: Category[]
  brand: Brand | null
  // Quantity offers ("buy N of a variant for ৳X"); empty when the website hasn't opted in.
  offers: Offer[]
}

// A gallery image attached to a product (separate from variant images).
export interface ProductImage {
  id: string
  position: number
  image_url: string
  thumbnail_url: string
}

// A "buy N for ৳X" quantity offer tied to a single variant. Order it by sending
// `id` as `quantity_tier_id` in order_items.
export interface Offer {
  id: string
  variant_id: string
  variant_name: string
  // Pieces per multiplier — one offer unit ships this many of the variant.
  quantity: number
  // Offer price for the whole tier (not per piece).
  price: number
  original_price: number | null
}

export interface Variant {
  id: string
  // Catalog-feed id (Meta/Google/TikTok `content_id`), e.g. "12-34-web-7". Send as
  // `content_ids` in pixel events. Null when no website is resolved.
  content_id: string | null
  name: string | null
  sku: string | null
  price: number
  original_price: number | null
  stock_quantity: number | null
  available_stock: number
  is_default: boolean | null
  // How the variant sells when out of stock. `preorder` = not yet received (has
  // availability_date); `backorder` = resupplied continuously (has backorder_lead_days).
  out_of_stock_policy: 'none' | 'preorder' | 'backorder'
  // Convenience flag — true when out_of_stock_policy is preorder or backorder. Gate ordering
  // of an out-of-stock variant on this.
  sells_out_of_stock: boolean
  // Preorder only — the specific date stock is expected (YYYY-MM-DD). Null for none/backorder.
  availability_date: string | null
  // Backorder only — estimated lead time in days ("ships in ~N days"). Null for none/preorder.
  backorder_lead_days: number | null
  position: number | null
  color_id: string | null
  property_id: string | null
  image_url: string | null
}

export interface Color {
  id: string
  name: string
  color_code: string | null
}

export interface Property {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  slug: string | null
  description: string | null
  position: number | null
  parent_id: string | null
  image_url: string | null
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
}

export interface Brand {
  id: string
  name: string
  slug: string | null
  description: string | null
  logo_url: string | null
}

export interface Order {
  id: string
  status: 'pending' | 'calling' | 'confirmed' | 'hold' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'returned' | 'cancelled' | 'lost'
  customer_name: string
  customer_phone: string
  customer_address: string
  total_amount: number
  shipping_charge: number
  grand_total: number
  created_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  product_id: string
  variant_id: string
  quantity: number
  unit_price: number
  // The out-of-stock kind this line was sold as, derived from the variant's policy at order time.
  out_of_stock_kind: 'none' | 'preorder' | 'backorder'
}

export interface Pagination {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: Pagination
}

export interface SingleResponse<T> {
  data: T
}

// Response from the nested slug endpoints /categories/:slug/products and
// /brands/:slug/products: a page of products plus the resolved entity for the heading.
export interface CollectionResponse<T> {
  data: T[]
  meta: Pagination
  category?: Category
  brand?: Brand
}

export interface ApiError {
  error: string
  message: string
}

export interface ValidationError {
  error: string
  messages: string[]
}

export interface Settings {
  meta_pixel_id: string | null
  google_analytics_id: string | null
  google_tag_manager_id: string | null
  tiktok_pixel_id: string | null
  microsoft_clarity_id: string | null
  // Full CDN URL for the site favicon; "" when unset.
  favicon_url: string
}

export interface Location {
  id: number
  name: string
  bn_name: string
  // Resolved delivery fee; omitted when no fee settings apply to the website's shop.
  fee?: number | null
}

// A component of a combo — a variant and how many of it the combo ships.
export interface BundleItem {
  variant_id: string
  product_id: string
  variant_name: string
  quantity: number
  effective_price: number
  available_stock: number
  sells_out_of_stock: boolean
}

// One selectable combo of a parent bundle. Order it by sending `id` as
// `bundle_variant_id` in order_items.
export interface BundleCombo {
  id: string
  name: string
  price: number
  original_price: number | null
  image_url: string
  // Max of this combo shippable today (min across components).
  available_stock: number
  // True if in stock or all short components sell out of stock (preorder or backorder).
  orderable: boolean
  items: BundleItem[]
}

// A parent bundle (mirrors Product → Variant). Price/stock/orderability live on
// each combo, not the parent.
export interface Bundle {
  id: string
  name: string
  image_url: string
  variants: BundleCombo[]
}

// Attribution data injected by the storefront on order creation / cart capture.
export interface OrderTracking {
  referrer?: string
  full_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  utm_id?: string
  fbclid?: string
  fbc?: string
  fbp?: string
  gclid?: string
  wbraid?: string
  gbraid?: string
  ttclid?: string
  ttp?: string
  ad_id?: string
  ad_group_id?: string
  campaign_id?: string
  // Link a captured cart/order back to a recorded visit.
  session_id?: string
  visitor_id?: string
}
