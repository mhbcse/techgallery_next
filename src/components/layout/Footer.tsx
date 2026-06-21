import Link from 'next/link'

const protocols = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Technical Support', href: '/contact' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Warranty Policy', href: '#' },
]

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-surface-container-highest border-t border-outline">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-margin-lg py-12 max-w-container-max mx-auto">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="font-headline-lg text-headline-lg-mobile font-bold text-on-surface"
          >
            TECH GALLERY
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            The definitive source for high-performance peripheral engineering. Designed for the relentless, built for the elite.
          </p>
        </div>

        {/* Quick Protocols */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md font-bold text-secondary uppercase">Quick Protocols</h4>
          <div className="flex flex-col gap-2">
            {protocols.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:underline decoration-secondary decoration-2 transition-all duration-200"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Sync */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md font-bold text-secondary uppercase">Newsletter Sync</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Receive hardware updates and patch notes.</p>
          <div className="flex">
            <input
              className="bg-surface border border-outline-variant px-3 py-2 text-label-md font-label-md w-full focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="EMAIL ADDRESS"
              type="email"
            />
            <button className="bg-primary text-white p-2 hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md font-bold text-secondary uppercase">System Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="flex gap-4 mt-2">
            <a className="text-on-surface-variant hover:text-secondary" href="#"><span className="material-symbols-outlined">language</span></a>
            <a className="text-on-surface-variant hover:text-secondary" href="#"><span className="material-symbols-outlined">hub</span></a>
            <a className="text-on-surface-variant hover:text-secondary" href="#"><span className="material-symbols-outlined">terminal</span></a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-outline/10 py-6 px-margin-lg max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          © 2024 Tech Gallery. All Rights Reserved. Engineered for Performance.
        </span>
        <div className="flex gap-6">
          <span className="text-[10px] font-label-sm text-outline">SECURE · 256-BIT ENCRYPTED</span>
          <span className="text-[10px] font-label-sm text-outline">VER: 1.0.0-STABLE</span>
        </div>
      </div>
    </footer>
  )
}
