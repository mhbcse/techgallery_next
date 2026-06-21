import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-rose-blush/30">
      <div className="w-24 h-24 mb-8 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="material-icons-outlined text-5xl text-primary">
          sentiment_dissatisfied
        </span>
      </div>
      <h1 className="text-6xl font-extrabold text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 mb-3">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined">home</span>
          Go Home
        </Link>
        <Link
          href="/shop"
          className="px-8 py-3 bg-white hover:bg-slate-50 text-primary-dark font-bold rounded-full border-2 border-primary/20 transition-all"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  )
}
