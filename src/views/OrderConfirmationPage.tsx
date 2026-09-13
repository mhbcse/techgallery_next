'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import EmptyState from '@/components/common/EmptyState'
import { useTitle } from '@/hooks/useTitle'

export default function OrderConfirmationPage() {
  useTitle('Order Confirmed - Tech Gallery')
  const searchParams = useSearchParams()
  const submissionId = searchParams?.get('submission') ?? ''
  const { user } = useAuthStore()

  if (!submissionId) {
    return (
      <div className="max-w-container-max mx-auto px-margin-lg py-20">
        <EmptyState
          icon="receipt_long"
          title="Nothing to confirm here"
          description="This page shows the confirmation for an order you just placed."
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
    <div className="max-w-container-max mx-auto px-margin-lg py-20">
      <div className="max-w-xl mx-auto bg-white border border-outline-variant p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">check_circle</span>
        <h1 className="font-headline-lg text-headline-lg font-black uppercase">Order Received</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
          Your order is queued for processing. We&rsquo;ll call you shortly to confirm it.
        </p>

        {!user && (
          <div className="mt-8 pt-6 border-t border-outline-variant">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Create an account to track this order and check out faster next time.
            </p>
            <Link
              href="/register"
              className="inline-block mt-4 border border-primary text-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user && (
            <Link
              href="/account/orders"
              className="bg-primary text-white px-6 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              My Orders
            </Link>
          )}
          <Link
            href="/shop"
            className="border border-outline-variant px-6 py-3 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
