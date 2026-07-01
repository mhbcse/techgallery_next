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
