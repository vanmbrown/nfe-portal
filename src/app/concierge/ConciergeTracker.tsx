'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import { getCrmTagsForIntent } from '@/lib/customer-intelligence/tags'

function conciergeTags() {
  return getCrmTagsForIntent('concierge').join(',')
}

export function ConciergePageViewTracker() {
  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.conciergeViewed,
      area: 'concierge',
      pagePath: '/concierge',
      metadata: {
        tags: conciergeTags(),
        storage: 'admin_notification_only',
        automation: 'not_live',
      },
    })
  }, [])

  return null
}

export function TrackedConciergeLink({
  href,
  label,
  children,
  variant = 'dark',
}: {
  href: string
  label: string
  children: ReactNode
  variant?: 'dark' | 'outline'
}) {
  const classes =
    variant === 'dark'
      ? 'bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus:bg-nfe-green-700'
      : 'border border-current text-current hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper'

  return (
    <Link
      href={href}
      onClick={() =>
        trackNfeEvent({
          name: NFE_EVENT_NAMES.ctaClicked,
          area: 'concierge',
          pagePath: '/concierge',
          ctaLabel: label,
          destination: href,
          metadata: {
            conciergeAction: label,
            tags: conciergeTags(),
            storage: 'admin_notification_only',
            automation: 'not_live',
          },
        })
      }
      className={`${classes} inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors`}
    >
      {children}
    </Link>
  )
}
