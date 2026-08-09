import Link from 'next/link'

import { navItems } from './navItems'

/** The navigation row from md upward. Below md the drawer in MobileNav
 *  carries the same list; both read it from ./navItems. */
export default function PrimaryNav() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="transition-colors duration-200 hover:text-nfe-gold focus:text-nfe-gold"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
