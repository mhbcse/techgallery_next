import { describe, expect, it } from 'vitest'
import { toOrderItems } from './orderItems'
import type { CartItem } from '@/stores/cartStore'

const base: CartItem = {
  productId: '1',
  variantId: '10',
  name: 'Keyboard',
  variantName: 'Red Switch',
  price: 100,
  quantity: 1,
  imageUrl: null,
}

describe('toOrderItems', () => {
  it('maps a variant line to { variant_id, quantity }', () => {
    expect(toOrderItems([{ ...base, variantId: '10', quantity: 2 }])).toEqual([
      { variant_id: 10, quantity: 2 },
    ])
  })

  it('maps a bundle line to { bundle_id, quantity }', () => {
    expect(
      toOrderItems([{ ...base, variantId: 'bundle-5', bundleId: '5', quantity: 1 }])
    ).toEqual([{ bundle_id: 5, quantity: 1 }])
  })

  it('maps a mixed cart preserving order and casting ids to numbers', () => {
    const result = toOrderItems([
      { ...base, variantId: '10', quantity: 2 },
      { ...base, variantId: 'bundle-5', bundleId: '5', quantity: 1 },
    ])
    expect(result).toEqual([
      { variant_id: 10, quantity: 2 },
      { bundle_id: 5, quantity: 1 },
    ])
  })

  it('never includes a recaptcha token (none used in this app)', () => {
    const result = toOrderItems([base])
    expect(JSON.stringify(result)).not.toContain('recaptcha')
  })
})
