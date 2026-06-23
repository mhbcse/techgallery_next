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
  price_min: number | null
  price_max: number | null
  active: boolean
  photo_url: string | null
  thumbnail_url: string | null
  category_id: string | null
  brand_id: string | null
  color_type: string | null
  property_type: string | null
  created_at: string
  updated_at: string
}

export interface ProductDetail extends Product {
  variants: Variant[]
  colors: Color[]
  properties: Property[]
  category: Category | null
  brand: Brand | null
}

export interface Variant {
  id: string
  name: string | null
  sku: string | null
  price: number
  original_price: number | null
  stock_quantity: number | null
  available_stock: number
  is_default: boolean | null
  preorder: boolean | null
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
  status: 'pending' | 'preorder' | 'locked' | 'approved' | 'shipped' | 'delivered' | 'failed' | 'returned' | 'cancelled'
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
  preorder: boolean
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
}

export interface Location {
  id: number
  name: string
  bn_name: string
  // Resolved delivery fee; omitted when no fee settings apply to the website's shop.
  fee?: number | null
}

export interface BundleItem {
  variant_id: string
  product_id: string
  variant_name: string
  quantity: number
  effective_price: number
  available_stock: number
  preorder: boolean
}

export interface Bundle {
  id: string
  name: string
  price: number
  original_price: number | null
  image_url: string
  available_stock: number
  orderable: boolean
  items: BundleItem[]
}

// Attribution data injected by the storefront on order creation / cart capture.
export interface OrderTracking {
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  fbc?: string
  fbp?: string
  gclid?: string
  wbraid?: string
  gbraid?: string
  ttclid?: string
  ad_id?: string
  ad_group_id?: string
  campaign_id?: string
  // Link a captured cart/order back to a recorded visit.
  session_id?: string
  visitor_id?: string
}
