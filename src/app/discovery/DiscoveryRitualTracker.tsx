'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import { getCrmTagsForIntent } from '@/lib/customer-intelligence/tags'

type DiscoveryInterest = 'face' | 'body' | 'full_ritual'

function discoveryTags() {
  return getCrmTagsForIntent('discovery').join(',')
}

export function DiscoveryPageViewTracker() {
  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.discoveryViewed,
      area: 'discovery',
      pagePath: '/discovery',
      metadata: {
        tags: discoveryTags(),
        storage: 'none',
        commerce: 'not_live',
      },
    })
  }, [])

  return null
}

export function DiscoveryInterestButton({
  interest,
  label,
}: {
  interest: DiscoveryInterest
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() =>
        trackNfeEvent({
          name: NFE_EVENT_NAMES.discoveryInterestCaptured,
          area: 'discovery',
          pagePath: '/discovery',
          ctaLabel: label,
          metadata: {
            discoveryInterest: interest,
            tags: discoveryTags(),
            storage: 'none',
            commerce: 'not_live',
          },
        })
      }
      className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-green-900 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper"
    >
      {label}
    </button>
  )
}

export function TrackedDiscoveryLink({
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
          area: 'discovery',
          pagePath: '/discovery',
          ctaLabel: label,
          destination: href,
          metadata: {
            discoveryAction: label,
            tags: discoveryTags(),
            storage: 'none',
            commerce: 'not_live',
          },
        })
      }
      className={`${classes} inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors`}
    >
      {children}
    </Link>
  )
}
