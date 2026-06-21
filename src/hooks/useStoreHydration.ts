'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'

export function useStoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate()
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
  }, [])
}
