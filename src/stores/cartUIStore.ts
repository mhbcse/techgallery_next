import { create } from 'zustand'
import type { CartItem } from './cartStore'
import type { Product } from '@/api/types'

// Drives the "added to cart" popup that surfaces related products + a checkout CTA.
interface CartUIState {
  open: boolean
  addedItem: CartItem | null
  related: Product[]
  openCartAdded: (item: CartItem, related: Product[]) => void
  close: () => void
}

export const useCartUIStore = create<CartUIState>((set) => ({
  open: false,
  addedItem: null,
  related: [],
  openCartAdded: (addedItem, related) => set({ open: true, addedItem, related }),
  close: () => set({ open: false }),
}))
