import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.scss'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CookieConsent } from '@/components/shared/CookieConsent'
import SkipLinkHandler from '@/components/shared/SkipLinkHandler'
import { SOCIAL_IMAGE } from '@/lib/social-image'
import { getSiteUrl } from '@/lib/site-url'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  // Without this, every relative image in a metadata export resolves against
  // the dev origin, and each article advertised an og:image on localhost.
  metadataBase: new URL(getSiteUrl()),
  title: 'NFE Beauty',
  description: 'Not For Everyone — Well Aging Through Science',
  // Deliberately no `alternates.canonical` here: Next inherits it, so a root
  // canonical would make every page that does not override it claim to be the
  // homepage. Canonicals are declared per route.
  openGraph: {
    type: 'website',
    siteName: 'NFE Beauty',
    locale: 'en_US',
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipLinkHandler />

        <Header />

        <main id="main-content">
          {children}
        </main>

        <Footer />

        <CookieConsent />
      </body>
    </html>
  )
}
