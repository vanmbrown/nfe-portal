'use client'

import { useEffect } from 'react'
import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'

export function FounderAccessTracker() {
  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.founderAccessViewed,
      area: 'founder_access',
      pagePath: '/founder-access',
      source: 'founder_access',
    })
  }, [])

  return null
}
