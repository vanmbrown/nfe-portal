/** The maison's primary navigation, in founder-approved order.
 *
 *  One list, read by both the desktop row and the mobile drawer, so the two
 *  can never drift apart. Labels are curated names, not route names: the
 *  philosophy lives at /our-story and the atelier at /shop.
 */
export type NavItem = {
  href: string
  label: string
}

export const navItems: NavItem[] = [
  { href: '/our-story', label: 'Philosophy' },
  { href: '/shop', label: 'The Atelier' },
  { href: '/science', label: 'Science' },
  { href: '/ritual', label: 'Ritual' },
  { href: '/journal', label: 'Journal' },
  { href: '/concierge', label: 'Concierge' },
]

/** Held apart from the primary list: a quiet secondary action, never a tab. */
export const secondaryNavItem: NavItem = {
  href: '/founder-access',
  label: 'Founder Access',
}

/** True when `href` is the current route or an article beneath it. */
export function isCurrentRoute(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (pathname === href) return true
  // Journal owns the article routes, so an open article still marks Journal.
  if (href === '/journal') return pathname.startsWith('/articles')
  return false
}
