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
      <div className="w-20 h-20 mb-6 bg-red-50 rounded-full flex items-center justify-center">
        <span className="material-icons-outlined text-4xl text-red-400">
          error_outline
        </span>
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
        Something went wrong
      </h2>
      <p className="text-slate-500 mb-8 max-w-md">
        An unexpected error occurred. Please try again or go back to the homepage.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined">refresh</span>
          Try Again
        </button>
        <Link
          href="/"
          className="px-8 py-3 bg-white hover:bg-slate-50 text-primary-dark font-bold rounded-full border-2 border-primary/20 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
