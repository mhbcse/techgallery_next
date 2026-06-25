'use client'

import { useEffect, useState } from 'react'

type Props = {
  icon: string
  label: string
  /** base64-encoded display text, decoded client-side after mount */
  encoded: string
  /** link scheme used to build the href from the decoded value */
  scheme: 'tel' | 'mailto'
  /** base64-encoded href target (digits for tel, address for mailto) */
  encodedHref: string
}

/**
 * Renders a contact channel (phone/email) without ever placing the real value
 * in the server-rendered HTML. The plaintext and `tel:`/`mailto:` href are
 * reassembled from base64 only after hydration, so naive HTML scrapers that
 * don't run JS never see the address.
 */
export default function ProtectedContact({ icon, label, encoded, scheme, encodedHref }: Props) {
  const [revealed, setRevealed] = useState<{ text: string; href: string } | null>(null)

  useEffect(() => {
    try {
      setRevealed({ text: atob(encoded), href: `${scheme}:${atob(encodedHref)}` })
    } catch {}
  }, [encoded, encodedHref, scheme])

  const cardClass =
    'border border-outline-variant bg-surface-container-lowest p-6 hover:border-secondary transition-all block'
  const inner = (
    <>
      <span className="material-symbols-outlined text-secondary text-2xl">{icon}</span>
      <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant mt-3 mb-1">
        {label}
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface">{revealed ? revealed.text : '••••••••'}</p>
    </>
  )

  return revealed ? (
    <a href={revealed.href} className={cardClass}>
      {inner}
    </a>
  ) : (
    <div className={cardClass} aria-label={`${label} hidden until page loads`}>
      {inner}
    </div>
  )
}
