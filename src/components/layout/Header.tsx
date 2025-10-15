import Link from 'next/link'
import PrimaryNav from './PrimaryNav'

export default function Header() {
  return (
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
  )
}

