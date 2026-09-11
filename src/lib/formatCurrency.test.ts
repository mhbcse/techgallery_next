import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPriceRange } from './formatCurrency'

describe('formatPriceRange', () => {
  it('quotes one figure when every variant costs the same', () => {
    expect(formatPriceRange(8500, 8500)).toBe(formatCurrency(8500))
  })

  it('spans both ends when the variants differ', () => {
    expect(formatPriceRange(450, 900)).toBe('৳450 – ৳900')
  })

  it('falls back to the low end when there is no upper bound', () => {
    expect(formatPriceRange(450, null)).toBe('৳450')
    expect(formatPriceRange(450)).toBe('৳450')
  })
})
