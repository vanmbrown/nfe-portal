import Link from 'next/link'
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
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="NFE Beauty — home"
              className="font-serif text-nfe-gold text-xl tracking-[0.2em] hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
            >
              NFE
            </Link>
            <PrimaryNav />
          </div>
        </div>
      </header>
    </>
  )
}


