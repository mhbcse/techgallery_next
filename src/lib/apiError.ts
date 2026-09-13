import { AxiosError } from 'axios'

/**
 * Turns an API failure into something worth showing a customer.
 *
 * The important case is a request that never got a readable response: browser calls are
 * authorized by `Origin` against `websites.domain`, so from any other host the preflight is
 * rejected and the browser hands JS a network error with no `response` at all. Falling back
 * to a generic "could not do that" there hides a configuration problem behind what looks
 * like a validation failure.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string; messages?: string[] }>

  if (axiosError?.response) {
    const data = axiosError.response.data
    return data?.messages?.[0] || data?.message || fallback
  }

  // Request was sent but no response could be read — CORS/preflight rejection, DNS, or the
  // API being unreachable.
  if (axiosError?.request) {
    return 'Could not reach the server. Please check your connection and try again.'
  }

  return fallback
}

/** True when the failure looks like a blocked/unreachable request rather than a rejection. */
export function isUnreachable(err: unknown): boolean {
  const axiosError = err as AxiosError
  return !axiosError?.response && !!axiosError?.request
}
