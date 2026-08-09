import Link from 'next/link'

import MobileNav from './MobileNav'
import PrimaryNav from './PrimaryNav'

export default function Header() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-nfe-gold focus:text-nfe-ink focus:outline-none"
      >
        Skip to main content
      </a>
      <header role="banner" className="bg-nfe-green text-nfe-paper">
        <div className="container mx-auto px-4 py-4">
          {/* Below md: wordmark left, single mark right. From md the row
              returns, and at lg the three-column grid centres it as before. */}
          <div className="flex items-center justify-between gap-4 lg:grid lg:grid-cols-[minmax(5rem,1fr)_auto_minmax(5rem,1fr)]">
            <Link
              href="/"
              aria-label="NFE Beauty — home"
              className="font-serif text-nfe-gold text-xl tracking-[0.2em] hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
            >
              NFE
            </Link>
            <div className="hidden md:block lg:-translate-x-14">
              <PrimaryNav />
            </div>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  )
}
