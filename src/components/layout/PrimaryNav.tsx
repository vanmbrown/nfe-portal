import Link from 'next/link'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/science', label: 'Science' },
  { href: '/shop', label: 'Shop' },
]

export default function PrimaryNav() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="hover:text-nfe-gold focus:text-nfe-gold transition-colors duration-motion-base"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

