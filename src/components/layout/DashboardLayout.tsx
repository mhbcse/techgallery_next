'use client'

import Sidebar from './Sidebar'
import { useAuthStore } from '@/stores/authStore'
import Breadcrumb from '../common/Breadcrumb'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-surface-container-lowest border-b border-outline-variant px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <Breadcrumb />
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-on-surface-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-lg">person</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-body-sm font-semibold text-on-surface">{user?.name || 'User'}</p>
                <p className="text-label-sm text-on-surface-variant">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
