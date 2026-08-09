import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

/**
 * Community Input is research, not part of the public maison.
 *
 * Its only public entry point was a link on /learn, which is now retired, so
 * the page was about to become an unreferenced public surface. Gated rather
 * than left quietly reachable: a route that returns 200 is a route someone can
 * find. If it earns a customer-facing purpose it should return through Founder
 * Access or Concierge deliberately, inside the authenticated architecture.
 *
 * `/api/community-input` is left in place so the page still works locally and
 * so nothing is torn out that a later decision may want back.
 */
export const metadata: Metadata = {
  title: 'Community Input',
  robots: { index: false, follow: false },
}

export default function CommunityInputLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
  return <>{children}</>
}
