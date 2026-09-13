import { describe, expect, it } from 'vitest'
import { apiErrorMessage, isUnreachable } from './apiError'

const withResponse = (data: unknown) => ({ response: { data }, request: {} })
// A CORS/preflight rejection: the request went out, but JS can never read the response.
const blocked = { request: {} }

describe('apiErrorMessage', () => {
  it('prefers the first validation message', () => {
    expect(apiErrorMessage(withResponse({ messages: ['Phone already exists'] }), 'x')).toBe(
      'Phone already exists'
    )
  })

  it('falls back to the single message field', () => {
    expect(apiErrorMessage(withResponse({ message: 'Forbidden origin' }), 'x')).toBe(
      'Forbidden origin'
    )
  })

  it('uses the caller fallback when the response carries nothing useful', () => {
    expect(apiErrorMessage(withResponse({}), 'Could not create your account')).toBe(
      'Could not create your account'
    )
  })

  it('reports an unreachable server rather than a generic failure', () => {
    expect(apiErrorMessage(blocked, 'Could not create your account')).toContain(
      'Could not reach the server'
    )
  })

  it('uses the fallback for a non-request error', () => {
    expect(apiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback')
  })
})

describe('isUnreachable', () => {
  it('distinguishes a blocked request from a server rejection', () => {
    expect(isUnreachable(blocked)).toBe(true)
    expect(isUnreachable(withResponse({ message: 'nope' }))).toBe(false)
    expect(isUnreachable(new Error('boom'))).toBe(false)
  })
})
