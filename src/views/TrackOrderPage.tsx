'use client'

import { useState } from 'react'
import { useTitle } from '@/hooks/useTitle'
import toast from 'react-hot-toast'

const DEMO_STEPS = [
  { label: 'Order Placed', icon: 'shopping_cart', date: 'Oct 24, 10:30 AM', status: 'done' as const },
  { label: 'Shipped', icon: 'inventory_2', date: 'Oct 25, 02:15 PM', status: 'done' as const },
  { label: 'On the Way', icon: 'local_shipping', date: 'Oct 26, 09:00 AM', status: 'current' as const },
  { label: 'Delivered', icon: 'check_circle', date: 'Pending', status: 'pending' as const },
]

const DEMO_ITEMS = [
  {
    name: 'Mechanical Keyboard - Blue Switch',
    detail: 'Layout: 87-Key TKL | Qty: 2',
    price: '৳ 1,200',
    image: '/assets/logo-vertical-blue.png',
  },
  {
    name: 'Wireless Gaming Mouse',
    detail: 'Color: Black | Qty: 1',
    price: '৳ 850',
    image: '/assets/logo-vertical-blue.png',
  },
]

export default function TrackOrderPage() {
  useTitle('Track Your Order - Tech Gallery')

  const [orderId, setOrderId] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderId.trim()) {
      toast.error('Please enter your Order ID')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast('Order tracking is coming soon!', { icon: '🚧' })
    }, 600)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <style>{`
        .progress-connector {
          flex-grow: 1;
          height: 2px;
          background-color: #f1f1f1;
          margin: 0 10px;
          margin-top: 1.25rem;
        }
        .progress-connector.active {
          background-color: #007bff;
        }
      `}</style>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-headline-lg font-display text-on-surface">Track Your Order</h1>
            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">
              Enter your details to see the status of your gear.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-surface-container-lowest p-8 border border-outline-variant">
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="orderId" className="font-label-md uppercase tracking-wider text-on-surface">
                    Order ID
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="#TG-12345"
                    className="w-full px-4 py-3 border border-outline-variant bg-white focus:ring-1 focus:ring-secondary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact" className="font-label-md uppercase tracking-wider text-on-surface">
                    Phone Number/Email
                  </label>
                  <input
                    id="contact"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-4 py-3 border border-outline-variant bg-white focus:ring-1 focus:ring-secondary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-label-md uppercase tracking-widest py-4 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <span className="material-symbols-outlined text-sm">location_on</span>
                )}
                Track Now
              </button>
            </form>
          </div>

          {/* Results Section (Demo) */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-surface-container-lowest p-8 border border-outline-variant">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-headline-lg text-on-surface">Status for Order #TG-10982</h3>
                  <p className="font-label-sm uppercase tracking-wider text-on-surface-variant">Estimated Delivery: Oct 28, 2023</p>
                </div>
                <div className="px-4 py-1 bg-secondary/10 text-secondary font-label-md uppercase tracking-wider border border-outline-variant">
                  In Transit
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative flex justify-between">
                {DEMO_STEPS.map((step, i) => (
                  <div key={step.label} className="contents">
                    <div className="flex flex-col items-center text-center relative z-10 w-24">
                      <div
                        className={`w-10 h-10 flex items-center justify-center mb-2 ${
                          step.status === 'done'
                            ? 'bg-secondary text-white'
                            : step.status === 'current'
                              ? 'bg-secondary/10 text-secondary border border-secondary'
                              : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{step.icon}</span>
                      </div>
                      <span
                        className={`font-label-sm uppercase tracking-wider block ${
                          step.status === 'current'
                            ? 'text-secondary'
                            : step.status === 'pending'
                              ? 'text-on-surface-variant'
                              : ''
                        }`}
                      >
                        {step.label}
                      </span>
                      <span
                        className={`text-[10px] ${
                          step.status === 'current' ? 'text-secondary/70' : 'text-on-surface-variant'
                        }`}
                      >
                        {step.date}
                      </span>
                    </div>
                    {i < DEMO_STEPS.length - 1 && (
                      <div
                        className={`progress-connector${step.status === 'done' ? ' active' : ''}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-surface-container-lowest p-8 border border-outline-variant">
              <h3 className="font-headline-lg text-on-surface mb-6">Order Summary</h3>
              <div className="space-y-4">
                {DEMO_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 py-2 border-b border-outline-variant last:border-0"
                  >
                    <div className="w-16 h-16 bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-body-md text-sm text-on-surface">{item.name}</h4>
                      <p className="font-label-sm uppercase tracking-wider text-on-surface-variant">{item.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-on-surface">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium text-on-surface">৳ 2,050</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping Fee</span>
                  <span className="font-medium text-on-surface">৳ 60</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="text-on-surface">Total Amount</span>
                  <span className="text-secondary">৳ 2,110</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Decorative */}
        <div className="hidden lg:block sticky top-24">
          <div className="relative group">
            {/* Blur decorations */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/5 blur-3xl" />

            {/* Hero Image */}
            <div className="relative overflow-hidden border border-outline-variant">
              <img
                src="/assets/logo-horizontal.png"
                alt="Tech workstation setup"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                <div className="text-white">
                  <h2 className="text-headline-lg font-display mb-2">Quality You Can Trust</h2>
                  <p className="text-white/80 text-sm">
                    Delivering gear to over 10,000+ Bangladeshi operators.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Card (overlapping) */}
            <div className="absolute -bottom-6 -right-6 bg-surface-container-lowest p-6 max-w-xs border border-outline-variant">
              <div className="flex gap-1 text-secondary mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
              <p className="text-xs italic text-on-surface-variant mb-2">
                "Excellent service! My order arrived much faster than I expected. The quality is
                amazing for my setup."
              </p>
              <p className="font-label-sm font-bold uppercase tracking-wider text-on-surface">
                — Sumaiya Ahmed, Dhaka
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
