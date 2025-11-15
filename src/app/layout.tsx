import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import '../styles/globals.scss'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CookieConsent } from '@/components/shared/CookieConsent'
import SkipLinkHandler from '@/components/shared/SkipLinkHandler'
import { PageTransition } from '@/components/motion'

const nfeGaramond = localFont({
  src: [
    {
      path: '../../public/fonts/garamondpremrpro.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/garamondpremrpro.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-primary',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nfe-portal.vercel.app'),
  title: {
    template: '%s | NFE Portal',
    default: 'NFE Portal - Well Aging Through Science',
  },
  description: 'Science-backed skincare for melanated skin through barrier-first approach',
  keywords: ['skincare', 'melanated skin', 'science', 'research', 'well aging'],
  authors: [{ name: 'NFE Beauty' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nfe-portal.vercel.app',
    siteName: 'NFE Portal',
    title: 'NFE Portal - Well Aging Through Science',
    description: 'Science-backed skincare for melanated skin through barrier-first approach',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NFE Portal - Well Aging Through Science',
    description: 'Science-backed skincare for melanated skin through barrier-first approach',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nfeGaramond.variable} ${inter.variable} font-ui`}>
        <Header />
        <PageTransition>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </PageTransition>
        <Footer />
        <CookieConsent />
        <SkipLinkHandler />
      </body>
    </html>
  )
}
