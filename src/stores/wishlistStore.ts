import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  slug: string | null
  name: string
  price: number | null
  originalPrice: number | null
  imageUrl: string | null
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearAll: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().items.find((i) => i.productId === item.productId)) {
          set({ items: [...get().items, item] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId)
      },

      clearAll: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage', skipHydration: true }
  )
)
