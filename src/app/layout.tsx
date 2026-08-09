import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.scss'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CookieConsent } from '@/components/shared/CookieConsent'
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
        <Header />

        {/* Before main, not after the footer. It is visually pinned to the
            bottom, but in the document it sits early enough that a keyboard
            visitor reaches the choice without traversing the entire site
            first. It takes no focus on appearance. */}
        <CookieConsent />

        {/* tabIndex={-1} is what makes the skip link work. A fragment link
            moves focus only to something focusable; without this, activating
            "Skip to main content" scrolled the page but left focus on the link,
            so the next Tab went straight back into the navigation.

            A client-side handler used to try to force this and could not: it
            called focus() on an element that was not focusable, then cancelled
            the browser's own fragment navigation. Removed in favour of the
            native behaviour. */}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
