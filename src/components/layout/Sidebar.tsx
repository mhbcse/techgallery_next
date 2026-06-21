'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

const menuItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/account' },
  { icon: 'shopping_bag', label: 'My Orders', href: '/account/orders' },
  { icon: 'favorite', label: 'Wishlist', href: '/account/wishlist' },
  { icon: 'person', label: 'My Profile', href: '/account/profile' },
  { icon: 'local_offer', label: 'Rewards', href: '#' },
  { icon: 'support_agent', label: 'Support', href: '#' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="w-64 bg-primary-container min-h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-3xl">memory</span>
          <span className="text-xl font-display font-bold tracking-tight text-white">
            Tech <span className="text-secondary">Gallery</span>
          </span>
        </Link>
      </div>

      {/* Nav menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-label-md uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-secondary text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-label-md uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-red-400 transition-all w-full"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
