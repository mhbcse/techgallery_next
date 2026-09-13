'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { createOrder } from '@/api/orders'
import { validateCoupon } from '@/api/coupons'
import { captureIncompleteOrder } from '@/api/incompleteOrders'
import { listDistricts, listAreas } from '@/api/locations'
import type { Location } from '@/api/types'
import { getStoredTracking } from '@/lib/tracking'
import { readCheckoutDetails, saveCheckoutDetails } from '@/lib/checkoutDetails'
import {
  captureCouponFromUrl,
  clearAppliedCoupon,
  readAppliedCoupon,
  saveAppliedCoupon,
} from '@/lib/appliedCoupon'
import { toOrderItems } from '@/lib/orderItems'
import { trackInitiateCheckout } from '@/lib/pixel'
import { apiErrorMessage } from '@/lib/apiError'
import { shippingSchema, type ShippingFormData } from '@/lib/validators'
import { formatCurrency } from '@/lib/formatCurrency'
import EmptyState from '@/components/common/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { useTitle } from '@/hooks/useTitle'

const inputClass =
  'w-full bg-surface-container border border-outline-variant text-body-sm p-3 focus:ring-1 focus:ring-secondary focus:border-secondary outline-none'

// Keystrokes are coalesced before touching localStorage; selections persist immediately.
const PERSIST_DEBOUNCE_MS = 400

