import Link from 'next/link'

const protocols = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Technical Support', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
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

        {/* Connect */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md font-bold text-secondary uppercase">Connect</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Reach our team for sales, warranty and deployment support.</p>
          <div className="flex flex-col gap-2">
            <a
              href="tel:+8801313665522"
              className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-lg text-secondary">call</span>
              +8801313665522
            </a>
            <a
              href="https://wa.me/8801313853535"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-secondary" fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="https://www.facebook.com/techgallery.store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-secondary" fill="currentColor" aria-hidden="true">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md font-bold text-secondary uppercase">System Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-outline/10 py-6 px-margin-lg max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          © 2026 Tech Gallery. All Rights Reserved. Engineered for Performance.
        </span>
        <div className="flex gap-6">
          <span className="text-[10px] font-label-sm text-outline">SECURE · 256-BIT ENCRYPTED</span>
          <span className="text-[10px] font-label-sm text-outline">VER: 1.0.0-STABLE</span>
        </div>
      </div>
    </footer>
  )
}
