import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-tertiary-container industrial-grid">
      <div className="w-24 h-24 mb-8 border-2 border-secondary flex items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-secondary">error</span>
      </div>
      <h1 className="font-display-lg text-display-lg font-black text-white mb-2">404</h1>
      <h2 className="font-headline-lg text-headline-lg-mobile font-bold text-white mb-3 uppercase">Signal Lost</h2>
      <p className="font-body-md text-body-md text-outline-variant mb-8 max-w-md">
        The requested route does not exist or has been decommissioned.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="px-8 py-3 bg-secondary text-white font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">home</span>
          Return Home
        </Link>
        <Link
          href="/shop"
          className="px-8 py-3 bg-transparent text-white font-label-md text-label-md uppercase tracking-widest border border-outline hover:bg-white/10 transition-all"
        >
          Browse Armory
        </Link>
      </div>
    </div>
  )
}
