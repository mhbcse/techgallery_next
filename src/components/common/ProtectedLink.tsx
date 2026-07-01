'use client'

import { useEffect, useState, type ReactNode } from 'react'

type Props = {
  /** base64-encoded full href (e.g. "tel:+880..." or "https://wa.me/..."), decoded client-side after mount */
  encodedHref: string
  /** optional base64-encoded visible text, decoded client-side (kept out of server HTML) */
  encodedText?: string
  className?: string
  target?: string
  rel?: string
  children?: ReactNode
}

/**
 * Renders a contact link (phone/WhatsApp) without ever placing the real value
 * in the server-rendered HTML. The href — and optionally the visible text — are
 * reassembled from base64 only after hydration, so naive HTML scrapers that
 * don't run JS never see the number.
 */
export default function ProtectedLink({ encodedHref, encodedText, className, target, rel, children }: Props) {
  const [href, setHref] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    try {
      setHref(atob(encodedHref))
      if (encodedText) setText(atob(encodedText))
    } catch {}
  }, [encodedHref, encodedText])

  const visibleText = encodedText ? text ?? '••••••••' : null

  if (!href) {
    return (
      <button type="button" className={className} disabled>
        {children}
        {visibleText}
      </button>
    )
  }

  return (
    <a href={href} className={className} target={target} rel={rel}>
      {children}
      {visibleText}
    </a>
  )
}
