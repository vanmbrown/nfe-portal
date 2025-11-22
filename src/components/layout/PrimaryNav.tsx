import Link from 'next/link'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/articles', label: 'Articles' },
  { href: '/products', label: 'Products' },
  { href: '/science', label: 'Science' },
  { href: '/inci', label: 'Ingredients' },
  { href: '/shop', label: 'Shop' },
  { href: '/subscribe', label: 'Subscribe' },
  { href: '/focus-group/login', label: 'Focus Group', className: 'text-[#C6A664] hover:text-[#E7C686]' },
]

export default function PrimaryNav() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={item.className || "hover:text-nfe-gold focus:text-nfe-gold transition-colors duration-motion-base"}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}


