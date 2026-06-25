'use client'

import { useEffect } from 'react'
import { captureAttribution, getSessionId, getVisitorId } from '@/lib/tracking'
import { recordVisit, confirmVisit } from '@/api/tracking'

// Captures landing-URL attribution, records a visit, and confirms it with a
// best-effort beacon. Mounted once in the public layout.
export default function AttributionTracker() {
  useEffect(() => {
    const tracking = captureAttribution()

    recordVisit({
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      referrer: tracking.referrer,
      full_url: window.location.href,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_content: tracking.utm_content,
      utm_term: tracking.utm_term,
      utm_id: tracking.utm_id,
      fbclid: tracking.fbclid,
      gclid: tracking.gclid,
      ttclid: tracking.ttclid,
      campaign_id: tracking.campaign_id,
      ad_group_id: tracking.ad_group_id,
      ad_id: tracking.ad_id,
    })
      .then((id) => confirmVisit(id, getSessionId()))
      .catch(() => {})
  }, [])

  return null
}
