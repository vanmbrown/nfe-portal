import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.scss'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CookieConsent } from '@/components/shared/CookieConsent'
import SkipLinkHandler from '@/components/shared/SkipLinkHandler'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NFE Beauty',
  description: 'Not For Everyone — Well Aging Through Science',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipLinkHandler />

        <Header />

        {/* REMOVE PageTransition — it does not exist and was breaking hydration */}
        {children}

        <Footer />

        <CookieConsent />
      </body>
    </html>
  )
}
