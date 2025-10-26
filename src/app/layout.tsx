import type { Metadata } from 'next'
import { EB_Garamond, Inter } from 'next/font/google'
import '../styles/globals.scss'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CookieConsent } from '@/components/shared/CookieConsent'

const ebGaramond = EB_Garamond({ 
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
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
      <body className={`${ebGaramond.variable} ${inter.variable} font-ui`}>
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
