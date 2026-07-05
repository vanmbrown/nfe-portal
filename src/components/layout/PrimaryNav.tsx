import Link from 'next/link'

const navItems = [
  { href: '/our-story', label: 'Philosophy' },
  { href: '/shop', label: 'The Atelier' },
  { href: '/science', label: 'Science' },
  { href: '/ritual', label: 'Ritual' },
  { href: '/journal', label: 'Journal' },
  { href: '/concierge', label: 'Concierge' },
]

export default function PrimaryNav() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
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


