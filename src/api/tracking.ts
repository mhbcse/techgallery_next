import apiClient from './client'
import type { OrderTracking, SingleResponse } from './types'

export type VisitPayload = { session_id: string } & Pick<
  OrderTracking,
  | 'visitor_id'
  | 'referrer'
  | 'full_url'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'utm_content'
  | 'utm_term'
  | 'utm_id'
  | 'fbclid'
  | 'gclid'
  | 'ttclid'
  | 'campaign_id'
  | 'ad_group_id'
  | 'ad_id'
>

// Records a page view and returns the visit id used to confirm via trackVisit().
export async function recordVisit(payload: VisitPayload): Promise<string> {
  const res = await apiClient.post<SingleResponse<{ id: string }>>('/api/v1/visits', payload)
  return res.data.data.id
}

// Best-effort beacon confirming a real browser load. Always 204; never throws to callers.
export async function confirmVisit(id: number | string, sessionId: string): Promise<void> {
  try {
    await apiClient.post('/api/v1/_track', { id: Number(id), session_id: sessionId })
  } catch {
    // Confirmation is best-effort; swallow errors.
  }
}
