import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  captureCouponFromUrl,
  clearAppliedCoupon,
  readAppliedCoupon,
  saveAppliedCoupon,
} from './appliedCoupon'

const STORAGE_KEY = 'tg_coupon'

const landOn = (search: string) => {
  window.history.replaceState({}, '', `/${search}`)
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  landOn('')
})

describe('readAppliedCoupon', () => {
  it('returns nothing when no code is held', () => {
    expect(readAppliedCoupon()).toBeNull()
  })

  it('returns a held code', () => {
    saveAppliedCoupon('COHORT3')
    expect(readAppliedCoupon()).toBe('COHORT3')
  })

  it('drops an expired hold', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code: 'COHORT3', expiresAt: Date.now() - 1 })
    )
    expect(readAppliedCoupon()).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('ignores a malformed entry', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json')
    expect(readAppliedCoupon()).toBeNull()
  })
})

describe('saveAppliedCoupon', () => {
  it('does not extend the deadline when the same code is re-held', () => {
    saveAppliedCoupon('COHORT3')
    const first = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).expiresAt

    saveAppliedCoupon('COHORT3')

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).expiresAt).toBe(first)
  })

  it('starts a new deadline for a different code', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code: 'OLD', expiresAt: Date.now() + 1000 })
    )

    saveAppliedCoupon('COHORT3')

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)
    expect(stored.code).toBe('COHORT3')
    expect(stored.expiresAt).toBeGreaterThan(Date.now() + 1000)
  })
})

describe('captureCouponFromUrl', () => {
  it('holds a code from the landing URL', () => {
    landOn('?coupon=COHORT3')

    captureCouponFromUrl()

    expect(readAppliedCoupon()).toBe('COHORT3')
  })

  it('holds a code alongside other campaign params', () => {
    landOn('?utm_source=facebook&coupon=COHORT3&fbclid=abc')

    captureCouponFromUrl()

    expect(readAppliedCoupon()).toBe('COHORT3')
  })

  it('replaces a code that was already being held', () => {
    saveAppliedCoupon('OLD')
    landOn('?coupon=COHORT3')

    captureCouponFromUrl()

    expect(readAppliedCoupon()).toBe('COHORT3')
  })

  it('keeps the held code when the URL carries none', () => {
    saveAppliedCoupon('COHORT3')
    landOn('?utm_source=facebook')

    captureCouponFromUrl()

    expect(readAppliedCoupon()).toBe('COHORT3')
  })

  it('ignores an empty param', () => {
    landOn('?coupon=%20%20')

    captureCouponFromUrl()

    expect(readAppliedCoupon()).toBeNull()
  })
})

describe('clearAppliedCoupon', () => {
  it('releases the hold', () => {
    saveAppliedCoupon('COHORT3')

    clearAppliedCoupon()

    expect(readAppliedCoupon()).toBeNull()
  })
})
