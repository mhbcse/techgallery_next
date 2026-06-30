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
import { captureAbandonedCart } from '@/api/abandonedCarts'
import { listDistricts, listAreas } from '@/api/locations'
import type { Location } from '@/api/types'
import { getStoredTracking } from '@/lib/tracking'
import { toOrderItems } from '@/lib/orderItems'
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
  const { user, register: registerUser } = useAuthStore()

  const [promoCode, setPromoCode] = useState('')
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
      // Optional account creation. Must happen BEFORE the order: placing an order
      // auto-creates a customer keyed on phone, so a later register would collide.
      // Registering first logs the shopper in, and the order then links to that account.
      let createdAccount = false
      if (!user && data.customer_password) {
        try {
          await registerUser({
            name: data.customer_name,
            phone: data.customer_phone,
            email: data.customer_email!, // guaranteed present by the schema refine
            password: data.customer_password,
            address: data.customer_address,
          })
          createdAccount = true
        } catch (err: unknown) {
          // Don't block checkout — place the order as a guest and nudge to log in.
          const body = (err as { response?: { data?: { messages?: string[]; message?: string } } }).response?.data
          toast(body?.messages?.[0] || 'Could not create an account; placing your order as a guest.', { icon: 'ℹ️' })
        }
      }

      await createOrder({
        order: {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          customer_email: data.customer_email || undefined,
          customer_district: selectedDistrict?.name,
          customer_area: selectedArea?.name,
        },
        order_items: toOrderItems(items),
        shipping_charge: shippingKnown ? shippingCost : undefined,
        tracking: getStoredTracking(),
      })

      clearCart()
      toast.success('Order placed! We’ll confirm it with you shortly.')

      if (user || createdAccount) router.push('/account/orders')
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
    <div className="max-w-container-max mx-auto px-margin-lg py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <h1 className="font-headline-lg text-headline-lg font-black uppercase">
              Loadout{' '}
              <span className="text-outline font-normal text-headline-lg-mobile">
                ({totalItems()} {totalItems() === 1 ? 'unit' : 'units'})
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

          {/* Promo code */}
          <div className="bg-secondary/5 border border-secondary/20 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="material-symbols-outlined text-secondary">local_offer</span>
            <div className="flex-1">
              <h4 className="font-label-md text-label-md font-bold uppercase">Have a Promo Code?</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Apply your access code for extra savings.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="CODE"
                className="bg-white border border-outline-variant text-label-md font-label-md px-3 py-2 w-32 focus:ring-1 focus:ring-secondary outline-none"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-primary text-white px-4 py-2 font-label-md text-label-md uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Checkout sidebar */}
        <div className="lg:w-[420px] space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white border border-outline-variant overflow-hidden sticky top-24">
              <div className="bg-primary text-white px-6 py-4">
                <h2 className="font-label-md text-label-md uppercase tracking-[0.2em]">Deployment Manifest</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Shipping */}
                <div className="space-y-4">
                  <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">local_shipping</span>
                    Shipping Address
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
                    {!user && (
                      <>
                        <div>
                          <input
                            type="email"
                            placeholder="Email (optional)"
                            className={`${inputClass} ${errors.customer_email ? 'ring-1 ring-red-400' : ''}`}
                            {...register('customer_email')}
                          />
                          {errors.customer_email && <p className="mt-1 text-xs text-red-500">{errors.customer_email.message}</p>}
                        </div>
                        <div>
                          <input
                            type="password"
                            placeholder="Create a password (optional)"
                            className={`${inputClass} ${errors.customer_password ? 'ring-1 ring-red-400' : ''}`}
                            {...register('customer_password')}
                          />
                          {errors.customer_password ? (
                            <p className="mt-1 text-xs text-red-500">{errors.customer_password.message}</p>
                          ) : (
                            <p className="mt-1 text-xs text-on-surface-variant">
                              Set a password to track your orders faster next time (needs an email).
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={districtId}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className={`${inputClass} ${locationError && !districtId ? 'ring-1 ring-red-400' : ''}`}
                      >
                        <option value="">Select District *</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <select
                        value={areaId}
                        onChange={(e) => {
                          setAreaId(e.target.value)
                          setLocationError(false)
                        }}
                        disabled={!districtId || areas.length === 0}
                        className={`${inputClass} disabled:opacity-50 ${locationError && !areaId ? 'ring-1 ring-red-400' : ''}`}
                      >
                        <option value="">Select Area *</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    {locationError && <p className="text-xs text-red-500">District and area are required</p>}
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
                    <span>Subtotal ({totalItems()} units)</span>
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
                  Confirm Order
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
    </div>
  )
}
