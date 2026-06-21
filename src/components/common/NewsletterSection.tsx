'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      toast.success('Thanks for subscribing!')
      setEmail('')
    }
  }

  return (
    <section className="py-24 bg-white border-t border-rose-100">
      <div className="container mx-auto px-4">
        <div className="bg-rose-blush rounded-[60px] p-8 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/50 rounded-full blur-2xl" />
          <div className="max-w-md relative z-10">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
              Join our little family
            </h2>
            <p className="text-slate-600 text-lg font-medium leading-relaxed">
              Subscribe for 10% off your first order & early access to our seasonal sales!
            </p>
          </div>
          <div className="w-full max-w-md relative z-10">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow rounded-2xl border-2 border-white bg-white px-8 py-5 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm text-slate-800"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-10 py-5 rounded-2xl font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
              >
                Join Now
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-6 text-center sm:text-left font-medium">
              No spam, just sweetness. You can unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
