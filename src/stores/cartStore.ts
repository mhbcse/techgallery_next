import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  // Unique line key. For bundle lines this is a synthetic `bundle-<id>` value.
  variantId: string
  // Set on bundle lines; the order is placed with this bundle_id instead of variant_id.
  bundleId?: string
  name: string
  variantName: string
  price: number
  quantity: number
  imageUrl: string | null
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) })
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.variantId !== variantId) })
        } else {
          set({
            items: get().items.map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i
            ),
          })
        }
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage', skipHydration: true }
  )
)
