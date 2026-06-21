'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Breadcrumb() {
  const pathname = usePathname() ?? '/'
  const segments = pathname.split('/').filter(Boolean)

  const pathMap: Record<string, string> = {
    '/products': '/shop',
  }

  const crumbs = segments.map((segment, index) => {
    const rawPath = '/' + segments.slice(0, index + 1).join('/')
    const path = pathMap[rawPath] ?? rawPath
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    return { label, path }
  })

  return (
    <nav className="flex items-center gap-2 text-label-sm uppercase tracking-wider">
      <Link href="/" className="text-on-surface-variant hover:text-secondary transition-colors">
        Home
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
          {i === crumbs.length - 1 ? (
            <span className="text-on-surface font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.path} className="text-on-surface-variant hover:text-secondary transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
