'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { createOrder, type OrderItemInput } from '@/api/orders'
import { captureAbandonedCart } from '@/api/abandonedCarts'
import { listDistricts, listAreas } from '@/api/locations'
import type { Location } from '@/api/types'
import { getStoredTracking } from '@/lib/tracking'
import { shippingSchema, type ShippingFormData } from '@/lib/validators'
import { formatCurrency } from '@/lib/formatCurrency'
import EmptyState from '@/components/common/EmptyState'
import { useTitle } from '@/hooks/useTitle'

// Bundle lines order by bundle_id; everything else by variant_id.
function toOrderItems(items: CartItem[]): OrderItemInput[] {
  return items.map((item) =>
    item.bundleId
      ? { bundle_id: Number(item.bundleId), quantity: item.quantity }
      : { variant_id: Number(item.variantId), quantity: item.quantity }
  )
}

type PaymentMethod = 'cod'

const paymentOptions: { value: PaymentMethod; label: string; icon?: string; color?: string }[] = [
  { value: 'cod', label: 'Cash on Delivery', icon: 'payments' },
]

export default function CartPage() {
  useTitle('Shopping Cart - Baby Gallery')
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, totalItems, subtotal } = useCartStore()
  const { user } = useAuthStore()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [promoCode, setPromoCode] = useState('')
  const [placing, setPlacing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Delivery location → drives the displayed fee. The server recomputes the
  // authoritative shipping_charge from district/area, so this is an estimate.
  const [districts, setDistricts] = useState<Location[]>([])
  const [areas, setAreas] = useState<Location[]>([])
  const [districtId, setDistrictId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [locationError, setLocationError] = useState(false)

  useEffect(() => {
    listDistricts()
      .then(setDistricts)
      .catch(() => {})
  }, [])

  const selectedDistrict = districts.find((d) => String(d.id) === districtId)
  const selectedArea = areas.find((a) => String(a.id) === areaId)

  const handleDistrictChange = (value: string) => {
    setDistrictId(value)
    setAreaId('')
    setAreas([])
    setLocationError(false)
    if (value) listAreas(value).then(setAreas).catch(() => {})
  }

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      customer_name: user?.name || '',
      customer_phone: user?.phone || '',
      customer_address: user?.address || '',
    },
  })

  const cartSubtotal = subtotal()
  // Area override → district fee → unknown (server falls back to its default).
  const resolvedFee = selectedArea?.fee ?? selectedDistrict?.fee ?? null
  const shippingKnown = resolvedFee != null
  const shippingCost = resolvedFee ?? 0
  const discount = 0
  const total = cartSubtotal + shippingCost - discount

  const handleApplyPromo = () => {
    toast('Promo code feature coming soon!')
  }

  // Silent lead capture: when a valid phone is entered but checkout isn't done.
  const lastCapturedPhone = useRef('')
  const handlePhoneBlur = () => {
    const phone = getValues('customer_phone')?.trim() ?? ''
    if (phone.length < 11 || items.length === 0 || phone === lastCapturedPhone.current) return
    lastCapturedPhone.current = phone
    captureAbandonedCart({
      customer_phone: phone,
      customer_name: getValues('customer_name')?.trim() || undefined,
      customer_address: getValues('customer_address')?.trim() || undefined,
      customer_district: selectedDistrict?.name,
      customer_area: selectedArea?.name,
      shipping_charge: shippingKnown ? shippingCost : undefined,
      order_items: toOrderItems(items),
      tracking: getStoredTracking(),
    })
  }

  const phoneField = register('customer_phone')

  const onSubmit = async (data: ShippingFormData) => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!districtId || !areaId) {
      setLocationError(true)
      toast.error('Please select your district and area')
      return
    }

    setPlacing(true)
    try {
      const order = await createOrder({
        order: {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          customer_district: selectedDistrict?.name,
          customer_area: selectedArea?.name,
        },
        order_items: toOrderItems(items),
        shipping_charge: shippingKnown ? shippingCost : undefined,
        tracking: getStoredTracking(),
      })

      clearCart()
      // The server recomputes shipping, so report its authoritative grand total.
      toast.success(`Order placed! Total ${formatCurrency(order.grand_total)}`)
      setCurrentStep(2)

      if (user) {
        router.push('/account/orders')
      } else {
        router.push('/')
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      toast.error(message)
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <EmptyState
          icon="shopping_cart"
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet. Browse our collection and find something you love!"
          action={
            <Link
              href="/shop"
              className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              Start Shopping
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Cart Items */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Shopping Cart{' '}
              <span className="text-slate-400 font-normal text-lg">
                ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
              </span>
            </h1>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              <span className="material-icons-outlined text-sm">delete_sweep</span>
              Clear Cart
            </button>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white p-4 rounded-xl border border-pink-100 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-24 h-24 bg-pink-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl || '/assets/placeholder.png'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      {item.variantName && (
                        <p className="text-xs text-slate-500 mt-1">{item.variantName}</p>
                      )}
                    </div>
                    <p className="font-bold text-lg text-primary">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-pink-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 bg-pink-50/50 hover:bg-pink-100 text-slate-600"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1 bg-pink-50/50 hover:bg-pink-100 text-slate-600"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-icons-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gift Card */}
          <div className="bg-primary/5 border border-dashed border-primary/40 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="material-icons-outlined text-primary">card_giftcard</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold">Redeem Gift Card</h4>
              <p className="text-xs text-slate-600">Use your Baby Gallery gift card balance.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Gift Card Code"
                className="bg-white border border-pink-100 rounded-lg text-sm px-3 py-2 w-32 focus:ring-primary focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => toast('Gift card feature coming soon!')}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Promo Code */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="material-icons-outlined text-primary">local_offer</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold">Have a Promo Code?</h4>
              <p className="text-xs text-slate-600">Apply your discount coupon for extra savings.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                className="bg-white border border-pink-100 rounded-lg text-sm px-3 py-2 w-32 focus:ring-primary focus:border-primary outline-none"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Checkout Sidebar */}
        <div className="lg:w-[420px] space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-xl border border-pink-100 overflow-hidden shadow-sm sticky top-24">
              {/* Step Tabs */}
              <div className="flex border-b border-pink-50">
                {['1. Shipping', '2. Payment', '3. Success'].map((step, index) => (
                  <div
                    key={step}
                    className={`flex-1 py-3 px-2 text-center text-[10px] font-bold uppercase tracking-wider border-b-2 ${
                      index <= currentStep
                        ? 'text-primary border-primary'
                        : 'text-slate-400 border-transparent'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              <div className="p-6 space-y-6">
                {/* Shipping Address */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">local_shipping</span>
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className={`w-full bg-pink-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-primary/50 outline-none ${
                          errors.customer_name ? 'ring-2 ring-red-400' : ''
                        }`}
                        {...register('customer_name')}
                      />
                      {errors.customer_name && (
                        <p className="mt-1 text-xs text-red-500">{errors.customer_name.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile Number (e.g. 01712xxxxxx)"
                        className={`w-full bg-pink-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-primary/50 outline-none ${
                          errors.customer_phone ? 'ring-2 ring-red-400' : ''
                        }`}
                        {...phoneField}
                        onBlur={(e) => {
                          phoneField.onBlur(e)
                          handlePhoneBlur()
                        }}
                      />
                      {errors.customer_phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.customer_phone.message}</p>
                      )}
                    </div>
                    <div>
                      <textarea
                        placeholder="House no, Flat no, Street name..."
                        rows={2}
                        className={`w-full bg-pink-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-primary/50 outline-none ${
                          errors.customer_address ? 'ring-2 ring-red-400' : ''
                        }`}
                        {...register('customer_address')}
                      />
                      {errors.customer_address && (
                        <p className="mt-1 text-xs text-red-500">{errors.customer_address.message}</p>
                      )}
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={districtId}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className={`w-full bg-pink-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-primary/50 outline-none ${
                            locationError && !districtId ? 'ring-2 ring-red-400' : ''
                          }`}
                        >
                          <option value="">Select District *</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={areaId}
                          onChange={(e) => {
                            setAreaId(e.target.value)
                            setLocationError(false)
                          }}
                          disabled={!districtId || areas.length === 0}
                          className={`w-full bg-pink-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-50 ${
                            locationError && !areaId ? 'ring-2 ring-red-400' : ''
                          }`}
                        >
                          <option value="">Select Area *</option>
                          {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {locationError && (
                        <p className="mt-1 text-xs text-red-500">
                          District and area are required
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-pink-50" />

                {/* Payment Method */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">account_balance_wallet</span>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(option.value)
                          setCurrentStep(1)
                        }}
                        className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-pink-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-8 w-12 flex items-center justify-center">
                          {option.icon ? (
                            <span className="material-icons-outlined text-xl text-slate-500">
                              {option.icon}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-black ${option.color}`}>
                              {option.label}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="pt-6 border-t border-pink-100 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal ({totalItems()} items)</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping Fee</span>
                    <span>
                      {!shippingKnown ? (
                        <span className="text-slate-400">Select district</span>
                      ) : shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- {formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Place Order */}
                <button
                  type="submit"
                  disabled={placing}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing && (
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  )}
                  Place Order
                  <span className="material-icons-outlined">arrow_forward</span>
                </button>

              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-pink-100 py-8 bg-white mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <span className="material-icons-outlined">auto_awesome</span>
            </div>
            <div>
              <h5 className="font-bold text-sm">Premium Quality</h5>
              <p className="text-xs text-slate-500">Curated collection for your little ones.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <span className="material-icons-outlined">local_shipping</span>
            </div>
            <div>
              <h5 className="font-bold text-sm">Fast Delivery</h5>
              <p className="text-xs text-slate-500">24h delivery inside Dhaka Metropolitan.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <span className="material-icons-outlined">workspace_premium</span>
            </div>
            <div>
              <h5 className="font-bold text-sm">Trusted Brand</h5>
              <p className="text-xs text-slate-500">Loved by 50,000+ Bangladeshi parents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
