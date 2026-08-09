import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

/**
 * Skin Strategy is withdrawn from the public maison.
 *
 * It is a trade-facing prototype styled outside the maison system, and the
 * founder decision is to remove rather than restyle it: NFE should not spend
 * public-facing design effort legitimising an internal prototype. The source
 * stays so it can be relocated inside the authenticated participant
 * environment if it turns out to serve a real internal purpose.
 *
 * Same gate the token specimen under /dev already uses: 404 in any production
 * build, still reachable locally. Excluded from the sitemap and disallowed in
 * robots as well, so the three layers agree.
 */
export const metadata: Metadata = {
  title: 'Skin Strategy',
  robots: { index: false, follow: false },
}

export default function SkinStrategyLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
  return <>{children}</>
}
