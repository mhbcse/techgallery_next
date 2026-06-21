'use client'

import Sidebar from './Sidebar'
import { useAuthStore } from '@/stores/authStore'
import Breadcrumb from '../common/Breadcrumb'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <Breadcrumb />
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
              <span className="material-icons-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-icons-outlined text-primary text-lg">person</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400">{user?.email || ''}</p>
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
