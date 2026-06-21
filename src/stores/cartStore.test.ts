import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore, type CartItem } from './cartStore'

const make = (over: Partial<CartItem> = {}): CartItem => ({
  productId: '1',
  variantId: 'v1',
  name: 'Aero-Glide Pro',
  variantName: 'Black',
  price: 100,
  quantity: 1,
  imageUrl: null,
  ...over,
})

const cart = () => useCartStore.getState()

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe('cartStore', () => {
  it('adds a new item', () => {
    cart().addItem(make())
    expect(cart().items).toHaveLength(1)
    expect(cart().items[0].variantId).toBe('v1')
  })

  it('merges quantity when the same variant is added again', () => {
    cart().addItem(make({ quantity: 1 }))
    cart().addItem(make({ quantity: 2 }))
    expect(cart().items).toHaveLength(1)
    expect(cart().items[0].quantity).toBe(3)
  })

  it('keeps separate lines for different variants', () => {
    cart().addItem(make({ variantId: 'v1' }))
    cart().addItem(make({ variantId: 'v2' }))
    expect(cart().items).toHaveLength(2)
  })

  it('updateQuantity sets a new quantity', () => {
    cart().addItem(make())
    cart().updateQuantity('v1', 5)
    expect(cart().items[0].quantity).toBe(5)
  })

  it('updateQuantity to 0 or less removes the line', () => {
    cart().addItem(make())
    cart().updateQuantity('v1', 0)
    expect(cart().items).toHaveLength(0)
  })

  it('removeItem removes the matching line', () => {
    cart().addItem(make({ variantId: 'v1' }))
    cart().addItem(make({ variantId: 'v2' }))
    cart().removeItem('v1')
    expect(cart().items).toHaveLength(1)
    expect(cart().items[0].variantId).toBe('v2')
  })

  it('clearCart empties the cart', () => {
    cart().addItem(make({ variantId: 'v1' }))
    cart().addItem(make({ variantId: 'v2' }))
    cart().clearCart()
    expect(cart().items).toHaveLength(0)
  })

  it('totalItems sums quantities across lines', () => {
    cart().addItem(make({ variantId: 'v1', quantity: 2 }))
    cart().addItem(make({ variantId: 'v2', quantity: 3 }))
    expect(cart().totalItems()).toBe(5)
  })

  it('subtotal sums price * quantity across lines', () => {
    cart().addItem(make({ variantId: 'v1', price: 100, quantity: 2 }))
    cart().addItem(make({ variantId: 'v2', price: 50, quantity: 3 }))
    expect(cart().subtotal()).toBe(350)
  })
})
