'use client'

import { Toaster } from 'react-hot-toast'
import { useStoreHydration } from '@/hooks/useStoreHydration'

export default function Providers({ children }: { children: React.ReactNode }) {
  useStoreHydration()

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--font-body), Inter, sans-serif',
          },
        }}
      />
    </>
  )
}
