'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Spinner from '@/components/ui/Spinner'

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  // The auth store persists to localStorage and rehydrates AFTER the first
  // client render. Wait for hydration before deciding — otherwise a page
  // reload sees a null token and wrongly bounces to /login.
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace('/login')
    }
  }, [hydrated, accessToken, router])

  // Show the spinner until we know the auth state (and while redirecting out).
  if (!hydrated || !accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
