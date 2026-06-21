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
    name: 'Cotton Baby Onesie - Sky Blue',
    detail: 'Size: 6-12 Months | Qty: 2',
    price: '৳ 1,200',
    image: '/assets/p-cotton-baby-onesle.webp',
  },
  {
    name: 'Soft Plush Teddy Bear',
    detail: 'Color: Brown | Qty: 1',
    price: '৳ 850',
    image: '/assets/p-soft-plush-teddy-bear.webp',
  },
]

export default function TrackOrderPage() {
  useTitle('Track Your Order - Baby Gallery')

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
          background-color: #fb7185;
        }
      `}</style>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900">Track Your Order</h1>
            <p className="text-slate-500">
              Enter your details to see the status of your little one's goodies.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white p-8 rounded-xl border border-primary/10 shadow-xl shadow-primary/5">
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="orderId" className="text-sm font-semibold text-slate-700">
                    Order ID
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="#BG-12345"
                    className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-rose-blush focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact" className="text-sm font-semibold text-slate-700">
                    Phone Number/Email
                  </label>
                  <input
                    id="contact"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-rose-blush focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <span className="material-icons-outlined text-sm">location_on</span>
                )}
                Track Now
              </button>
            </form>
          </div>

          {/* Results Section (Demo) */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white p-8 rounded-xl border border-primary/10 shadow-xl shadow-primary/5">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-lg font-bold">Status for Order #BG-10982</h3>
                  <p className="text-sm text-slate-500">Estimated Delivery: Oct 28, 2023</p>
                </div>
                <div className="px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                  In Transit
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative flex justify-between">
                {DEMO_STEPS.map((step, i) => (
                  <div key={step.label} className="contents">
                    <div className="flex flex-col items-center text-center relative z-10 w-24">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          step.status === 'done'
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : step.status === 'current'
                              ? 'bg-primary/20 text-primary border-2 border-primary'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <span className="material-icons-outlined text-sm">{step.icon}</span>
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          step.status === 'current'
                            ? 'text-primary'
                            : step.status === 'pending'
                              ? 'text-slate-400'
                              : ''
                        }`}
                      >
                        {step.label}
                      </span>
                      <span
                        className={`text-[10px] ${
                          step.status === 'current' ? 'text-primary/70' : 'text-slate-400'
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
            <div className="bg-white p-8 rounded-xl border border-primary/10 shadow-xl shadow-primary/5">
              <h3 className="text-lg font-bold mb-6">Order Summary</h3>
              <div className="space-y-4">
                {DEMO_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">৳ 2,050</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping Fee</span>
                  <span className="font-medium">৳ 60</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">৳ 2,110</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Decorative */}
        <div className="hidden lg:block sticky top-24">
          <div className="relative group">
            {/* Blur decorations */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
              <img
                src="/assets/track-order-baby.webp"
                alt="Happy toddler playing"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Quality You Can Trust</h2>
                  <p className="text-white/80 text-sm">
                    Delivering joy and comfort to over 10,000+ Bangladeshi families.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Card (overlapping) */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-xs border border-primary/10">
              <div className="flex gap-1 text-primary mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-icons-outlined text-sm">star</span>
                ))}
              </div>
              <p className="text-xs italic text-slate-600 mb-2">
                "Excellent service! My order arrived much faster than I expected. The quality is
                amazing for my little one."
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider">
                — Sumaiya Ahmed, Dhaka
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
