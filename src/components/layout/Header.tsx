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
            <Link href="/" className="text-xl font-primary font-bold">
              NFE Portal
            </Link>
            <PrimaryNav />
          </div>
        </div>
      </header>
    </>
  )
}


