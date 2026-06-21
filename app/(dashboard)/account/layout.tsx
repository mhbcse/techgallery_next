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
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [accessToken, router])

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
