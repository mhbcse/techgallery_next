'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Keyboards', href: '/shop?search=keyboard' },
  { label: 'Mice', href: '/shop?search=mouse' },
  { label: 'Audio', href: '/shop?search=headset' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const totalItems = useCartStore((s) => s.totalItems())
  const user = useAuthStore((s) => s.user)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant">
      <nav className="flex justify-between items-center h-16 px-gutter-md max-w-container-max mx-auto">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface-variant hover:text-secondary"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

          <Link
            href="/"
            className="font-headline-lg text-headline-lg-mobile font-black text-primary tracking-tighter whitespace-nowrap"
          >
            TECH GALLERY
          </Link>

          <div className="hidden md:flex gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-label-md text-label-md uppercase tracking-wider pb-1 transition-colors ${
                  i === 0
                    ? 'text-secondary border-b-2 border-secondary'
                    : 'text-on-surface-variant hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-surface-container border border-outline-variant px-3 py-1 skew-box"
          >
            <button type="submit" className="skew-box-content flex items-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            </button>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-label-md font-label-md skew-box-content placeholder:text-outline w-40"
              placeholder="SYSTEM SEARCH..."
              type="text"
            />
          </form>

          <div className="flex gap-2">
            <Link
              href="/cart"
              className="relative p-2 hover:bg-surface-container-low transition-colors active:scale-95 duration-75"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              href={user ? '/account' : '/login'}
              className="p-2 hover:bg-surface-container-low transition-colors active:scale-95 duration-75"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface">
          <div className="p-4 space-y-2">
            <form onSubmit={handleSearch} className="mb-4 flex items-center bg-surface-container border border-outline-variant px-3 py-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-label-md font-label-md placeholder:text-outline w-full ml-2"
                placeholder="SYSTEM SEARCH..."
                type="text"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