export default function CheckoutPage() {
  useTitle('Checkout - Tech Gallery')
  const router = useRouter()
  const { items, clearCart, totalItems, subtotal } = useCartStore()
  const { user } = useAuthStore()

  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)

  // Delivery location → drives the displayed fee. The server recomputes the
  // authoritative shipping_charge from district/area, so this is an estimate.
  const [districts, setDistricts] = useState<Location[]>([])
  const [areas, setAreas] = useState<Location[]>([])
  const [districtId, setDistrictId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [locationError, setLocationError] = useState(false)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [quotedDiscount, setQuotedDiscount] = useState<{ items: number; shipping: number } | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [couponNotice, setCouponNotice] = useState<{ kind: 'refused' | 'unchecked'; text: string } | null>(null)
  // The phone lives in react-hook-form, which does not re-render on keystroke, so the quote
  // effect cannot depend on it directly.
  const [quotePhone, setQuotePhone] = useState('')

  // Restore the held code rather than a stored discount: the quote effect re-checks it, so a
  // coupon that stopped working in the meantime is dropped instead of silently honoured.
  useEffect(() => {
    // Also captured in the public layout, but child effects run before the layout's, so a
    // link straight to /checkout?coupon=CODE would otherwise be read before it was held.
    captureCouponFromUrl()
    const held = readAppliedCoupon()
    if (held) setAppliedCode(held)
  }, [])

  useEffect(() => {
    listDistricts()
      .then(setDistricts)
      .catch(() => {})
  }, [])

  const selectedDistrict = districts.find((d) => String(d.id) === districtId)
  const selectedArea = areas.find((a) => String(a.id) === areaId)

  // Once the shopper touches the location selects, the mount-time restore must never
  // apply its (possibly slower) response over their choice.
  const locationTouched = useRef(false)

  const handleDistrictChange = (value: string) => {
    locationTouched.current = true
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      customer_name: user?.name || '',
      customer_phone: user?.phone || '',
      customer_address: user?.address || '',
    },
  })

  // The auth store persists with skipHydration and is rehydrated by a providers-level
  // effect, which runs AFTER this component's effects — so `user` is not trustworthy
  // until hydration finishes. The restore below must know the real user to decide.
  const [authHydrated, setAuthHydrated] = useState(false)
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true))
  }, [])

  // Restore the last-entered checkout details for returning customers, after auth
  // hydration. The profile is re-asserted first (hard loads compute defaultValues
  // before `user` exists) so it always wins over stored guest details. A logged-in
  // user with an address on file never gets stored details merged in at all.
  useEffect(() => {
    if (!authHydrated) return
    const profile = useAuthStore.getState().user
    const fillIfEmpty = (field: 'customer_name' | 'customer_phone' | 'customer_address', value?: string | null) => {
      if (value && !getValues(field)) setValue(field, value)
    }
    fillIfEmpty('customer_name', profile?.name)
    fillIfEmpty('customer_phone', profile?.phone)
    fillIfEmpty('customer_address', profile?.address)
    if (profile?.address) return

    const saved = readCheckoutDetails()
    fillIfEmpty('customer_name', saved.name)
    fillIfEmpty('customer_phone', saved.phone)
    fillIfEmpty('customer_address', saved.address)
    if (saved.districtId) {
      setDistrictId(saved.districtId)
      listAreas(saved.districtId)
        .then((loaded) => {
          if (locationTouched.current) return
          setAreas(loaded)
          // Only re-select the saved area if it still exists for this district.
          if (saved.areaId && loaded.some((a) => String(a.id) === saved.areaId)) setAreaId(saved.areaId)
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHydrated])

  // The one place the persisted snapshot is built (edit watcher and submit share it).
  const persistCheckoutDetails = () => {
    saveCheckoutDetails({
      name: getValues('customer_name'),
      phone: getValues('customer_phone'),
      address: getValues('customer_address'),
      districtId,
      areaId,
    })
  }

  // Persist edits as they happen (debounced) so storage always matches the last-entered
  // state; district/area selections persist immediately (they're clicks, not keystrokes).
  // Empty values never overwrite stored ones (saveCheckoutDetails merges), so an
  // accidental clear doesn't forget details. A pending save is flushed on cleanup.
  useEffect(() => {
    if (districtId || areaId) persistCheckoutDetails()
    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = watch(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        timer = undefined
        persistCheckoutDetails()
      }, PERSIST_DEBOUNCE_MS)
    })
    return () => {
      subscription.unsubscribe()
      if (timer) {
        clearTimeout(timer)
        persistCheckoutDetails()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, districtId, areaId])

  const cartSubtotal = subtotal()
  const itemCount = totalItems()
  const resolvedFee = selectedArea?.fee ?? selectedDistrict?.fee ?? null
  const shippingKnown = resolvedFee != null
  const shippingCost = resolvedFee ?? 0

  // Clamped per bucket, not once on the total, so an oversized delivery discount cannot eat
  // into the items and the displayed rows still add up to the total.
  const quoted = appliedCode ? quotedDiscount : null
  const itemDiscount = Math.min(quoted?.items ?? 0, cartSubtotal)
  const shippingDiscount = Math.min(quoted?.shipping ?? 0, shippingCost)
  const total = cartSubtotal - itemDiscount + shippingCost - shippingDiscount

  // InitiateCheckout is the arrival at checkout, matching every other platform's definition
  // of the event. Deferred until the cart store hydrates, which leaves `items` briefly empty.
  // The ref is claimed only once there is something to send — trackInitiateCheckout drops a
  // call with no content ids, and claiming first would lose the event for the whole mount.
  const checkoutSignalled = useRef(false)
  useEffect(() => {
    if (checkoutSignalled.current) return
    const contentIds = items.map((i) => i.contentId).filter((id): id is string => !!id)
    if (contentIds.length === 0) return
    checkoutSignalled.current = true
    trackInitiateCheckout({ contentIds, value: cartSubtotal, numItems: itemCount })
  }, [items, cartSubtotal, itemCount])

  // Applying a code only commits it; this effect owns every request, so applying and
  // re-quoting share one race guard and one error path.
  useEffect(() => {
    if (!appliedCode || items.length === 0) {
      setQuotedDiscount(null)
      return
    }
    let cancelled = false
    setQuoting(true)
    validateCoupon({
      code: appliedCode,
      order_items: toOrderItems(items),
      shipping_charge: resolvedFee ?? undefined,
      customer_phone: quotePhone || undefined,
    })
      .then((quote) => {
        if (cancelled) return
        if (quote.valid) {
          setQuotedDiscount({ items: quote.discount_amount, shipping: quote.shipping_discount_amount })
          setCouponNotice(null)
          setCouponInput('')
          saveAppliedCoupon(appliedCode)
          return
        }
        setAppliedCode(null)
        clearAppliedCoupon()
        setCouponNotice({ kind: 'refused', text: quote.reason })
      })
      .catch((err) => {
        if (cancelled) return
        // The hold survives: the code was never refused, only unreachable, so a later visit
        // should retry it rather than lose it.
        setAppliedCode(null)
        setCouponNotice({
          kind: 'unchecked',
          text: apiErrorMessage(err, 'We could not check that code right now.'),
        })
      })
      .finally(() => {
        if (!cancelled) setQuoting(false)
      })
    return () => {
      cancelled = true
    }
  }, [appliedCode, items, resolvedFee, quotePhone])

  const handleApplyPromo = () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponNotice(null)
    setAppliedCode(code)
  }

  const handleRemovePromo = () => {
    setAppliedCode(null)
    clearAppliedCoupon()
    setCouponNotice(null)
    setCouponInput('')
  }

  // Silent lead capture: when a valid phone is entered but checkout isn't done.
  // Stays on blur (not on-change) — it's a server call and needs a usable phone number.
  const lastCapturedPhone = useRef('')
  const handlePhoneBlur = () => {
    const phone = getValues('customer_phone')?.trim() ?? ''
    if (phone.length < 11) return
    setQuotePhone(phone)
    if (items.length === 0 || phone === lastCapturedPhone.current) return
    lastCapturedPhone.current = phone
    captureIncompleteOrder({
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
    if (quoting) return

    // Require an id that resolves to an actual option — a restored id whose district no
    // longer exists is truthy but shows the placeholder, and must not pass. Area is
    // optional; without one the shipping fee falls back to the district's.
    if (!selectedDistrict) {
      setLocationError(true)
      toast.error('Please select your district')
      return
    }

    setPlacing(true)
    try {
      const submission = await createOrder({
        order: {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          customer_district: selectedDistrict.name,
          customer_area: selectedArea?.name,
        },
        order_items: toOrderItems(items),
        shipping_charge: shippingKnown ? shippingCost : undefined,
        coupon_code: appliedCode ?? undefined,
        tracking: getStoredTracking(),
      })

      persistCheckoutDetails()

      setPlaced(true)
      clearAppliedCoupon()
      clearCart()

      router.push(`/checkout/confirmation?submission=${submission.submission_id}`)
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, 'Failed to place order. Please try again.'))
    } finally {
      setPlacing(false)
    }
  }

  // A placed order empties the cart, which is not the same situation as arriving here with
  // nothing in it — hold the transition instead of flashing the empty state under the
  // confirmation page.
  if (placed) {
    return (
      <div className="max-w-container-max mx-auto px-margin-lg py-20 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-lg py-20">
        <EmptyState
          icon="shopping_cart"
          title="Your loadout is empty"
          description="Add something to your cart before checking out."
          action={
            <Link
              href="/shop"
              className="bg-primary text-white px-8 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              Enter The Armory
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-8 pb-28 lg:pb-8">
      <h1 className="font-headline-lg text-headline-lg font-black uppercase border-b border-outline-variant pb-4 mb-8">
        Checkout
      </h1>

      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Delivery + payment */}
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-outline-variant p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  Delivery Details
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={`${inputClass} ${errors.customer_name ? 'ring-1 ring-red-400' : ''}`}
                      {...register('customer_name')}
                    />
                    {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name.message}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Mobile Number (e.g. 01712xxxxxx)"
                      className={`${inputClass} ${errors.customer_phone ? 'ring-1 ring-red-400' : ''}`}
                      {...phoneField}
                      onBlur={(e) => {
                        phoneField.onBlur(e)
                        handlePhoneBlur()
                      }}
                    />
                    {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone.message}</p>}
                  </div>
                  <div>
                    <textarea
                      placeholder="House no, Flat no, Street name..."
                      rows={2}
                      className={`${inputClass} ${errors.customer_address ? 'ring-1 ring-red-400' : ''}`}
                      {...register('customer_address')}
                    />
                    {errors.customer_address && <p className="mt-1 text-xs text-red-500">{errors.customer_address.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={districtId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className={`${inputClass} ${locationError && !selectedDistrict ? 'ring-1 ring-red-400' : ''}`}
                    >
                      <option value="">Select District *</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <select
                      value={areaId}
                      onChange={(e) => {
                        locationTouched.current = true
                        setAreaId(e.target.value)
                        setLocationError(false)
                      }}
                      disabled={!districtId || areas.length === 0}
                      className={`${inputClass} disabled:opacity-50`}
                    >
                      <option value="">Select Area (optional)</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  {locationError && <p className="text-xs text-red-500">District is required</p>}
                </div>
              </div>

              <hr className="border-outline-variant" />

              <div className="space-y-3">
                <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
                  Payment Method
                </h2>
                <div className="p-3 border border-secondary bg-secondary/5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  <div>
                    <p className="font-label-md text-label-md font-bold uppercase">Cash on Delivery</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Pay with cash when you receive your order.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/cart"
              className="inline-flex items-center gap-2 border border-outline-variant px-5 py-3 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return To Cart
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:w-[420px]">
            <div className="bg-white border border-outline-variant p-6 space-y-6 sticky top-24">
              <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
                Order Summary
              </h2>

              <ul className="space-y-3 pb-6 border-b border-outline-variant">
                {items.map((item) => (
                  <li key={item.variantId} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-container overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl || '/assets/logo-vertical-blue.png'}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-label-sm text-label-sm font-bold uppercase break-words">{item.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {item.variantName ? `${item.variantName} · ` : ''}Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-body-sm text-body-sm">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              {/* Promo code */}
              <div>
                <h3 className="font-label-md text-label-md uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_activity</span>
                  Promo Code
                </h3>

                {appliedCode ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 border border-secondary bg-secondary/5">
                    <span className="min-w-0 break-words font-label-md text-label-md font-bold uppercase">
                      {appliedCode}
                      <span className="ml-2 font-body-sm text-body-sm font-normal normal-case text-on-surface-variant">
                        {quoted ? 'applied' : 'checking…'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="shrink-0 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      // The box sits inside the form that owns Place Order, so Enter here
                      // would otherwise submit the order.
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        e.preventDefault()
                        handleApplyPromo()
                      }}
                      placeholder="Enter code"
                      aria-label="Promo code"
                      className={`${inputClass} min-w-0 flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!couponInput.trim()}
                      className="shrink-0 border border-primary text-primary px-5 font-label-md text-label-md uppercase tracking-widest hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponNotice && (
                  <p
                    role="alert"
                    className={`mt-2 break-words font-body-sm text-body-sm ${
                      couponNotice.kind === 'refused' ? 'text-red-600' : 'text-on-surface-variant'
                    }`}
                  >
                    {couponNotice.text}
                    {couponNotice.kind === 'unchecked' &&
                      ' You can try again, or place your order without it.'}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="pt-6 border-t border-outline-variant space-y-3 font-body-sm text-body-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping Fee</span>
                  <span>
                    {!shippingKnown ? (
                      <span className="text-outline">Select district</span>
                    ) : shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>
                {itemDiscount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span className="min-w-0 break-words">Discount ({appliedCode})</span>
                    <span className="text-green-600">−{formatCurrency(itemDiscount)}</span>
                  </div>
                )}
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Shipping Discount</span>
                    <span className="text-green-600">−{formatCurrency(shippingDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-secondary">{formatCurrency(total)}</span>
                </div>
                {(itemDiscount > 0 || shippingDiscount > 0) && (
                  <p className="font-label-sm text-label-sm text-on-surface-variant break-words">
                    Your discount is confirmed when the order is processed.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full bg-primary text-white py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing && <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />}
                Place Order
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Submitted by id so the bar can sit outside the form. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-outline-variant px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Total</p>
          <p className="font-bold text-lg text-secondary break-words">{formatCurrency(total)}</p>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={placing}
          className="bg-primary text-white px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placing && <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />}
          Place Order
        </button>
      </div>
    </div>
  )
}
