'use client'

import Link from 'next/link'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="w-20 h-20 mb-6 border-2 border-secondary flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-secondary">error</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg-mobile font-black text-on-surface mb-3 uppercase">
        System Fault
      </h2>
      <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
        An unexpected error occurred. Retry the operation or return to base.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="px-8 py-3 bg-primary text-white font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">refresh</span>
          Retry
        </button>
        <Link
          href="/"
          className="px-8 py-3 bg-white text-primary font-label-md text-label-md uppercase tracking-widest border border-outline-variant hover:border-secondary transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
