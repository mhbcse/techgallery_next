import type { Metadata } from 'next'
import ProtectedContact from '@/components/common/ProtectedContact'

export const metadata: Metadata = {
  title: 'Contact - Tech Gallery',
  description: 'Get in touch with Tech Gallery. Phone, address and location for technical support and sales.',
}

// Phone & email are rendered via ProtectedContact so they never appear as
// plaintext in the server HTML (anti-scraping). Hours has no sensitive data.
const channels: { icon: string; label: string; lines: string[]; href?: string }[] = [
  {
    icon: 'schedule',
    label: 'Operating Hours',
    lines: ['Sat – Thu: 10:00 – 20:00', 'Friday: Closed'],
  },
]

const ADDRESS = 'House 2 (4C), Road 13, Block C, Banasree, Rampura, Dhaka'
const MAP_QUERY = encodeURIComponent('Tech Gallery, Banasree, Rampura, Dhaka')

export default function ContactPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-10">
      {/* Header */}
      <div className="mb-10 border-b border-outline-variant pb-6">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em]">Support Channel</span>
        <h1 className="font-headline-lg text-headline-lg font-black tracking-tight mt-2 uppercase">Contact Command</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-2xl">
          Our technical team consists of engineers, not just representatives. Reach out for sales, warranty claims or
          deployment support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: details */}
        <div className="space-y-6">
          {/* Address */}
          <div className="border-l-4 border-secondary bg-surface-container-lowest border border-outline-variant p-6 flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-2xl">location_on</span>
            <div>
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Headquarters
              </h3>
              <p className="font-body-md text-body-md text-on-surface">{ADDRESS}</p>
            </div>
          </div>

          {/* Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProtectedContact
              icon="call"
              label="Hotline"
              encoded="MDEzMTMgNjY1NTIy"
              scheme="tel"
              encodedHref="Kzg4MDEzMTM2NjU1MjI="
            />
            <ProtectedContact
              icon="mail"
              label="Email"
              encoded="aW5mb0B0ZWNoZ2FsbGVyeWJkLmNvbQ=="
              scheme="mailto"
              encodedHref="aW5mb0B0ZWNoZ2FsbGVyeWJkLmNvbQ=="
            />
            {channels.map((c) => {
              const body = (
                <>
                  <span className="material-symbols-outlined text-secondary text-2xl">{c.icon}</span>
                  <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mt-3 mb-1">
                    {c.label}
                  </h3>
                  {c.lines.map((line) => (
                    <p key={line} className="font-body-sm text-body-sm text-on-surface">{line}</p>
                  ))}
                </>
              )
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  className="border border-outline-variant bg-surface-container-lowest p-6 hover:border-secondary transition-all block"
                >
                  {body}
                </a>
              ) : (
                <div key={c.label} className="border border-outline-variant bg-surface-container-lowest p-6">
                  {body}
                </div>
              )
            })}
          </div>

          {/* Social */}
          <div className="border border-outline-variant bg-surface-container-lowest p-6">
            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/techgallery.store"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tech Gallery on Facebook"
                className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Right: map */}
        <div className="relative">
          <div className="absolute -top-3 -left-3 w-10 h-10 border-t-2 border-l-2 border-secondary z-10" />
          <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-2 border-r-2 border-secondary z-10" />
          <iframe
            title="Tech Gallery location"
            src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
            className="w-full h-[420px] lg:h-full min-h-[420px] border border-outline-variant grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}
