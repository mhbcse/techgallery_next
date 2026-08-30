'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { createOrder } from '@/api/orders'
import { captureIncompleteOrder } from '@/api/incompleteOrders'
import { listDistricts, listAreas } from '@/api/locations'
import type { Location } from '@/api/types'
import { getStoredTracking } from '@/lib/tracking'
import { readCheckoutDetails, saveCheckoutDetails } from '@/lib/checkoutDetails'
import { toOrderItems } from '@/lib/orderItems'
import { trackInitiateCheckout } from '@/lib/pixel'
import { shippingSchema, type ShippingFormData } from '@/lib/validators'
import { formatCurrency } from '@/lib/formatCurrency'
import EmptyState from '@/components/common/EmptyState'
import { useTitle } from '@/hooks/useTitle'

const inputClass =
  'w-full bg-surface-container border border-outline-variant text-body-sm p-3 focus:ring-1 focus:ring-secondary focus:border-secondary outline-none'

export default function CartPage() {
  useTitle('Checkout - Tech Gallery')
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, totalItems, subtotal } = useCartStore()
  const { user } = useAuthStore()

  const [placing, setPlacing] = useState(false)

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

  // Fire InitiateCheckout on the shopper's first genuine checkout interaction (a real
  // keystroke in a field, or picking district/area) — never on mount/view. The per-mount
  // ref is a cheap short-circuit; the durable once-per-session dedup lives in
  // trackInitiateCheckout, so reload / SPA revisit don't re-signal.
  const checkoutTracked = useRef(false)
  const startCheckoutSignal = useCallback(() => {
    if (checkoutTracked.current) return
    const contentIds = items.map((i) => i.contentId).filter((id): id is string => !!id)
    if (contentIds.length === 0) return
    checkoutTracked.current = true
    trackInitiateCheckout({ contentIds, value: subtotal(), numItems: totalItems() })
  }, [items, subtotal, totalItems])

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
    if (value) {
      startCheckoutSignal()
      listAreas(value).then(setAreas).catch(() => {})
    }
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

  // First real keystroke in any checkout field = checkout start. `type === 'change'`
  // is only set for genuine user input; the returning-customer restore below uses
  // setValue (undefined type), so restoring saved details never triggers it.
  useEffect(() => {
    const sub = watch((_values, { type }) => {
      if (type === 'change') startCheckoutSignal()
    })
    return () => sub.unsubscribe()
  }, [watch, startCheckoutSignal])

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
      }, 400)
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
  const resolvedFee = selectedArea?.fee ?? selectedDistrict?.fee ?? null
  const shippingKnown = resolvedFee != null
  const shippingCost = resolvedFee ?? 0
  const discount = 0
  const total = cartSubtotal + shippingCost - discount

  const handleApplyPromo = () => {
    toast('Promo code feature coming soon!')
  }

  // Silent lead capture: when a valid phone is entered but checkout isn't done.
  // Stays on blur (not on-change) — it's a server call and needs a usable phone number.
  const lastCapturedPhone = useRef('')
  const handlePhoneBlur = () => {
    const phone = getValues('customer_phone')?.trim() ?? ''
    if (phone.length < 11 || items.length === 0 || phone === lastCapturedPhone.current) return
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
      await createOrder({
        order: {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          customer_district: selectedDistrict.name,
          customer_area: selectedArea?.name,
        },
        order_items: toOrderItems(items),
        shipping_charge: shippingKnown ? shippingCost : undefined,
        tracking: getStoredTracking(),
      })

      persistCheckoutDetails()

      clearCart()
      toast.success('Order placed! We’ll confirm it with you shortly.')

      if (user) router.push('/account/orders')
      else router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      toast.error(message)
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-lg py-20">
        <EmptyState
          icon="shopping_cart"
          title="Your loadout is empty"
          description="No hardware queued for deployment yet. Browse the armory and equip your setup."
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
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <h1 className="font-headline-lg text-headline-lg font-black uppercase">
              Your Cart{' '}
              <span className="text-outline font-normal text-headline-lg-mobile">
                ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
              </span>
            </h1>
            <button
              onClick={clearCart}
              className="font-label-md text-label-md uppercase tracking-wider text-red-500 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Clear
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white p-4 border border-outline-variant flex flex-col sm:flex-row gap-4"
              >
                <div className="w-24 h-24 bg-surface-container overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl || '/assets/logo-vertical-blue.png'}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-label-md text-label-md font-bold uppercase text-on-surface">{item.name}</h3>
                      {item.variantName && <p className="font-label-sm text-label-sm text-outline mt-1">{item.variantName}</p>}
                    </div>
                    <p className="font-bold text-lg text-secondary">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-outline-variant overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 hover:bg-surface-container-low text-on-surface"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-label-md text-label-md font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-surface-container-low text-on-surface"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-outline hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Checkout sidebar */}
        <div className="lg:w-[420px] space-y-6">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white border border-outline-variant overflow-hidden sticky top-24">
              <div className="p-6 space-y-6">
                {/* Shipping */}
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
                    <div className="grid grid-cols-2 gap-3">
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
                          if (e.target.value) startCheckoutSignal()
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

                {/* Payment */}
                <div className="space-y-3">
                  <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
                    Payment Method
                  </h2>
                  <div className="p-3 border border-secondary bg-secondary/5 flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">payments</span>
                    <span className="font-label-md text-label-md font-bold uppercase">Cash on Delivery</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-6 border-t border-outline-variant space-y-3 font-body-sm text-body-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})</span>
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
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-secondary">{formatCurrency(total)}</span>
                  </div>
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
          </form>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-outline-variant py-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: 'bolt', title: '24H Dispatch', body: 'Prioritized nationwide deployment.' },
            { icon: 'lock', title: 'Secure Checkout', body: '256-bit encrypted transactions.' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-4">
              <div className="bg-secondary/10 p-3 text-secondary">
                <span className="material-symbols-outlined">{b.icon}</span>
              </div>
              <div>
                <h5 className="font-label-md text-label-md font-bold uppercase">{b.title}</h5>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
