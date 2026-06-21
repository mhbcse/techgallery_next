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
    <section className="py-24 bg-surface border-t border-outline-variant">
      <div className="container mx-auto px-4">
        <div className="bg-primary-container p-8 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-outline-variant">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 blur-2xl" />
          <div className="max-w-md relative z-10">
            <h2 className="text-headline-lg font-display text-white mb-6">
              Sync with the grid
            </h2>
            <p className="text-white/70 text-body-md leading-relaxed">
              Subscribe for 10% off your first order & early access to gear drops!
            </p>
          </div>
          <div className="w-full max-w-md relative z-10">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow border border-outline-variant bg-white px-8 py-5 focus:ring-1 focus:ring-secondary outline-none text-on-surface"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-10 py-5 font-label-md uppercase tracking-widest hover:bg-secondary transition-all"
              >
                Subscribe
              </button>
            </form>
            <p className="font-label-sm uppercase tracking-wider text-white/50 mt-6 text-center sm:text-left">
              No spam, just signal. You can unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
