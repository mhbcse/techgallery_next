import { beforeEach, describe, expect, it } from 'vitest'
import { readCheckoutDetails, saveCheckoutDetails } from './checkoutDetails'

const STORAGE_KEY = 'tg_checkout'

beforeEach(() => {
  window.localStorage.clear()
})

describe('readCheckoutDetails', () => {
  it('returns an empty object when nothing is stored', () => {
    expect(readCheckoutDetails()).toEqual({})
  })

  it('returns the stored details', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Rahim', phone: '01711111111' }))

    expect(readCheckoutDetails()).toEqual({ name: 'Rahim', phone: '01711111111' })
  })

  it('returns an empty object for corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json')

    expect(readCheckoutDetails()).toEqual({})
  })

  it('returns an empty object for parseable non-object values', () => {
    for (const raw of ['null', '"a string"', '[1,2]', '42']) {
      window.localStorage.setItem(STORAGE_KEY, raw)
      expect(readCheckoutDetails()).toEqual({})
    }
  })
})

describe('saveCheckoutDetails', () => {
  it('stores trimmed values and drops empty ones', () => {
    saveCheckoutDetails({ name: '  Rahim  ', phone: '01711111111', address: '   ', email: undefined })

    expect(readCheckoutDetails()).toEqual({ name: 'Rahim', phone: '01711111111' })
  })

  it('merges over an existing entry so a partial save keeps earlier fields', () => {
    saveCheckoutDetails({ name: 'Rahim', address: 'Mirpur, Dhaka', districtId: '5', areaId: '12' })
    saveCheckoutDetails({ phone: '01722222222' })

    expect(readCheckoutDetails()).toEqual({
      name: 'Rahim',
      address: 'Mirpur, Dhaka',
      districtId: '5',
      areaId: '12',
      phone: '01722222222',
    })
  })

  it('overwrites a field when the new save has a value for it', () => {
    saveCheckoutDetails({ phone: '01711111111' })
    saveCheckoutDetails({ phone: '01722222222' })

    expect(readCheckoutDetails()).toEqual({ phone: '01722222222' })
  })
})
