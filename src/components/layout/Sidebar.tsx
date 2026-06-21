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
    <aside className="w-64 bg-rose-blush min-h-screen flex flex-col fixed left-0 top-0 shadow-md z-40">
      {/* Logo */}
      <div className="p-6 border-b border-rose-light">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-icons-outlined text-primary text-3xl">child_care</span>
          <span className="text-xl font-bold tracking-tight">
            Baby <span className="text-primary">Gallery</span>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-600 hover:bg-rose-light hover:text-primary'
              }`}
            >
              <span className="material-icons-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-rose-light">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-light hover:text-red-500 transition-all w-full"
        >
          <span className="material-icons-outlined text-xl">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
